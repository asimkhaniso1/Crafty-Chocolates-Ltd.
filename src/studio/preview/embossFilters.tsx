/**
 * Shared SVG <defs> for the 2.5D chocolate preview: body gradients per
 * ChocolateType, a soft top-light highlight, and the emboss filter used to
 * render logos, text and patterns as if raised from the chocolate surface.
 * The studio produces one finish only — emboss — so this is the sole
 * filter offered.
 *
 * All ids are namespaced with `studio-` to avoid collisions when multiple
 * <StudioDefs> instances are mounted (piece preview + box preview cells).
 */

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

export function filterId(style: string, uid: string): string {
  return `studio-${style}-${uid}`;
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

      {/* --- Emboss: raised (pressed up) --- */}
      <filter id={filterId('emboss', uid)} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
        <feOffset in="blur" dx="-1" dy="-1" result="lightOffset" />
        <feOffset in="blur" dx="1" dy="1" result="darkOffset" />
        <feFlood floodColor="#FFFFFF" floodOpacity="0.85" result="lightColor" />
        <feFlood floodColor="#000000" floodOpacity="0.55" result="darkColor" />
        <feComposite in="lightColor" in2="lightOffset" operator="in" result="lightShade" />
        <feComposite in="darkColor" in2="darkOffset" operator="in" result="darkShade" />
        <feMerge result="shading">
          <feMergeNode in="darkShade" />
          <feMergeNode in="lightShade" />
        </feMerge>
        <feComposite in="shading" in2="SourceAlpha" operator="in" result="clippedShading" />
        <feComponentTransfer in="SourceAlpha" result="dim">
          <feFuncA type="linear" slope="0.35" />
        </feComponentTransfer>
        <feFlood floodColor="#000000" floodOpacity="0.12" result="dimColor" />
        <feComposite in="dimColor" in2="dim" operator="in" result="dimShape" />
        <feMerge>
          <feMergeNode in="dimShape" />
          <feMergeNode in="clippedShading" />
        </feMerge>
      </filter>
    </defs>
  );
}
