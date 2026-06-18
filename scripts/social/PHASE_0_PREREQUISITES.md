# Phase 0 — Prerequisites (one-time, owner-completed)

Good news: **all three social accounts already exist.** What remains is
API access (developer apps, tokens, IDs) and the Supabase + Vercel wiring.

## Accounts already in place (2026-05-13)

| Platform  | Handle / URL                                                                | Page/User ID                |
|-----------|------------------------------------------------------------------------------|------------------------------|
| Facebook  | <https://www.facebook.com/profile.php?id=61584240309480>                    | `61584240309480`             |
| Instagram | <https://www.instagram.com/craftychocolates._com/>                          | (look up — see step 4 below) |
| TikTok    | <https://www.tiktok.com/@craftychocolates.com>                              | n/a — handle is the id       |
| WhatsApp  | **0333-2527370** — international format `923332527370` used in wa.me links | n/a                          |

---

## 1. TikTok developer app (do first — review queue is 2-4 weeks)

The TikTok account already exists at `@craftychocolates.com` and has 2 videos uploaded — that's the brand-side prerequisite done. What remains is the **developer app** that lets the cron post on its behalf.

- [ ] Open <https://developers.tiktok.com/> and sign in with the same TikTok account.
- [ ] Manage apps → "Connect an app" → fill in:
  - App name: `Crafty Chocolates Social`
  - Category: `Business Tools`
  - Description: `Internal tool that auto-publishes product photos and short videos to our brand TikTok account.`
  - Website URL: `https://craftychocolates.pk`
  - Terms of Service URL: `https://craftychocolates.pk/terms` ← we will add this page
  - Privacy Policy URL: `https://craftychocolates.pk/privacy` ← we will add this page
- [ ] Add scopes: **`video.upload`** and **`video.publish`** (Content Posting API).
- [ ] Submit for review. **Expect 2-4 weeks.** FB+IG will run regardless.
- [ ] Once approved: generate Client Key, Client Secret, and an initial Refresh Token. Store in GitHub Secrets (§5).

## 2. Facebook Page — already exists ✅

Page ID: **`61584240309480`** (visible in the URL of `facebook.com/profile.php?id=...`). Use this verbatim for the `META_FB_PAGE_ID` secret. Optional polish:
- [ ] Add a profile photo and cover photo to the Page.
- [ ] Fill the About section: hours, address, contact info, the wa.me link.

## 3. Meta Business Portfolio + app

- [ ] At <https://business.facebook.com/> → create a **Business Portfolio** "Crafty Chocolates Ltd" (if not already).
- [ ] Business Settings → Pages → **Claim a Page** → enter the Crafty Chocolates Page (ID `61584240309480`).
- [ ] <https://developers.facebook.com/> → My Apps → Create App → **Business** type → name `Crafty Chocolates Auto-Publisher`.
- [ ] Add products: **Pages API** and **Instagram Graph API**.
- [ ] Link the app to the Business Portfolio.

## 4. Instagram Business linkage

The IG account `@craftychocolates._com` already exists. We just need to confirm it is a Business account and is linked to the FB Page.

- [ ] Instagram app → Settings → Account type → confirm **Professional → Business** (switch if not).
- [ ] Meta Business Suite → Business Settings → Accounts → Instagram accounts → **Add** `@craftychocolates._com`.
- [ ] Link the IG account to the Facebook Page (Page ID `61584240309480`).
- [ ] Once linked, retrieve the IG Business User ID:

```bash
curl "https://graph.facebook.com/v21.0/me/accounts?access_token=YOUR_TOKEN" \
  | jq '.data[] | select(.id=="61584240309480") | .instagram_business_account.id'
```

## 5. System User token (the trick that avoids 60-day refresh)

- [ ] Meta Business Suite → Business Settings → Users → **System Users** → Add → name `crafty-auto-publisher`, role **Admin**.
- [ ] Assign the system user to the Page (with `Create content` permission) and to the IG account.
- [ ] On the system user → **Generate new token** → choose the developer app → tick scopes:
  - `pages_show_list`
  - `pages_manage_posts`
  - `pages_read_engagement`
  - `instagram_basic`
  - `instagram_content_publish`
- [ ] Set expiration to **Never**.
- [ ] Copy the token immediately — it is shown once.

## 6. Privacy + Terms pages on the site

TikTok will reject the developer app if these URLs don't return 200. The publish.ts code will run, but TikTok won't approve the app, so `publishers/tiktok.ts` will continue to no-op.

- [ ] After scaffolding deploys, confirm `https://craftychocolates.pk/privacy` and `https://craftychocolates.pk/terms` both render.

## 7. Supabase

- [ ] Supabase Dashboard → SQL Editor → run [supabase/migrations/002_social.sql](../../supabase/migrations/002_social.sql). This adds `posts`, `post_clicks`, the `post_metrics` view, and the public `social-assets` Storage bucket.
- [ ] Settings → API → copy the **`service_role`** key (NOT anon). Service role is server-only — never expose this with a `VITE_` prefix or in client bundles.

## 8. GitHub Secrets

Repo Settings → Secrets and variables → Actions → New repository secret.

| Secret | Value |
|---|---|
| `META_SYSTEM_USER_TOKEN` | from §5 — the never-expiring system user token |
| `META_FB_PAGE_ID` | `61584240309480` |
| `META_IG_BUSINESS_ID` | from §4 — `instagram_business_account.id` |
| `TIKTOK_CLIENT_KEY` | from §1 |
| `TIKTOK_CLIENT_SECRET` | from §1 |
| `TIKTOK_REFRESH_TOKEN` | from §1 — initial refresh token |
| `GEMINI_API_KEY` | <https://aistudio.google.com/apikey> (free tier) |
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** |
| `SITE_URL` | `https://craftychocolates.pk` |
| `WA_NUMBER` | `923332527370` |
| `GH_PAT_FOR_SECRETS` | a GH PAT with `actions:write` scope — used by the workflow to rotate `TIKTOK_REFRESH_TOKEN` automatically each run (optional but recommended) |

## 9. Vercel Environment Variables

The redirect endpoint `/api/r/wa` runs on Vercel and needs:

| Env var | Value |
|---|---|
| `SUPABASE_URL` | same as §8 |
| `SUPABASE_SERVICE_ROLE_KEY` | same as §8 |
| `WA_NUMBER` | `923332527370` |

Set in Vercel → Project → Settings → Environment Variables. Apply to **Production** and **Preview**.

---

## Done? Run this sanity check

```bash
# From the repo root
npm install                  # installs sharp + everything else
npm run social:dry           # composes a post locally without calling APIs
```

Then enable FB only:

```bash
PLATFORMS=facebook npm run social:run
```

If a real post appears on `facebook.com/profile.php?id=61584240309480`, prerequisites 2-5 + 7-8 are correct. Move on to Instagram (`PLATFORMS=instagram`), then turn on the GitHub Actions cron.
