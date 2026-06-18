// Day-of-week → platforms mapping for the GH Actions cron.
// The workflow fires once per day Mon-Sat; this module decides which
// platform(s) actually publish that day, so the same workflow file
// can drive all three.

export type Platform = 'facebook' | 'instagram' | 'tiktok';

const WEEKLY: Record<number, Platform[]> = {
  // 0 = Sun
  0: [],
  1: ['facebook', 'instagram'], // Mon
  2: ['tiktok'],                // Tue
  3: ['facebook', 'instagram'], // Wed
  4: ['tiktok'],                // Thu
  5: ['facebook', 'instagram'], // Fri
  6: ['tiktok'],                // Sat
};

/**
 * Returns the platforms scheduled to publish today in Karachi time.
 * Override with `PLATFORMS=facebook,instagram` env var (comma-separated)
 * for ad-hoc/staging runs; an empty `PLATFORMS=` means dry-run (no publish).
 */
export function platformsForToday(now: Date = new Date()): Platform[] {
  if (process.env.PLATFORMS !== undefined) {
    if (process.env.PLATFORMS.trim() === '') return [];
    return process.env.PLATFORMS
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s === 'facebook' || s === 'instagram' || s === 'tiktok') as Platform[];
  }

  const karachi = toKarachiDate(now);
  const dow = karachi.getUTCDay(); // After offset, UTC components ARE Karachi components.
  return WEEKLY[dow] ?? [];
}

/**
 * Karachi is UTC+5, no DST. Shift a UTC instant into Karachi-local wall clock,
 * represented as a Date whose UTC fields equal Karachi wall-clock fields.
 */
function toKarachiDate(now: Date): Date {
  return new Date(now.getTime() + 5 * 60 * 60 * 1000);
}

/** Apply a randomized 0-30 minute publish delay to avoid Meta spam heuristics. */
export async function jitter(maxMinutes = 30): Promise<void> {
  if (process.env.NO_JITTER === '1') return;
  const ms = Math.floor(Math.random() * maxMinutes * 60 * 1000);
  if (ms > 0) await new Promise(r => setTimeout(r, ms));
}
