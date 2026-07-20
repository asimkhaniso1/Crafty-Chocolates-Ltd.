import { motion } from 'motion/react';
import type { PrintedWrapper } from '../types';
import { STEP6_COPY } from '../copy';

export interface PrintedWrapperPreviewProps {
  wrapper: PrintedWrapper;
  compact?: boolean;
}

/**
 * A standalone "printed wrapper" card shown below the main chocolate/box
 * preview: a horizontal paper band with the uploaded artwork cover-fitted
 * and/or the wrapper message in full colour, separate from the embossed
 * mark on the chocolate itself.
 */
export default function PrintedWrapperPreview({ wrapper, compact = false }: PrintedWrapperPreviewProps) {
  const hasImage = Boolean(wrapper.imageDataUrl);
  const hasMessage = Boolean(wrapper.message?.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
      style={{ maxWidth: compact ? 220 : 340 }}
    >
      <p
        className={`mb-1.5 text-center font-sans uppercase tracking-[0.2em] text-cream/50 ${
          compact ? 'text-[8px]' : 'text-[9px]'
        }`}
      >
        {STEP6_COPY.printedWrapperToggleLabel}
      </p>
      <div
        className="relative w-full overflow-hidden rounded-lg shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
        style={{
          aspectRatio: '3.2 / 1',
          background: 'linear-gradient(180deg, #FDFBF7 0%, #F2ECE0 50%, #FDFBF7 100%)',
        }}
      >
        {hasImage && (
          <img
            src={wrapper.imageDataUrl}
            alt="Wrapper artwork"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Paper fold shading: soft vertical creases + edge vignette so the band reads as wrapped stock */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(45,30,23,0.14) 0%, transparent 5%, transparent 33%, rgba(45,30,23,0.05) 34%, transparent 38%, transparent 62%, rgba(45,30,23,0.05) 63%, transparent 67%, transparent 95%, rgba(45,30,23,0.14) 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.6), inset 0 -1.5px 0 rgba(45,30,23,0.12)' }}
        />

        {hasMessage && (
          <div className="absolute inset-0 flex items-center justify-center px-[6%]">
            <p
              className={`text-center font-serif italic leading-tight ${
                compact ? 'text-[11px]' : 'text-base'
              }`}
              style={{
                color: hasImage ? '#FDFBF7' : '#2D1E17',
                paintOrder: hasImage ? 'stroke' : undefined,
                WebkitTextStroke: hasImage ? '1.2px rgba(45,30,23,0.65)' : undefined,
              }}
            >
              {wrapper.message}
            </p>
          </div>
        )}

        {!hasImage && !hasMessage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className={`font-sans uppercase tracking-[0.15em] text-choco/30 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
              {STEP6_COPY.printedWrapperImageLabel}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
