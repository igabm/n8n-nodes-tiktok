import type { ICredentialType, INodeProperties } from 'n8n-workflow';

const scopes = [
	'user.info.basic',
	'video.list',
	'video.upload',
	'video.delete',
	'video.comment',
	'video.like',
];

export class TikTokOAuth2Api implements ICredentialType {
	name = 'tiktokOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'TikTok OAuth2 API';

	documentationUrl = 'https://developers.tiktok.com/doc/oauth-user-access-token-management';

	properties: INodeProperties[] = [
		{
			displayName: 'TikTok API documentation',
			name: 'apiPermissions',
			type: 'notice',
			default: '',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://www.tiktok.com/v2/auth/authorize/',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://open-api.tiktok.com/oauth/access_token/',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: `${scopes.join(' ')}`,
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];
}
