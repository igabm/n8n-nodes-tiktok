import type {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class TikTokOAuth2Api implements ICredentialType {
	name = 'tiktokOAuth2Api';

	displayName = 'TikTok OAuth2 API';

	documentationUrl = 'https://developers.tiktok.com/doc/oauth-user-access-token-management';

	icon = { light: 'file:icons/TikTok.svg', dark: 'file:icons/TikTok.dark.svg' } as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Client Key',
			name: 'clientKey',
			type: 'string',
			required: true,
			default: '',
			description: 'The unique key provided to your application in TikTok Developer portal.',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
			description: 'The secret key associated with your application.',
		},
		{
			displayName: 'Redirect URI',
			name: 'redirectUri',
			type: 'string',
			required: true,
			default: '',
			description: 'The redirect URI used in the authorization flow.',
		},
		{
			displayName: 'Authorization Code',
			name: 'authorizationCode',
			type: 'string',
			default: '',
			description: 'The authorization code received after user consent. Needed for initial token request.',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
			},
			default: '',
		},
		{
			displayName: 'Refresh Token',
			name: 'refreshToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
			},
			default: '',
		},
	];

	// Function to handle pre-authentication (exchanging authorization code for access token)
	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		const url = 'https://open.tiktokapis.com/v2/oauth/token/';
		const { access_token, refresh_token } = (await this.helpers.httpRequest({
			method: 'POST',
			url,
			body: {
				client_key: credentials.clientKey,
				client_secret: credentials.clientSecret,
				code: credentials.authorizationCode, // The authorization code
				grant_type: 'authorization_code',
				redirect_uri: credentials.redirectUri,
			},
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})) as { access_token: string; refresh_token: string };
		
		return {
			accessToken: access_token,
			refreshToken: refresh_token,
		};
	}

	// OAuth2 authenticate method using the obtained access token
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	// Credential test request to validate connection
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://open.tiktokapis.com',
			url: '/v2/user/info/',
		},
	};
}
