import { useId, useState } from 'react';
import type { Design } from '../types';
import { MARK_SCALE_MAX, MARK_SCALE_MIN } from '../constraints';
import { getPackagingOption } from '../data/packagingOptions';
import StudioDefs, { embossFilterId } from './embossFilters';
import { BAR_PHOTO_CROP, PIECE_PHOTO_CROP, coverCropRect } from './photoCrop';

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
};

export interface CenterBarFaceProps {
  design: Design;
  className?: string;
  /** Face shape; defaults to the selected packaging's centerBarShape ('square'). */
  shape?: 'square' | 'rectangle';
}

export default function CenterBarFace({ design, className = '', shape }: CenterBarFaceProps) {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9]/g, '');
  const filter = embossFilterId(design.chocolate, uid);
  const scale = Math.min(
    MARK_SCALE_MAX,
    Math.max(MARK_SCALE_MIN, design.centerBarScale ?? 1)
  );
  const caption = design.barCaption?.trim();
  const hasLogo = Boolean(design.logo?.maskDataUrl);

  const resolvedShape =
    shape ?? getPackagingOption(design.packaging?.type ?? '')?.centerBarShape ?? 'square';
  const isRect = resolvedShape === 'rectangle';
  // Frame: square uses a 100×100 viewBox (as before); rectangle doubles the
  // width to 200×100 (a 2:1 face) — the height stays 100 so mark/caption
  // sizing below (expressed against a fixed height) needs no other change.
  const W = isRect ? 200 : 100;
  const H = 100;

  // Photoreal base: square center bars reuse the square piece photo;
  // rectangular ones (the 4+1's 120×60mm bar) use the bar photo instead.
  // Falls back to the CSS gradient below on error.
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoCrop = isRect ? BAR_PHOTO_CROP[design.chocolate] : PIECE_PHOTO_CROP[design.chocolate];
  const photoRect = coverCropRect(photoCrop, W, H);
  const photoHref = isRect ? `/studio/bar-${design.chocolate}.webp` : `/studio/piece-${design.chocolate}.webp`;

  // Layout in a W×100 frame: with a caption, the mark rides higher to make
  // room for the line beneath it. The rectangular face has twice the
  // horizontal room, so its caption gets a wider character budget.
  const markSize = (isRect ? 34 : 46) * scale;
  const markCenterX = W / 2;
  const markCenterY = caption ? 42 : 50;
  const captionFontSize = caption
    ? Math.min(isRect ? 10 : 9, (isRect ? 260 : 130) / Math.max(6, caption.length))
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
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Message bar preview"
      >
        <defs>
          <StudioDefs uid={uid} />
          <clipPath id={`studio-centerbar-clip-${uid}`}>
            <rect x={0} y={0} width={W} height={H} rx={7} ry={7} />
          </clipPath>
        </defs>
        {!photoFailed && (
          <image
            href={photoHref}
            x={photoRect.x}
            y={photoRect.y}
            width={photoRect.width}
            height={photoRect.height}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#studio-centerbar-clip-${uid})`}
            onError={() => setPhotoFailed(true)}
          />
        )}
        {hasLogo && design.logo && (
          <image
            href={design.logo.maskDataUrl}
            x={markCenterX - markSize / 2}
            y={markCenterY - markSize / 2}
            width={markSize}
            height={markSize}
            preserveAspectRatio="xMidYMid meet"
            filter={`url(#${filter})`}
            // The mask raster (up to 1024px) is always scaled DOWN into this
            // small viewBox unit, never up.
            style={{ imageRendering: 'auto' }}
          />
        )}
        {caption && (
          <text
            x={markCenterX}
            y={hasLogo ? 78 : 50}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Cormorant Garamond', serif"
            fontStyle="italic"
            fontSize={
              hasLogo
                ? captionFontSize
                : Math.min(isRect ? 12 : 11, (isRect ? 300 : 150) / Math.max(6, caption.length))
            }
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
