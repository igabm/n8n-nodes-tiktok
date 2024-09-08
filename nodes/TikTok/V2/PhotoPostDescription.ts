import type { INodeProperties } from 'n8n-workflow';

export const photoPostOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['photoPost'],
			},
		},
		options: [
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a photo to TikTok',
				action: 'Upload photo',
			},
		],
		default: 'upload',
	},
];

export const photoPostFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                photoPost:upload                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Photo URL',
		name: 'photoUrl',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['photoPost'],
				operation: ['upload'],
			},
		},
		description: 'The URL of the photo to upload',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['photoPost'],
				operation: ['upload'],
			},
		},
		options: [
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				default: '',
				description: 'The caption for the photo post',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags for the photo post',
			},
		],
	},
];
