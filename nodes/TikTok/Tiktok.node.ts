import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { TikTokV2 } from './V2/TikTokV2.node';

export class Tiktok extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'TikTok',
			name: 'tiktok',
			icon: { light: 'file:tiktok.svg', dark: 'file:tiktok.dark.svg' },
			group: ['output'],
			subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
			description: 'Consume the TikTok API',
			defaultVersion: 2,
		};

		const nodeVersions: IVersionedNodeType['nodeVersions'] = {
			2: new TikTokV2(baseDescription),
		};

		super(nodeVersions, baseDescription);
	}
}
