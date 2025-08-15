import type { INodeProperties } from 'n8n-workflow';

export const videoPostOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['videoPost'],
			},
		},
		options: [
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a video to TikTok',
				action: 'Upload video',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a video from TikTok',
				action: 'Delete video',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve video metadata',
				action: 'Get video',
			},
		],
		default: 'upload',
	},
];

export const videoPostFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                videoPost:upload                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Video File',
		name: 'videoFile',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['videoPost'],
				operation: ['upload'],
			},
		},
		description: 'The path to the video file to upload',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['videoPost'],
				operation: ['upload'],
			},
		},
		options: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title for the video post',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags for the video post',
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                                videoPost:delete                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Video ID',
		name: 'videoId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['videoPost'],
				operation: ['delete'],
			},
		},
		description: 'The ID of the video to delete',
	},
	/* -------------------------------------------------------------------------- */
	/*                                videoPost:get                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Video ID',
		name: 'videoId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['videoPost'],
				operation: ['get'],
			},
		},
		description: 'ID of the video to retrieve. Leave empty to list videos.',
	},
	{
		displayName: 'Pagination',
		name: 'pagination',
		type: 'collection',
		placeholder: 'Add Parameter',
		default: {},
		displayOptions: {
			show: {
				resource: ['videoPost'],
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'number',
				default: 0,
				description: 'Pagination cursor for results',
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 20,
				description: 'Number of videos to return',
			},
		],
	},
];
