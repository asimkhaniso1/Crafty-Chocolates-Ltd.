# Crafty Chocolates — Social Auto-Publisher

Autonomous Facebook + Instagram + TikTok publisher that drives leads to
the brand's WhatsApp number (**0333-2527370** / wa.me `923332527370`) with
per-post click attribution stored in Supabase.

## How it works

```
  GitHub Actions cron (Mon-Sat 11:00 UTC = 16:00 Karachi)
            │
            ▼
   scripts/social/publish.ts ──── pickProduct ───► src/data/products.ts
            │                                     │
            │                                     ▼
            │                              activeOccasion() (lib/voice.ts)
            │
            ├─ composeImage (sharp + branded SVG overlay) → Supabase Storage
            ├─ composeVideo (ffmpeg slideshow for TikTok) → Supabase Storage
            ├─ generateCaption (Gemini 2.5 Flash, voice rules + last 8 captions)
            │
            ├─ publishers/facebook.ts   (Graph API /{page}/photos)
            ├─ publishers/instagram.ts  (container → publish)
            └─ publishers/tiktok.ts     (PULL_FROM_URL → status poll)
                                       (no-ops until TikTok dev app approved)
            │
            ▼
   Supabase `posts` (one row per publish, status, error, cta_src)

  ───────────────  attribution path  ───────────────

  social post caption ends with https://craftychocolates.pk/r/wa?src=<code>
            │
            ▼
   Vercel /api/r/wa  ── insert post_clicks row ── 302 to wa.me/<num>?text=...
            │                                                       │
            │                                       (prefill mentions product
            │                                        name + platform if known)
            ▼
   WhatsApp chat opens on the user's phone
```

## File map

```
scripts/social/
  publish.ts            entry point — orchestrates one publish cycle
  pickProduct.ts        scoring + dedupe across last 30d
  generateCaption.ts    Gemini caption with voice rules + diversity hint
  composeImage.ts       sharp 1080x1080 with brand overlay
  composeVideo.ts       ffmpeg 9:16 slideshow for TikTok
  digest.ts             weekly Markdown report
  lib/
    schedule.ts         which platforms post on which weekday
    voice.ts            brand voice, Urdu phrase bank, lunar event calendar
    supabaseAdmin.ts    service-role Supabase client
    secretRotator.ts    writes rotated TikTok refresh token back to GH Secrets
  publishers/
    facebook.ts
    instagram.ts
    tiktok.ts
  templates/captions/   per-occasion guides fed to Gemini
  PHASE_0_PREREQUISITES.md   accounts, tokens, secrets the owner sets up once

api/r/wa.ts             Vercel serverless click-redirect (NOT in scripts/)
supabase/migrations/002_social.sql   posts, post_clicks, post_metrics view
.github/workflows/
  social-publish.yml    cron driver (Mon-Sat 11:00 UTC)
  social-digest.yml     weekly Monday digest commit
```

## Schedule

| Day  | Platforms                |
|------|--------------------------|
| Mon  | Facebook + Instagram     |
| Tue  | TikTok                   |
| Wed  | Facebook + Instagram     |
| Thu  | TikTok                   |
| Fri  | Facebook + Instagram     |
| Sat  | TikTok                   |
| Sun  | nothing                  |

≈ 9 posts/week. To raise/lower cadence, edit [lib/schedule.ts](lib/schedule.ts).

## Running locally

```bash
# Compose a post end-to-end without calling any social API
npm run social:dry

# Real publish to a single platform (requires the secrets in §8 of PHASE_0)
PLATFORMS=facebook npm run social:run

# Manual digest run (writes reports/latest.md)
npm run social:digest
```

`social:dry` writes the composed JPG to `.tmp/social/` and prints the caption
to stdout. If `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set it will
also upload the image to the `social-assets` bucket and insert a
`dry_run`-status row in `posts` so you can verify the full path.

## Voice rules (summary)

- 80-150 chars caption body
- English primary, **at most one** Urdu / Roman-Urdu phrase per post
- Zero or one emoji (only 🍫 ✨ 🎁)
- 3-5 hashtags on a second line — three are always-on (`#CraftyChocolates`,
  `#KarachiChocolates`, `#HandcraftedInPakistan`), the rest rotate
- CTA URL is `${SITE_URL}/r/wa?src=<code>` — always last on the body line

Banned generic words: `yummy`, `scrumptious`, `indulge`, `decadent`,
`irresistible`, `treat yourself`.

Full rules + Urdu phrase bank: [lib/voice.ts](lib/voice.ts).

## Adding a campaign

1. Add a new file under `templates/captions/<name>.md` with angle guidance.
2. If it maps to one or more `events[]` values on products, add the mapping
   in `EVENT_TO_OCCASION` in [lib/voice.ts](lib/voice.ts).
3. If it's seasonal, add a `SeasonWindow` to `SEASONS_2026` so `activeOccasion()`
   biases the picker in the lead-up.

## Adjusting cadence or schedule

Edit the `WEEKLY` map in [lib/schedule.ts](lib/schedule.ts). The cron itself
fires every Mon-Sat at 11:00 UTC; if `WEEKLY[day]` is `[]` the publisher
just exits.

## Failure modes and where to look

| Symptom                                | Where to look                                          |
|----------------------------------------|---------------------------------------------------------|
| FB post 4xx: "Invalid OAuth access token" | regenerate the System User token in Meta Business Suite |
| IG post 400: "Media not found"         | confirm IG-to-FB-Page linkage; re-link if needed        |
| TikTok publisher logs "disabled — set…" | TikTok dev app not approved or secrets missing          |
| TikTok 401 after working previously    | refresh_token rotated — confirm `GH_PAT_FOR_SECRETS` set so rotator can persist |
| Captions repeating themselves          | check `posts` table — `recentCaptions` reads last 8 published |
| `sharp` install failure                | image-only — re-run `npm ci`; sharp ships prebuilt binaries |

## What Claude does ongoing (re-invoke me with)

- **Weekly** — "Read `reports/latest.md` and propose 3 caption-template tweaks."
- **Monthly** — "Audit caption diversity for repetition."
- **Seasonal** (Ramadan, Eid, wedding seasons, Christmas) — "Add a campaign template for X."
- **Incidents** — paste the failing GH Actions log; I diagnose and patch.

Don't expect me to be a runtime service — every conversation is a separate
session and the engine has to run without me.
