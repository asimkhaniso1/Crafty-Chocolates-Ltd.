/**
 * Shared SVG <defs> for the 2.5D chocolate preview: body gradients per
 * ChocolateType, a soft top-light highlight, and emboss/deboss/gold/silver
 * filters used to render logos, text and patterns as if pressed into (or
 * raised from) the chocolate surface.
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
      {/* --- Chocolate body gradients --- */}
      <linearGradient id={gradientId('milk', uid)} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9C6B3A" />
        <stop offset="45%" stopColor="#8B5A2B" />
        <stop offset="100%" stopColor="#6B4423" />
      </linearGradient>
      <linearGradient id={gradientId('dark', uid)} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4A2C18" />
        <stop offset="45%" stopColor="#3B2416" />
        <stop offset="100%" stopColor="#241209" />
      </linearGradient>
      <linearGradient id={gradientId('white', uid)} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F8EFDA" />
        <stop offset="45%" stopColor="#F3E5C8" />
        <stop offset="100%" stopColor="#E2CBA0" />
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

      {/* --- Deboss: pressed down (inverted offsets) --- */}
      <filter id={filterId('deboss', uid)} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
        <feOffset in="blur" dx="1" dy="1" result="lightOffset" />
        <feOffset in="blur" dx="-1" dy="-1" result="darkOffset" />
        <feFlood floodColor="#FFFFFF" floodOpacity="0.5" result="lightColor" />
        <feFlood floodColor="#000000" floodOpacity="0.7" result="darkColor" />
        <feComposite in="lightColor" in2="lightOffset" operator="in" result="lightShade" />
        <feComposite in="darkColor" in2="darkOffset" operator="in" result="darkShade" />
        <feMerge result="shading">
          <feMergeNode in="darkShade" />
          <feMergeNode in="lightShade" />
        </feMerge>
        <feComposite in="shading" in2="SourceAlpha" operator="in" result="clippedShading" />
        <feComponentTransfer in="SourceAlpha" result="dim">
          <feFuncA type="linear" slope="0.4" />
        </feComponentTransfer>
        <feFlood floodColor="#000000" floodOpacity="0.18" result="dimColor" />
        <feComposite in="dimColor" in2="dim" operator="in" result="dimShape" />
        <feMerge>
          <feMergeNode in="dimShape" />
          <feMergeNode in="clippedShading" />
        </feMerge>
      </filter>

      {/* --- Gold dust: emboss + gold tint + subtle grain over the raised area --- */}
      <filter id={filterId('gold', uid)} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
        <feOffset in="blur" dx="-1" dy="-1" result="lightOffset" />
        <feOffset in="blur" dx="1" dy="1" result="darkOffset" />
        <feFlood floodColor="#FFF3D6" floodOpacity="0.9" result="lightColor" />
        <feFlood floodColor="#4A3216" floodOpacity="0.55" result="darkColor" />
        <feComposite in="lightColor" in2="lightOffset" operator="in" result="lightShade" />
        <feComposite in="darkColor" in2="darkOffset" operator="in" result="darkShade" />
        <feFlood floodColor="#C9A24B" floodOpacity="0.9" result="goldColor" />
        <feComposite in="goldColor" in2="SourceAlpha" operator="in" result="goldShape" />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" result="grainNoise" />
        <feColorMatrix in="grainNoise" type="matrix" values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.6  0 0 0 0.5 0" result="grainTint" />
        <feComposite in="grainTint" in2="SourceAlpha" operator="in" result="grain" />
        <feMerge>
          <feMergeNode in="darkShade" />
          <feMergeNode in="goldShape" />
          <feMergeNode in="grain" />
          <feMergeNode in="lightShade" />
        </feMerge>
      </filter>

      {/* --- Silver dust: same treatment, cool tint --- */}
      <filter id={filterId('silver', uid)} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
        <feOffset in="blur" dx="-1" dy="-1" result="lightOffset" />
        <feOffset in="blur" dx="1" dy="1" result="darkOffset" />
        <feFlood floodColor="#FFFFFF" floodOpacity="0.9" result="lightColor" />
        <feFlood floodColor="#2E2E33" floodOpacity="0.5" result="darkColor" />
        <feComposite in="lightColor" in2="lightOffset" operator="in" result="lightShade" />
        <feComposite in="darkColor" in2="darkOffset" operator="in" result="darkShade" />
        <feFlood floodColor="#C0C0C4" floodOpacity="0.9" result="silverColor" />
        <feComposite in="silverColor" in2="SourceAlpha" operator="in" result="silverShape" />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" stitchTiles="stitch" result="grainNoise" />
        <feColorMatrix in="grainNoise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.45 0" result="grainTint" />
        <feComposite in="grainTint" in2="SourceAlpha" operator="in" result="grain" />
        <feMerge>
          <feMergeNode in="darkShade" />
          <feMergeNode in="silverShape" />
          <feMergeNode in="grain" />
          <feMergeNode in="lightShade" />
        </feMerge>
      </filter>
    </defs>
  );
}
