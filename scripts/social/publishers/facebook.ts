export interface FacebookPostResult {
  platformPostId: string;
}

/**
 * Publish a photo + caption to the Facebook Page.
 * Graph API: POST /v21.0/{page-id}/photos with url + caption + access_token.
 */
export async function publishToFacebook(args: {
  imageUrl: string;
  caption: string;
}): Promise<FacebookPostResult> {
  const token = process.env.META_SYSTEM_USER_TOKEN;
  const pageId = process.env.META_FB_PAGE_ID;
  if (!token) throw new Error('META_SYSTEM_USER_TOKEN missing');
  if (!pageId) throw new Error('META_FB_PAGE_ID missing');

  const body = new URLSearchParams({
    url: args.imageUrl,
    caption: args.caption,
    published: 'true',
    access_token: token,
  });

  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
    method: 'POST',
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Facebook publish failed: ${res.status} ${text}`);
  }

  const json = JSON.parse(text);
  const platformPostId = json.post_id || json.id;
  if (!platformPostId) {
    throw new Error(`Facebook returned no post id: ${text}`);
  }
  return { platformPostId };
}
