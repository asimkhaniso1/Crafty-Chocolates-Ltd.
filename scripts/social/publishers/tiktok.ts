import { setSecret } from '../lib/secretRotator';

export interface TikTokPostResult {
  platformPostId: string;
}

const POLL_INTERVAL_MS = 4_000;
const MAX_POLL_ATTEMPTS = 30;

/**
 * Publish a 9:16 MP4 + caption to the brand TikTok account.
 * Flow (Content Posting API):
 *   1) refresh access token using the long-lived refresh_token
 *   2) POST /v2/post/publish/video/init/ with source PULL_FROM_URL
 *   3) Poll /v2/post/publish/status/fetch/ until PUBLISH_COMPLETE
 *
 * Until the developer app is approved by TikTok (2-4 wks), this publisher
 * runs in "no-op" mode — it logs a warning and returns a synthetic id
 * instead of calling the API. Set TIKTOK_REFRESH_TOKEN to enable.
 */
export async function publishToTikTok(args: {
  videoUrl: string;
  caption: string;
}): Promise<TikTokPostResult> {
  if (!process.env.TIKTOK_REFRESH_TOKEN || !process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
    console.warn('TikTok publisher disabled — set TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REFRESH_TOKEN to enable.');
    return { platformPostId: `noop-${Date.now()}` };
  }

  const { accessToken, newRefreshToken } = await refreshAccessToken();
  if (newRefreshToken && newRefreshToken !== process.env.TIKTOK_REFRESH_TOKEN) {
    await setSecret('TIKTOK_REFRESH_TOKEN', newRefreshToken);
  }

  const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title: args.caption.slice(0, 150),
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: args.videoUrl,
      },
    }),
  });
  const initText = await initRes.text();
  if (!initRes.ok) {
    throw new Error(`TikTok init failed: ${initRes.status} ${initText}`);
  }
  const initJson = JSON.parse(initText);
  const publishId: string | undefined = initJson?.data?.publish_id;
  if (!publishId) {
    throw new Error(`TikTok init returned no publish_id: ${initText}`);
  }

  // Poll until PUBLISH_COMPLETE.
  let status = '';
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    await sleep(POLL_INTERVAL_MS);
    const statusRes = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ publish_id: publishId }),
    });
    const sj = await statusRes.json() as { data?: { status?: string; fail_reason?: string } };
    status = sj?.data?.status ?? '';
    if (status === 'PUBLISH_COMPLETE') return { platformPostId: publishId };
    if (status === 'FAILED') {
      throw new Error(`TikTok publish FAILED: ${sj?.data?.fail_reason ?? 'unknown'}`);
    }
  }
  throw new Error(`TikTok publish did not complete in time. Last status: ${status}`);
}

async function refreshAccessToken(): Promise<{ accessToken: string; newRefreshToken: string | null }> {
  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: process.env.TIKTOK_REFRESH_TOKEN!,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`TikTok refresh failed: ${res.status} ${text}`);
  const json = JSON.parse(text);
  return {
    accessToken: json.access_token,
    newRefreshToken: json.refresh_token ?? null,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
