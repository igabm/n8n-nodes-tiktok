# n8n-nodes-tiktok

This is an n8n community node that lets you use TikTok in your n8n workflows.

TikTok is a popular social media platform for creating, sharing, and discovering short videos. The TikTok Content Posting API allows developers to automate the process of posting content to TikTok directly from their applications.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The TikTok node supports the following operations:
- **Video Post**: Upload or delete a video to/from TikTok.
- **Photo Post**: Upload a photo to TikTok.

## Credentials

To use this node, you need to authenticate with TikTok via OAuth2.  
1. Create a TikTok Developer account and register an app.
2. Add the **Content Posting API** product to your app.
3. Obtain the required OAuth2 credentials for the app and configure them in n8n.
4. Ensure your app has been approved for the `video.upload` and `video.publish` scopes.

For detailed instructions on obtaining the credentials, refer to the [TikTok API Documentation](https://developers.tiktok.com/doc/oauth-user-access-token-management).

## Compatibility

- Minimum n8n version: 0.154.0
- Tested against TikTok API versions from 2023.

No known incompatibility issues at this time.

## Usage

This node allows you to automate content posting to TikTok by uploading videos or photos directly to TikTok via the Content Posting API. You can configure your workflows to handle uploads, drafts, or deletion of content programmatically.

For new users, check out the [Try it out](https://docs.n8n.io/try-it-out/) guide for general n8n workflow usage.

## Dev Usage
To link to a local n8n instance: (if dev workspace is ~/work/ )
pnpm link ~/work/n8n-nodes-tiktok/

To publish a new release:
pnpm publish  --access public

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [TikTok API Documentation](https://developers.tiktok.com/doc/content-posting-api-get-started)

## Version history

- **1.0.0**: Initial release with support for uploading and deleting TikTok videos and uploading photos.