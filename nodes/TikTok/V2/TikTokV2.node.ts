import {
        NodeConnectionType,
        NodeOperationError,
        type IDataObject,
        type IExecuteFunctions,
        type ILoadOptionsFunctions,
        type INodeExecutionData,
        type INodePropertyOptions,
       type INodeParameterResourceLocator,
        type INodeType,
        type INodeTypeBaseDescription,
        type INodeTypeDescription,
        type JsonObject,
} from 'n8n-workflow';

import { videoPostFields, videoPostOperations } from './VideoPostDescription'; // Assume VideoPostDescription file handles video posting
import { photoPostFields, photoPostOperations } from './PhotoPostDescription'; // Assume PhotoPostDescription file handles photo posting
import { userProfileFields, userProfileOperations } from './UserProfileDescription';
import { relationshipFields, relationshipOperations } from './RelationshipDescription';

import {
       tiktokApiRequest,
       returnIdFromUsername,
} from './GenericFunctions'; // Adjusted to TikTok API helper functions

export class TikTokV2 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			version: 2,
                       description: 'Upload and manage TikTok videos and photos, retrieve profile information, and manage relationships',
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
                                                       name: 'Relationship',
                                                       value: 'relationship',
                                                       description: 'Follow or unfollow a user',
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
                               // RELATIONSHIP
                               ...relationshipOperations,
                               ...relationshipFields,
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
                                                const additionalFields =
                                                        this.getNodeParameter('additionalFields', i) as IDataObject;
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
                                        if (operation === 'analytics') {
                                                const selectedMetrics = this.getNodeParameter('metrics', i) as string[];
                                                if (!selectedMetrics?.length) {
                                                        throw new NodeOperationError(
                                                                this.getNode(),
                                                                'User Profile: "Metrics" must include at least one selection.',
                                                        );
                                                }

                                                const metricFieldMap: IDataObject = {
                                                        followers: 'follower_count',
                                                        likes: 'likes_count',
                                                        views: 'video_count',
                                                };
                                                const fieldList = selectedMetrics
                                                        .map((metric) => metricFieldMap[metric] as string)
                                                        .filter(Boolean);
                                                const qs: IDataObject = { fields: fieldList.join(',') };

                                                responseData = await tiktokApiRequest.call(
                                                        this,
                                                        'GET',
                                                        '/user/info/',
                                                        {},
                                                        qs,
                                                );

                                                const user = (responseData as IDataObject).user as
                                                        | IDataObject
                                                        | undefined;
                                                const metricsData: IDataObject = {};
                                                if (user) {
                                                        for (const metric of selectedMetrics) {
                                                                const fieldName = metricFieldMap[metric] as string;
                                                                if (user[fieldName] !== undefined) {
                                                                        metricsData[metric] = user[fieldName];
                                                                }
                                                        }
                                                }
                                                responseData = metricsData;
                                        }
                                }

                               if (resource === 'relationship') {
                                       const userIdRlc = this.getNodeParameter('userId', i) as INodeParameterResourceLocator;
                                       let userId = userIdRlc.value as string;
                                       if (userIdRlc.mode === 'username') {
                                               userId = await returnIdFromUsername.call(this, userIdRlc);
                                       }

                                       if (operation === 'follow') {
                                               const body: IDataObject = { user_id: userId };
                                               responseData = await tiktokApiRequest.call(this, 'POST', '/follow/', body);
                                       }

                                       if (operation === 'unfollow') {
                                               const body: IDataObject = { user_id: userId };
                                               responseData = await tiktokApiRequest.call(
                                                       this,
                                                       'POST',
                                                       '/following/delete/',
                                                       body,
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
