/**
 * Shared SVG <defs> for the 2.5D chocolate preview: body gradients per
 * ChocolateType, a soft top-light highlight, and the emboss filters used to
 * render logos, text and patterns as if moulded into the chocolate surface.
 * The studio produces one finish only — emboss — so these are the sole
 * filters offered.
 *
 * Emboss look: on real embossed chocolate the mark is the SAME chocolate as
 * the body — you read it only through the raised-edge highlight (catching
 * light, top-left) and shadow (falling away, bottom-right), with the
 * interior a touch lighter than the surrounding body because a raised
 * surface catches more ambient light. There is no white or black fill.
 *
 * All ids are namespaced with `studio-` to avoid collisions when multiple
 * <StudioDefs> instances are mounted (piece preview + box preview cells).
 */

import type { ChocolateType } from '../types';

interface StudioDefsProps {
  /** Unique suffix so multiple mounted copies never collide on id. */
  uid: string;
}

export function gradientId(type: string, uid: string): string {
  return `studio-choc-${type}-${uid}`;
}

export function highlightId(uid: string): string {
  return `studio-highlight-${uid}`;
}

/** Id of the emboss filter tuned for a given chocolate type. */
export function embossFilterId(type: ChocolateType, uid: string): string {
  return `studio-emboss-${type}-${uid}`;
}

/** Per-type tuning: interior tint (body colour, lightened) and edge strengths.
 *  Dark chocolate needs a stronger highlight to stay legible against itself. */
const EMBOSS_TUNING: Record<
  ChocolateType,
  { interior: string; highlightOpacity: number; shadowOpacity: number }
> = {
  milk: { interior: '#8C5A32', highlightOpacity: 0.5, shadowOpacity: 0.45 },
  semidark: { interior: '#6B4022', highlightOpacity: 0.6, shadowOpacity: 0.48 },
  dark: { interior: '#4E2C1D', highlightOpacity: 0.75, shadowOpacity: 0.5 },
};

/**
 * One emboss filter per chocolate type: fills the mark with a lightened
 * body tint, then adds a soft warm highlight rim (top-left, where the raised
 * surface catches light) and a soft deep-brown shadow rim (bottom-right,
 * where it falls away) derived directly from the mask's own alpha — no
 * white or black fill of the interior.
 */
function EmbossFilter({ type, uid }: { type: ChocolateType; uid: string }) {
  const tuning = EMBOSS_TUNING[type];
  return (
    <filter
      id={embossFilterId(type, uid)}
      x="-40%"
      y="-40%"
      width="180%"
      height="180%"
      colorInterpolationFilters="sRGB"
    >
      {/* Interior: the mark reads as the same chocolate, a shade lighter — a raised surface, not a printed colour */}
      <feFlood floodColor={tuning.interior} floodOpacity="1" result="interiorColor" />
      <feComposite in="interiorColor" in2="SourceAlpha" operator="in" result="interiorFill" />

      {/* Soften the mask slightly so the offset rims read as a rounded bevel rather than a hard step */}
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="softAlpha" />
      <feOffset in="softAlpha" dx="-1.5" dy="-1.5" result="lightOffsetAlpha" />
      <feOffset in="softAlpha" dx="1.5" dy="1.5" result="darkOffsetAlpha" />

      {/* Keep only the sliver of each offset shape that pokes past the true silhouette — the raised rim */}
      <feComposite in="lightOffsetAlpha" in2="SourceAlpha" operator="out" result="highlightRimAlpha" />
      <feComposite in="darkOffsetAlpha" in2="SourceAlpha" operator="out" result="shadowRimAlpha" />
      <feGaussianBlur in="highlightRimAlpha" stdDeviation="0.4" result="highlightRimSoft" />
      <feGaussianBlur in="shadowRimAlpha" stdDeviation="0.4" result="shadowRimSoft" />

      <feFlood floodColor="#FFF0DC" floodOpacity={tuning.highlightOpacity} result="highlightColor" />
      <feComposite in="highlightColor" in2="highlightRimSoft" operator="in" result="highlightShade" />

      <feFlood floodColor="#140A05" floodOpacity={tuning.shadowOpacity} result="shadowColor" />
      <feComposite in="shadowColor" in2="shadowRimSoft" operator="in" result="shadowShade" />

      <feMerge>
        <feMergeNode in="interiorFill" />
        <feMergeNode in="shadowShade" />
        <feMergeNode in="highlightShade" />
      </feMerge>
    </filter>
  );
}

export default function StudioDefs({ uid }: StudioDefsProps) {
  return (
    <defs>
      {/* --- Chocolate body gradients (tuned to match real product photography) --- */}
      <linearGradient id={gradientId('milk', uid)} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9C6B3F" />
        <stop offset="45%" stopColor="#7B4A26" />
        <stop offset="100%" stopColor="#5C3317" />
      </linearGradient>
      <linearGradient id={gradientId('semidark', uid)} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6E4326" />
        <stop offset="45%" stopColor="#56331B" />
        <stop offset="100%" stopColor="#3A2010" />
      </linearGradient>
      <linearGradient id={gradientId('dark', uid)} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4A2A1C" />
        <stop offset="45%" stopColor="#382114" />
        <stop offset="100%" stopColor="#1F0F08" />
      </linearGradient>

      {/* Soft top-light sheen, screened over the body for a glossy feel */}
      <radialGradient id={highlightId(uid)} cx="32%" cy="22%" r="70%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.14" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>

      {/* --- Emboss: raised chocolate mark, one filter per chocolate type --- */}
      <EmbossFilter type="milk" uid={uid} />
      <EmbossFilter type="semidark" uid={uid} />
      <EmbossFilter type="dark" uid={uid} />
    </defs>
  );
}
