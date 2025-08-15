import type { INodeProperties } from 'n8n-workflow';

export const followerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		required: true,
		displayOptions: {
			show: {
				resource: ['follower'],
			},
		},
		options: [
			{
				name: 'List Followers',
				value: 'listFollowers',
				description: 'Get the list of followers of the authenticated user',
				action: 'List followers',
			},
			{
				name: 'List Following',
				value: 'listFollowing',
				description: 'Get the list of users the authenticated user is following',
				action: 'List following',
			},
		],
		default: 'listFollowers',
	},
];

export const followerFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                         follower:listFollowers/listFollowing                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Pagination Token',
		name: 'paginationToken',
		type: 'string',
		default: '',
		typeOptions: {
			password: true,
		},
		displayOptions: {
			show: {
				resource: ['follower'],
				operation: ['listFollowers', 'listFollowing'],
			},
		},
		description:
			'Token to specify the start page. Use the value returned from the previous request to retrieve the next page.',
	},
];
