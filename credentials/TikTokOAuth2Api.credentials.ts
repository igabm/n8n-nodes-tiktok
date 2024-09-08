import type { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

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

	displayName = 'TikTok OAuth API';

	documentationUrl = 'https://developers.tiktok.com/doc/oauth-user-access-token-management';

	properties: INodeProperties[] = [
		{
			displayName: 'Client Key',
			name: 'clientKey',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Redirect URI',
			name: 'redirectUri',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Scopes',
			name: 'scopes',
			type: 'hidden',
			default: `${scopes.join(',')}`, // Comma-separated list for scopes
		},
	];

	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: 'https://open.tiktokapis.com/v2/oauth/token/',
			body: {
				client_key: '={{$credentials.clientKey}}',
				client_secret: '={{$credentials.clientSecret}}',
				redirect_uri: '={{$credentials.redirectUri}}',
				grant_type: 'authorization_code',
				scope: '={{$self.scopes}}', // Now uses a comma-separated list
			},
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		},
	};
}
