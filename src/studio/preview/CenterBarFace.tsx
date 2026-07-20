import { useId } from 'react';
import type { Design } from '../types';
import { MARK_SCALE_MAX, MARK_SCALE_MIN } from '../constraints';
import StudioDefs, { filterId } from './embossFilters';

/**
 * The face of the large X+1 center message bar: a chocolate-toned slab
 * carrying the customer's mark at `centerBarScale`, with an optional
 * embossed serif caption beneath.
 *
 * Rendered as an HTML block that fills its container (whatever aspect the
 * box-photo overlay rect dictates); the mark + caption sit in a centred,
 * aspect-preserving SVG layer so they never distort.
 */

const CHOCOLATE_GRADIENTS: Record<string, string> = {
  milk: 'linear-gradient(135deg, #9C6B3F 0%, #7B4A26 45%, #5C3317 100%)',
  semidark: 'linear-gradient(135deg, #6E4326 0%, #56331B 45%, #3A2010 100%)',
  dark: 'linear-gradient(135deg, #4A2A1C 0%, #382114 45%, #1F0F08 100%)',
};

export interface CenterBarFaceProps {
  design: Design;
  className?: string;
}

export default function CenterBarFace({ design, className = '' }: CenterBarFaceProps) {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9]/g, '');
  const filter = filterId(design.emboss, uid);
  const scale = Math.min(
    MARK_SCALE_MAX,
    Math.max(MARK_SCALE_MIN, design.centerBarScale ?? 1)
  );
  const caption = design.barCaption?.trim();
  const hasLogo = Boolean(design.logo?.maskDataUrl);

  // Layout in a 100×100 frame: with a caption, the mark rides higher to make
  // room for the line beneath it.
  const markSize = 46 * scale;
  const markCenterY = caption ? 42 : 50;
  const captionFontSize = caption
    ? Math.min(9, 130 / Math.max(6, caption.length))
    : 0;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: CHOCOLATE_GRADIENTS[design.chocolate] ?? CHOCOLATE_GRADIENTS.milk,
        borderRadius: '7%',
        boxShadow:
          'inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 2px 8px rgba(255,255,255,0.12), inset 0 -2px 8px rgba(0,0,0,0.28)',
      }}
    >
      {/* Soft top-light sheen to match the piece renders */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 70% at 32% 22%, rgba(255,255,255,0.32), rgba(255,255,255,0.08) 40%, transparent 75%)',
        }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Message bar preview"
      >
        <defs>
          <StudioDefs uid={uid} />
        </defs>
        {hasLogo && design.logo && (
          <image
            href={design.logo.maskDataUrl}
            x={50 - markSize / 2}
            y={markCenterY - markSize / 2}
            width={markSize}
            height={markSize}
            preserveAspectRatio="xMidYMid meet"
            filter={`url(#${filter})`}
          />
        )}
        {caption && (
          <text
            x={50}
            y={hasLogo ? 78 : 50}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Cormorant Garamond', serif"
            fontStyle="italic"
            fontSize={hasLogo ? captionFontSize : Math.min(11, 150 / Math.max(6, caption.length))}
            fill="#000"
            filter={`url(#${filter})`}
          >
            {caption}
          </text>
        )}
      </svg>
    </div>
  );
}
