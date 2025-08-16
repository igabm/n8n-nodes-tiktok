import type {
  IAuthenticateGeneric,
  ICredentialDataDecryptedObject,
  ICredentialTestRequest,
  ICredentialType,
  IHttpRequestHelper,
  IHttpRequestOptions,
  INodeProperties,
} from "n8n-workflow";

type OAuthData = {
  code?: string;
  redirectUri?: string;
  refresh_token?: string;

  // Callback passthroughs
  callbackQueryParameters?: Record<string, string>;
  rawQueryString?: string;

  // CSRF expectations you stash at kickoff
  expected_state_token?: string;
  expected_state_cid?: string;
  expected_state_max_age_ms?: number;

  // Optional cached user info
  user?: {
    open_id?: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };

  // Token fields (persisted by preAuthentication)
  access_token?: string;
};

// ---------- Helper functions (TOP LEVEL, not methods) ----------

function parseCallback(oauthData?: OAuthData) {
  let qp: Record<string, string> = oauthData?.callbackQueryParameters ?? {};
  if (oauthData?.rawQueryString) {
    const params = new URLSearchParams(oauthData.rawQueryString);
    for (const [k, v] of params.entries()) qp[k] = v;
  }
  if (oauthData?.code && !qp.code) qp.code = oauthData.code;
  return {
    code: qp.code as string | undefined,
    state: qp.state as string | undefined,
  };
}

function base64urlToJson<T = any>(b64url: string): T {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "===".slice((b64.length + 3) % 4);
  const raw = Buffer.from(padded, "base64").toString("utf8");
  return JSON.parse(raw) as T;
}

function getExpectedFromCreds(
  credentials: ICredentialDataDecryptedObject,
  oauthData?: OAuthData
) {
  const token =
    (credentials.expectedStateToken as string | undefined)?.trim() ||
    oauthData?.expected_state_token;
  const cid =
    (credentials.expectedStateCid as string | undefined)?.trim() ||
    oauthData?.expected_state_cid;
  const maxAgeMs =
    (typeof credentials.stateMaxAgeMinutes === "number" &&
    credentials.stateMaxAgeMinutes > 0
      ? Math.floor(credentials.stateMaxAgeMinutes * 60_000)
      : undefined) ||
    oauthData?.expected_state_max_age_ms ||
    10 * 60_000; // default 10 minutes
  return { token, cid, maxAgeMs };
}

function validateStateOrThrow(
  stateRaw: string,
  expected: { token?: string; cid?: string; maxAgeMs?: number }
) {
  let parsed: { token?: string; cid?: string; createdAt?: number };
  try {
    parsed = base64urlToJson(stateRaw);
  } catch {
    throw new Error("TikTok OAuth2: state is not valid base64url JSON.");
  }

  if (expected.token && parsed.token !== expected.token) {
    throw new Error("TikTok OAuth2: invalid state token (CSRF).");
  }
  if (expected.cid && parsed.cid !== expected.cid) {
    throw new Error("TikTok OAuth2: invalid state cid (CSRF).");
  }
  if (expected.maxAgeMs && parsed.createdAt) {
    const age = Date.now() - Number(parsed.createdAt);
    if (age < 0 || age > expected.maxAgeMs) {
      throw new Error(
        "TikTok OAuth2: state expired or issued in the future (CSRF)."
      );
    }
  }
}

