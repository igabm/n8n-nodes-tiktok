import type { INodeProperties } from 'n8n-workflow';

export const commentOperations: INodeProperties[] = [
        {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                        show: {
                                resource: ['comment'],
                        },
                },
                options: [
                        {
                                name: 'List',
                                value: 'list',
                                description: 'Retrieve comments for a video',
                                action: 'List comments',
                        },
                        {
                                name: 'Create',
                                value: 'create',
                                description: 'Publish a comment on a video',
                                action: 'Create comment',
                        },
                        {
                                name: 'Delete',
                                value: 'delete',
                                description: 'Remove a comment from a video',
                                action: 'Delete comment',
                        },
                ],
                default: 'list',
        },
];

export const commentFields: INodeProperties[] = [
        /* -------------------------------------------------------------------------- */
        /*                                   comment:list                              */
        /* -------------------------------------------------------------------------- */
        {
                displayName: 'Video ID',
                name: 'videoId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                        show: {
                                resource: ['comment'],
                                operation: ['list'],
                        },
                },
                description: 'Identifier of the video to retrieve comments for',
        },
        {
                displayName: 'Cursor',
                name: 'cursor',
                type: 'string',
                default: '',
                displayOptions: {
                        show: {
                                resource: ['comment'],
                                operation: ['list'],
                        },
                },
                description: 'Pagination cursor to continue listing comments',
        },
        /* -------------------------------------------------------------------------- */
        /*                                   comment:create                            */
        /* -------------------------------------------------------------------------- */
        {
                displayName: 'Video ID',
                name: 'videoId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                        show: {
                                resource: ['comment'],
                                operation: ['create'],
                        },
                },
                description: 'Identifier of the video to comment on',
        },
        {
                displayName: 'Comment Text',
                name: 'commentText',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                        show: {
                                resource: ['comment'],
                                operation: ['create'],
                        },
                },
                description: 'Text content of the comment',
        },
        /* -------------------------------------------------------------------------- */
        /*                                   comment:delete                            */
        /* -------------------------------------------------------------------------- */
        {
                displayName: 'Video ID',
                name: 'videoId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                        show: {
                                resource: ['comment'],
                                operation: ['delete'],
                        },
                },
                description: 'Identifier of the video containing the comment',
        },
        {
                displayName: 'Comment ID',
                name: 'commentId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                        show: {
                                resource: ['comment'],
                                operation: ['delete'],
                        },
                },
                description: 'Identifier of the comment to delete',
        },
];

