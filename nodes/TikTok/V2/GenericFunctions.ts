import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodeParameterResourceLocator,
	JsonObject,
	IRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { ApplicationError, NodeApiError, NodeOperationError } from 'n8n-workflow';

export async function tiktokApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	fullOutput?: boolean,
	uri?: string,
	option: IDataObject = {},
) {
	let options: IRequestOptions = {
		method,
		body,
		qs,
		url: uri || `https://open.tiktokapis.com/v2${resource}`, // TikTok base API URL
		json: true,
	};
	try {
		if (Object.keys(option).length !== 0) {
			options = Object.assign({}, options, option);
		}
		if (Object.keys(body).length === 0) {
			delete options.body;
		}
		if (Object.keys(qs).length === 0) {
			delete options.qs;
		}
		if (fullOutput) {
			return await this.helpers.requestOAuth2.call(this, 'tiktokOAuth2Api', options); // TikTok OAuth2 credentials
		} else {
			const { data } = await this.helpers.requestOAuth2.call(this, 'tiktokOAuth2Api', options);
			return data;
		}
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function tiktokApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	propertyName: string,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
) {
	const returnData: IDataObject[] = [];
	let responseData;

	query.max_results = 10; // Limit results

	do {
		responseData = await tiktokApiRequest.call(this, method, endpoint, body, query, true);
		query.next_token = responseData.meta.next_token as string; // Check for pagination
		returnData.push(...(responseData[propertyName] as IDataObject[]));
	} while (responseData.meta.next_token);

	return returnData;
}

export function returnId(contentId: INodeParameterResourceLocator) {
	if (contentId.mode === 'id') {
		return contentId.value as string;
	} else if (contentId.mode === 'url') {
		try {
			const url = new URL(contentId.value as string);
			if (!url.hostname.includes('tiktok.com')) {
				throw new ApplicationError('Invalid TikTok domain');
			}
			const parts = url.pathname.split('/');
			if (parts.length !== 4 || !/^\d+$/.test(parts[3])) {
				throw new ApplicationError('Invalid TikTok content URL');
			}
			return parts[3];
		} catch (error) {
			throw new ApplicationError('Not a valid TikTok URL', { level: 'warning', cause: error });
		}
	} else {
		throw new ApplicationError(`The mode ${contentId.mode} is not valid!`, { level: 'warning' });
	}
}

export async function returnIdFromUsername(
	this: IExecuteFunctions,
	usernameRlc: INodeParameterResourceLocator,
) {
	usernameRlc.value = (usernameRlc.value as string).replace('@', ''); // Remove @ from username
	if (usernameRlc.mode === 'username') {
		const user = (await tiktokApiRequest.call(
			this,
			'GET',
			`/users/by/username/${usernameRlc.value}`,
			{},
		)) as { id: string };
		return user.id;
	} else {
		throw new ApplicationError(`The username mode ${usernameRlc.mode} is not valid!`, {
			level: 'warning',
		});
	}
}
