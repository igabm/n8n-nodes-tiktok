import type { INodeProperties } from 'n8n-workflow';

export const relationshipOperations: INodeProperties[] = [
        {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                        show: {
                                resource: ['relationship'],
                        },
                },
                options: [
                        {
                                name: 'Follow',
                                value: 'follow',
                                description: 'Follow a user',
                                action: 'Follow user',
                        },
                        {
                                name: 'Unfollow',
                                value: 'unfollow',
                                description: 'Unfollow a user',
                                action: 'Unfollow user',
                        },
                ],
                default: 'follow',
        },
];

export const relationshipFields: INodeProperties[] = [
        /* -------------------------------------------------------------------------- */
        /*                           relationship:follow/unfollow                      */
        /* -------------------------------------------------------------------------- */
        {
                displayName: 'User',
                name: 'userId',
                type: 'resourceLocator',
                default: { mode: 'id', value: '' },
                required: true,
                description: 'Select the user to follow or unfollow',
                displayOptions: {
                        show: {
                                resource: ['relationship'],
                                operation: ['follow', 'unfollow'],
                        },
                },
                modes: [
                        {
                                displayName: 'By ID',
                                name: 'id',
                                type: 'string',
                                placeholder: '1234567890',
                                validation: {
                                        length: { min: 1 },
                                },
                        },
                        {
                                displayName: 'By Username',
                                name: 'username',
                                type: 'string',
                                placeholder: '@tiktokuser',
                                validation: {
                                        length: { min: 1 },
                                },
                        },
                ],
        },
];
