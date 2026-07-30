import { useState } from 'react';
import { motion } from 'motion/react';
import type { PrintedWrapper } from '../types';
import { STEP6_COPY } from '../copy';
import { WRAPPER_SCALE_MAX, WRAPPER_SCALE_MIN } from '../constraints';
import { FOIL_BAR_PHOTO_CROP, FOIL_BITE_PHOTO_CROP, cssCoverCrop } from './photoCrop';

export interface PrintedWrapperPreviewProps {
  /** Omit to render the foil photo alone, with no printed paper band — used to preview a plain foil wrap. */
  wrapper?: PrintedWrapper;
  /** Foil colour showing at the wrapper's ends; defaults to silver. */
  foil?: 'silver' | 'gold';
  /** True for the bar product (wide foil photo); other products use the square bite foil photo. */
  isBar?: boolean;
  compact?: boolean;
  /** Caption above the card; defaults to the printed-wrapper label. */
  label?: string;
}

// Flat colour used only as an instant/fallback backdrop while the foil
// photo loads or if it fails — the real foil sheen comes from the photo.
const FOIL_HEX: Record<'silver' | 'gold', string> = {
  silver: '#C0C0C4',
  gold: '#C9A24B',
};

// The paper band stops short of each end by this fraction of the total
// width, mirroring the real product where the printed wrapper sits ~0.5cm
// short of the bar ends and the foil shows through at both tips.
const FOIL_MARGIN_PCT = 6;

/**
 * A standalone "printed wrapper" card shown below the main chocolate/box
 * preview: a foil-wrapped piece where the foil spans the FULL width, and a
 * printed paper band sits on top, stopping short at each end so the foil
 * colour peeks out. The uploaded artwork cover-fits the band (scaled by the
 * customer's chosen image size) and/or the wrapper message overlays in full
 * colour, separate from the embossed mark on the chocolate itself.
 */
/**
 * One wrapper face: the foil photo with an optional printed paper band on
 * top. `showContent=false` renders a blank paper band (no uploaded image or
 * message) — used for the back panel, which always ships plain.
 */
function WrapperFace({
  wrapper,
  foil,
  isBar,
  compact,
  showContent,
}: {
  wrapper?: PrintedWrapper;
  foil?: 'silver' | 'gold';
  isBar: boolean;
  compact: boolean;
  showContent: boolean;
}) {
  const hasImage = showContent && Boolean(wrapper?.imageDataUrl);
  const hasMessage = showContent && Boolean(wrapper?.message?.trim());
  const foilColour = FOIL_HEX[foil ?? 'silver'];
  const imageScale = Math.min(WRAPPER_SCALE_MAX, Math.max(WRAPPER_SCALE_MIN, wrapper?.scale ?? 1));

  const [photoFailed, setPhotoFailed] = useState(false);
  const foilCrop = (isBar ? FOIL_BAR_PHOTO_CROP : FOIL_BITE_PHOTO_CROP)[foil ?? 'silver'];
  const foilPhotoSrc = isBar ? `/studio/foil-${foil ?? 'silver'}.webp` : `/studio/foil-bite-${foil ?? 'silver'}.webp`;
  const { aspectRatio, imgStyle } = cssCoverCrop(foilCrop);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
      style={{
        aspectRatio,
        // Instant/fallback backdrop; the real foil photo layers on top.
        background: `linear-gradient(135deg, ${foilColour} 0%, ${foilColour}D9 45%, ${foilColour} 100%)`,
      }}
    >
      {!photoFailed && (
        <img
          src={foilPhotoSrc}
          alt=""
          className="pointer-events-none absolute"
          style={imgStyle}
          onError={() => setPhotoFailed(true)}
        />
      )}

      {/* Printed paper band — stops short of each end so the foil shows. Only rendered when a printed wrapper is actually configured. */}
      {wrapper && (
        <div
          className="absolute inset-y-0 overflow-hidden shadow-[0_0_0_1px_rgba(45,30,23,0.18)]"
          style={{
            left: `${FOIL_MARGIN_PCT}%`,
            right: `${FOIL_MARGIN_PCT}%`,
            background: 'linear-gradient(180deg, #FDFBF7 0%, #F2ECE0 50%, #FDFBF7 100%)',
          }}
        >
          {hasImage && (
            <img
              src={wrapper!.imageDataUrl}
              alt="Wrapper artwork"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ transform: `scale(${imageScale})`, transformOrigin: '50% 50%' }}
            />
          )}

          {/* Paper fold shading: soft vertical creases + edge vignette so the band reads as wrapped stock */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(45,30,23,0.16) 0%, transparent 6%, transparent 33%, rgba(45,30,23,0.05) 34%, transparent 38%, transparent 62%, rgba(45,30,23,0.05) 63%, transparent 67%, transparent 94%, rgba(45,30,23,0.16) 100%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.6), inset 0 -1.5px 0 rgba(45,30,23,0.12)' }}
          />

          {hasMessage && (
            <div className="absolute inset-0 flex items-center justify-center px-[8%]">
              <p
                className={`text-center font-serif italic leading-tight ${
                  compact ? 'text-[12px]' : 'text-lg'
                }`}
                style={{
                  color: hasImage ? '#FDFBF7' : '#2D1E17',
                  paintOrder: hasImage ? 'stroke' : undefined,
                  WebkitTextStroke: hasImage ? '1.2px rgba(45,30,23,0.65)' : undefined,
                }}
              >
                {wrapper!.message}
              </p>
            </div>
          )}

          {!hasImage && !hasMessage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p
                className={`font-sans uppercase tracking-[0.15em] text-choco/30 ${
                  compact ? 'text-[8px]' : 'text-[10px]'
                }`}
              >
                {showContent ? STEP6_COPY.printedWrapperImageLabel : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PrintedWrapperPreview({
  wrapper,
  foil,
  isBar = false,
  compact = false,
  label = STEP6_COPY.printedWrapperToggleLabel,
}: PrintedWrapperPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
      style={{ maxWidth: compact ? 260 : 420 }}
    >
      <p
        className={`mb-1.5 text-center font-sans uppercase tracking-[0.2em] text-cream/50 ${
          compact ? 'text-[8px]' : 'text-[9px]'
        }`}
      >
        {label}
      </p>
      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div>
          <WrapperFace wrapper={wrapper} foil={foil} isBar={isBar} compact={compact} showContent />
          <p
            className={`mt-1 text-center font-sans uppercase tracking-[0.2em] text-cream/40 ${
              compact ? 'text-[7px]' : 'text-[8px]'
            }`}
          >
            {STEP6_COPY.printedWrapperFrontLabel}
          </p>
        </div>
        <div>
          <WrapperFace
            wrapper={wrapper ? { enabled: true } : undefined}
            foil={foil}
            isBar={isBar}
            compact={compact}
            showContent={false}
          />
          <p
            className={`mt-1 text-center font-sans uppercase tracking-[0.2em] text-cream/40 ${
              compact ? 'text-[7px]' : 'text-[8px]'
            }`}
          >
            {STEP6_COPY.printedWrapperBackLabel}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
