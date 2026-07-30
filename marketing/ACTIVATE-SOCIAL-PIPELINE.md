# Activate the daily social auto-poster

**Status (July 18, 2026):** the `Social Publish` workflow runs daily at 4pm Karachi
and succeeds — but in **dry-run mode**. No post has ever been published because
the API secrets are missing. Add the secrets below at:
`GitHub repo → Settings → Secrets and variables → Actions → New repository secret`

## Required secrets

| Secret | What it is | Where to get it |
|---|---|---|
| `META_SYSTEM_USER_TOKEN` | Long-lived token for FB + IG posting | Meta Business Suite → Business Settings → Users → System Users → create one, assign the Page + IG account, generate token with `pages_manage_posts`, `instagram_content_publish` |
| `META_FB_PAGE_ID` | Numeric ID of the Crafty Chocolates FB page | facebook.com/craftychoc → About → Page transparency, or Business Suite URL |
| `META_IG_BUSINESS_ID` | IG business account ID (@craftychocolates._com must be a Business/Creator account linked to the FB page) | Graph API explorer: `GET me/accounts?fields=instagram_business_account` |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Post logging + media hosting | Supabase project → Settings → API (same project the site's admin uses) |
| `SITE_URL` | `https://craftychocolates.com` | — |
| `WA_NUMBER` | `923332527370` | — |
| `GEMINI_API_KEY` | Caption generation | aistudio.google.com → Get API key (free tier is enough) |

Optional (TikTok — can wait until FB/IG is proven):
`TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REFRESH_TOKEN` — requires a
TikTok developer app with Content Posting API approval.

## Test procedure (do this before trusting the schedule)

1. Add the Meta + Supabase + Gemini secrets.
2. GitHub → Actions → Social Publish → **Run workflow** with `platforms=facebook`.
3. Check the FB page for the post; check the run log for `[facebook] published`.
4. Repeat with `platforms=instagram`.
5. Leave the schedule alone — it takes over from the next day.

## Rules of thumb

- Start with Facebook only (lowest-risk API), then Instagram, then TikTok.
- The picker already rotates products by occasion score — no config needed.
- Every caption carries a tracked `/r/wa?src=` link; once Supabase is connected,
  the `posts` table becomes your per-platform conversion report.