async function fetchUserInfo(http: IHttpRequestHelper, accessToken: string) {
  const resp = await http.helpers.httpRequest({
    method: "GET",
    url: "https://open.tiktokapis.com/v2/user/info/",
    qs: { fields: "open_id,username,display_name,avatar_url" },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const u = resp?.data?.user ?? {};
  return {
    open_id: u.open_id as string | undefined,
    username: u.username as string | undefined,
    display_name: u.display_name as string | undefined,
    avatar_url: u.avatar_url as string | undefined,
  };
}

// ---------------- Credential ----------------

export class TikTokOAuth2Api implements ICredentialType {
  name = "tiktokOAuth2Api";
  extends = ["oAuth2Api"];
  displayName = "TikTok OAuth2 API";
  documentationUrl =
    "https://developers.tiktok.com/doc/oauth-user-access-token-management";
  icon = {
    light: "file:icons/TikTok.svg",
    dark: "file:icons/TikTok.dark.svg",
  } as const;

  properties: INodeProperties[] = [
    {
      displayName: "Authorization URL",
      name: "authUrl",
      type: "hidden",
      default: "https://www.tiktok.com/v2/auth/authorize/",
    },

    // TikTok wants client creds in the token request BODY
    {
      displayName: "Authentication",
      name: "authentication",
      type: "hidden",
      default: "body",
    },

    {
      displayName: "Access Token URL",
      name: "accessTokenUrl",
      type: "hidden",
      default: "https://open.tiktokapis.com/v2/oauth/token/",
    },
    {
      displayName: "Grant Type",
      name: "grantType",
      type: "hidden",
      default: "authorizationCode",
    },

    {
      displayName: "Client Key",
      name: "clientId",
      type: "string",
      typeOptions: { password: true },
      required: true,
      default: "",
      description: "TikTok Client Key (client_key).",
    },
    {
      displayName: "Client Secret",
      name: "clientSecret",
      type: "string",
      typeOptions: { password: true },
      required: true,
      default: "",
      description: "TikTok Client Secret.",
    },
    {
      displayName: "Scope",
      name: "scope",
      type: "string",
      default:
        "video.upload,video.publish,user.info.basic,user.info.profile,user.info.stats",
      description: "Comma-separated scopes.",
    },
    {
      displayName: "Auth URI Query Parameters",
      name: "authQueryParameters",
      type: "hidden",
      default:
        '={{"response_type=code&client_key="+encodeURIComponent($self["clientId"])}}',
    },

    // Optional CSRF inputs via UI
    {
      displayName: "Expected State Token (optional)",
      name: "expectedStateToken",
      typeOptions: { password: true },
      type: "string",
      default: "",
    },
    {
      displayName: "Expected State CID (optional)",
      name: "expectedStateCid",
      type: "string",
      default: "",
    },
    {
      displayName: "Require State",
      name: "stateRequired",
      type: "boolean",
      default: true,
    },
    {
      displayName: "Max State Age (minutes)",
      name: "stateMaxAgeMinutes",
      type: "number",
      default: 10,
    },
  ];

  async preAuthentication(
    this: IHttpRequestHelper,
    credentials: ICredentialDataDecryptedObject
  ) {
    const url = "https://open.tiktokapis.com/v2/oauth/token/";
    const oauthData = credentials.oauthTokenData as OAuthData | undefined;

    // ---- Refresh path ------------------------------------------------------
    if (oauthData?.refresh_token) {
      const options: IHttpRequestOptions = {
        method: "POST",
        url,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: credentials.clientId as string,
          client_secret: credentials.clientSecret as string,
          grant_type: "refresh_token",
          refresh_token: oauthData.refresh_token,
        }).toString(),
      };
      const resp = (await this.helpers.httpRequest(options)) as any;

      const user =
        oauthData.user ??
        (await fetchUserInfo(this, resp.access_token).catch(() => undefined));

      return {
        oauthTokenData: {
          access_token: resp.access_token,
          refresh_token: resp.refresh_token ?? oauthData.refresh_token,
          expires_in: resp.expires_in,
          token_type: resp.token_type || "Bearer",
          scope: resp.scope,
          open_id: resp.open_id,
          refresh_expires_in: resp.refresh_expires_in,
          redirectUri: oauthData?.redirectUri,
          expected_state_token: oauthData?.expected_state_token,
          expected_state_cid: oauthData?.expected_state_cid,
          expected_state_max_age_ms: oauthData?.expected_state_max_age_ms,
          user,
        },
      };
    }

    // ---- Authorization code path + CSRF -----------------------------------
    const { code, state } = parseCallback(oauthData);
    const stateRequired = Boolean(credentials.stateRequired ?? true);
    if (stateRequired && !state) {
      throw new Error("TikTok OAuth2: missing `state` in callback (CSRF).");
    }

    const expected = getExpectedFromCreds(credentials, oauthData);
    if (state) validateStateOrThrow(state, expected);
    if (!code)
      throw new Error(
        "TikTok OAuth2: missing authorization `code` in callback."
      );

    const redirectUri =
      oauthData?.redirectUri ||
      // Prefer not to hardcode; ensure you persist the exact authorize redirect here
      // 'https://auto.abc-cash.org/rest/oauth2-credential/callback'
      undefined;

    if (!redirectUri) {
      throw new Error(
        "TikTok OAuth2: missing redirect_uri; must exactly match the authorize step."
      );
    }

    const body: Record<string, string> = {
      client_key: credentials.clientId as string,
      client_secret: credentials.clientSecret as string,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    };

    const tokenResp = (await this.helpers.httpRequest({
      method: "POST",
      url,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    })) as any;

    // Optional: fetch user for a nice UX; ignore failures
    const user = await fetchUserInfo(this, tokenResp.access_token).catch(
      () => undefined
    );

    return {
      oauthTokenData: {
        access_token: tokenResp.access_token,
        refresh_token: tokenResp.refresh_token,
        expires_in: tokenResp.expires_in,
        token_type: tokenResp.token_type || "Bearer",
        scope: tokenResp.scope,
        open_id: tokenResp.open_id,
        refresh_expires_in: tokenResp.refresh_expires_in,

        redirectUri,
        expected_state_token: expected.token,
        expected_state_cid: expected.cid,
        expected_state_max_age_ms: expected.maxAgeMs,
        user,
      },
    };
  }

  // Sign requests from saved token
  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        Authorization: "=Bearer {{$credentials.oauthTokenData.access_token}}",
      },
    },
  };

  // n8n typing: must be a plain request definition (not a function)
  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://open.tiktokapis.com",
      url: "/v2/user/info/?fields=open_id,username,display_name",
    },
  };
}
