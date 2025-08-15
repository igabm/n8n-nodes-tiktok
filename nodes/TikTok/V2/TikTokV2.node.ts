import {
	NodeConnectionType,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type ILoadOptionsFunctions,
	type INodeExecutionData,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeBaseDescription,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';

import { videoPostFields, videoPostOperations } from './VideoPostDescription'; // Assume VideoPostDescription file handles video posting
import { photoPostFields, photoPostOperations } from './PhotoPostDescription'; // Assume PhotoPostDescription file handles photo posting
import { userProfileFields, userProfileOperations } from './UserProfileDescription';
import { followerFields, followerOperations } from './FollowerDescription';

import { tiktokApiRequest, tiktokApiRequestAllItems } from './GenericFunctions'; // Adjusted to TikTok API helper functions

export class TikTokV2 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			version: 2,
			description: 'Upload and manage TikTok videos and photos, and retrieve profile information',
			subtitle: '={{$parameter["operation"] + ":" + $parameter["resource"]}}',
			defaults: {
				name: 'TikTok',
			},
			inputs: [NodeConnectionType.Main],
			outputs: [NodeConnectionType.Main],
			credentials: [
				{
					name: 'tiktokOAuth2Api', // Adjust to use TikTok credentials
					required: true,
				},
			],
			properties: [
				{
					displayName: 'Resource',
					name: 'resource',
					type: 'options',
					noDataExpression: true,
					options: [
						{
							name: 'Video Post',
							value: 'videoPost',
							description: 'Upload a video to TikTok',
						},
						{
							name: 'Photo Post',
							value: 'photoPost',
							description: 'Upload a photo to TikTok',
						},
						{
							name: 'User Profile',
							value: 'userProfile',
							description: 'Retrieve profile data of a TikTok user',
						},
						{
							name: 'Follower',
							value: 'follower',
							description: 'Retrieve follower and following lists',
						},
					],
					default: 'videoPost',
				},
				// VIDEO POST
				...videoPostOperations,
				...videoPostFields,
				// PHOTO POST
				...photoPostOperations,
				...photoPostFields,
				// USER PROFILE
				...userProfileOperations,
				...userProfileFields,
				// FOLLOWER
				...followerOperations,
				...followerFields,
			],
		};
	}

	methods = {
		loadOptions: {
			// Load additional data for TikTok, if necessary
			async getLanguages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				// Example of how you might load options if needed
				const returnData: INodePropertyOptions[] = [];
				const languages = ['English', 'Spanish', 'French']; // Example, change as needed
				for (const language of languages) {
					returnData.push({
						name: language,
						value: language.toLowerCase(),
					});
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData;
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < length; i++) {
			try {
				if (resource === 'videoPost') {
					if (operation === 'upload') {
						const videoFile = this.getNodeParameter('videoFile', i) as IDataObject;
						const body: IDataObject = {
							videoFile, // Adjust to match the TikTok video file format
						};
						responseData = await tiktokApiRequest.call(this, 'POST', '/video/upload', body);
					}
				}

				if (resource === 'photoPost') {
					if (operation === 'upload') {
						const photoUrl = this.getNodeParameter('photoUrl', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const postInfo: IDataObject = {};
						if (additionalFields.caption) {
							postInfo.title = additionalFields.caption as string;
						}
						if (additionalFields.tags) {
							postInfo.description = additionalFields.tags as string;
						}
						const body: IDataObject = {
							post_info: postInfo,
							source_info: {
								source: 'PULL_FROM_URL',
								photo_cover_index: 1,
								photo_images: [photoUrl],
							},
							post_mode: 'MEDIA_UPLOAD',
							media_type: 'PHOTO',
						};
						responseData = await tiktokApiRequest.call(
							this,
							'POST',
							'/v2/post/publish/content/init/',
							body,
						);
					}
				}

				if (resource === 'userProfile') {
					if (operation === 'get') {
						const fields = this.getNodeParameter('fields', i) as string[];
						if (!fields?.length) {
							throw new NodeOperationError(
								this.getNode(),
								'User Profile: "Fields" must include at least one selection.',
							);
						}
						const qs: IDataObject = { fields: fields.join(',') };
						responseData = await tiktokApiRequest.call(this, 'GET', '/user/info/', {}, qs);
					}
				}

				if (resource === 'follower') {
					const qs: IDataObject = {};
					const paginationToken = this.getNodeParameter('paginationToken', i) as string;
					if (paginationToken) {
						qs.next_token = paginationToken;
					}

					if (operation === 'listFollowers') {
						responseData = await tiktokApiRequestAllItems.call(
							this,
							'data',
							'GET',
							'/v2/follower/list/',
							{},
							qs,
						);
					}

					if (operation === 'listFollowing') {
						responseData = await tiktokApiRequestAllItems.call(
							this,
							'data',
							'GET',
							'/v2/following/list/',
							{},
							qs,
						);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = {
						json: {
							error: (error as JsonObject).message,
						},
					};
					returnData.push(executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
