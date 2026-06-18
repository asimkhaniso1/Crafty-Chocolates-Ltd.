export interface InstagramPostResult {
  platformPostId: string;
}

const MAX_POLL_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 2_000;

/**
 * Publish a photo + caption to the linked Instagram Business account.
 * Two-step Graph API flow:
 *   1) POST /{ig-id}/media   → creation_id
 *   2) Poll GET /{creation_id}?fields=status_code until FINISHED
 *   3) POST /{ig-id}/media_publish with creation_id
 */
export async function publishToInstagram(args: {
  imageUrl: string;
  caption: string;
}): Promise<InstagramPostResult> {
  const token = process.env.META_SYSTEM_USER_TOKEN;
  const igId = process.env.META_IG_BUSINESS_ID;
  if (!token) throw new Error('META_SYSTEM_USER_TOKEN missing');
  if (!igId) throw new Error('META_IG_BUSINESS_ID missing — confirm IG Business is linked to FB Page');

  // 1) Create media container
  const createRes = await fetch(`https://graph.facebook.com/v21.0/${igId}/media`, {
    method: 'POST',
    body: new URLSearchParams({
      image_url: args.imageUrl,
      caption: args.caption,
      access_token: token,
    }),
  });
  const createText = await createRes.text();
  if (!createRes.ok) {
    throw new Error(`Instagram container create failed: ${createRes.status} ${createText}`);
  }
  const { id: containerId } = JSON.parse(createText);
  if (!containerId) throw new Error(`Instagram returned no container id: ${createText}`);

  // 2) Poll until container is FINISHED
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`,
    );
    const statusJson = await statusRes.json() as { status_code?: string; error?: unknown };
    if (statusJson.status_code === 'FINISHED') break;
    if (statusJson.status_code === 'ERROR' || statusJson.status_code === 'EXPIRED') {
      throw new Error(`Instagram container ${statusJson.status_code}: ${JSON.stringify(statusJson)}`);
    }
    await sleep(POLL_INTERVAL_MS);
  }

  // 3) Publish
  const publishRes = await fetch(`https://graph.facebook.com/v21.0/${igId}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: containerId,
      access_token: token,
    }),
  });
  const publishText = await publishRes.text();
  if (!publishRes.ok) {
    throw new Error(`Instagram publish failed: ${publishRes.status} ${publishText}`);
  }
  const { id: mediaId } = JSON.parse(publishText);
  if (!mediaId) throw new Error(`Instagram publish returned no id: ${publishText}`);
  return { platformPostId: mediaId };
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
