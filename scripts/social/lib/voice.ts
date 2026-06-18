// Brand voice rules + Urdu phrase bank + Islamic lunar event calendar.
// Imported by generateCaption.ts and pickProduct.ts to shape outputs.

export const BRAND_VOICE = {
  name: 'Crafty Chocolates',
  city: 'Karachi',
  country: 'Pakistan',
  positioning: 'handcrafted artisanal chocolates and custom gifting',
  tone: 'warm, premium-but-approachable, gift-focused, Karachi-savvy',
  emoji: 'sparingly — max one emoji per post, prefer none',
  hashtagsAlways: ['#CraftyChocolates', '#KarachiChocolates', '#HandcraftedInPakistan'],
  hashtagsRotate: [
    '#GiftBoxesPakistan', '#CustomChocolates', '#CorporateGiftsPK',
    '#WeddingFavors', '#KarachiGifts', '#PakistaniChocolate',
    '#ChocolateLover', '#GiftIdeas', '#LuxuryGifting',
    '#MadeInPakistan', '#ChocolateGift', '#PremiumChocolate',
  ],
};

/**
 * Urdu / Roman-Urdu phrases. Caption may include AT MOST ONE per post.
 * Each phrase is paired with an English fallback meaning to seed the model.
 */
export const URDU_PHRASES: Array<{ phrase: string; gloss: string }> = [
  { phrase: 'mazedaar',          gloss: 'delicious' },
  { phrase: 'tohfa',             gloss: 'gift' },
  { phrase: 'khaas aapke liye',  gloss: 'specially for you' },
  { phrase: 'bilkul',            gloss: 'absolutely / totally' },
  { phrase: 'kuch meetha ho jaye', gloss: 'let there be something sweet' },
  { phrase: 'pyaar bhara tohfa', gloss: 'a gift filled with love' },
  { phrase: 'dil se',            gloss: 'from the heart' },
  { phrase: 'meethi yaadein',    gloss: 'sweet memories' },
];

/**
 * Map an `events` tag from products.ts onto the campaign template key.
 * Anything not listed defaults to 'everyday'.
 */
export const EVENT_TO_OCCASION: Record<string, string> = {
  'Ramadan': 'ramadan',
  'Eid': 'eid',
  'Wedding & Engagement': 'wedding',
  'Christmas & New Year': 'christmas',
  'Anytime Delight': 'everyday',
  'Appreciation': 'corporate',
  'Thankyou': 'corporate',
};

/**
 * Approximate Islamic event windows (Gregorian dates).
 * Used to score products higher when the season is approaching.
 * Update this table once a year; lunar drift is ~11 days/year backwards.
 *
 * Window format: [startMonth, startDay, endMonth, endDay] inclusive.
 * If we are within `leadDays` before the window, the matching `occasion`
 * is considered "active" and products tagged with that event get a boost.
 */
export interface SeasonWindow {
  occasion: string;
  start: [number, number];
  end: [number, number];
  leadDays: number;
}

export const SEASONS_2026: SeasonWindow[] = [
  // Ramadan 2026: ~Feb 17 – Mar 18
  { occasion: 'ramadan',   start: [2, 17],  end: [3, 18],  leadDays: 30 },
  // Eid al-Fitr 2026: ~Mar 19–21
  { occasion: 'eid',       start: [3, 19],  end: [3, 23],  leadDays: 14 },
  // Eid al-Adha 2026: ~May 26–28
  { occasion: 'eid',       start: [5, 26],  end: [5, 30],  leadDays: 14 },
  // Wedding shaadi season Karachi: Oct & Nov + Feb-Apr
  { occasion: 'wedding',   start: [10, 1],  end: [11, 30], leadDays: 21 },
  { occasion: 'wedding',   start: [2, 1],   end: [4, 30],  leadDays: 21 },
  // Christmas / New Year
  { occasion: 'christmas', start: [12, 1],  end: [12, 31], leadDays: 21 },
  // Valentine's Day (chocolate is the gift)
  { occasion: 'everyday',  start: [2, 14],  end: [2, 14],  leadDays: 14 },
  // Corporate gifting peak: year-end + start of fiscal Jul-Aug
  { occasion: 'corporate', start: [11, 15], end: [12, 31], leadDays: 30 },
  { occasion: 'corporate', start: [6, 15],  end: [7, 31],  leadDays: 21 },
];

/**
 * Return the occasion key that should bias today's product pick.
 * Returns 'everyday' if no special season is active or imminent.
 */
export function activeOccasion(today: Date = new Date()): string {
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const todayDoy = dayOfYear(m, d);

  for (const s of SEASONS_2026) {
    const startDoy = dayOfYear(s.start[0], s.start[1]);
    const endDoy   = dayOfYear(s.end[0],   s.end[1]);
    const leadDoy  = startDoy - s.leadDays;

    // Within window, or in lead-up.
    if (todayDoy >= leadDoy && todayDoy <= endDoy) {
      return s.occasion;
    }
  }
  return 'everyday';
}

function dayOfYear(month: number, day: number): number {
  const daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let doy = day;
  for (let i = 0; i < month - 1; i++) doy += daysPerMonth[i];
  return doy;
}

/**
 * Voice rules surfaced verbatim into the Gemini system prompt.
 */
export const VOICE_RULES = `
Write as Crafty Chocolates — a Karachi-based artisanal chocolate brand.
Audience: Pakistani gift-buyers, corporate buyers, and brides/grooms.
Tone: warm, premium-but-approachable, gift-focused.

Hard constraints:
- 80 to 150 characters of caption body (not counting the link or hashtags).
- English-primary. You MAY include at most ONE Urdu / Roman-Urdu phrase per post,
  drawn from this list: ${URDU_PHRASES.map(p => `"${p.phrase}" (${p.gloss})`).join(', ')}.
  Never combine two Urdu phrases. Many posts should have zero — variety matters.
- Never use more than one emoji. Prefer zero. Acceptable emoji set (if any):
  🍫 ✨ 🎁  — never anything else.
- Never use the words "yummy", "scrumptious", "indulge", "decadent", "irresistible",
  "treat yourself" — too generic, used by every chocolate brand.
- Always end the caption with the call-to-action URL exactly as provided in the
  user message. Do NOT modify the URL or wrap it in markdown.
- Output ONLY the caption text and the URL on one line, then a newline, then
  3 to 5 hashtags space-separated on a second line. No preamble, no quotes.
`.trim();
