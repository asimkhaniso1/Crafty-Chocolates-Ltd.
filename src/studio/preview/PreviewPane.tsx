import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, Gem } from 'lucide-react';
import { useStudio } from '../state/StudioContext';
import { getStudioProduct, isBarProduct } from '../data/studioProducts';
import { getPackagingOption } from '../data/packagingOptions';
import { activeRenderer } from './DesignRenderer';
import PrintedWrapperPreview from './PrintedWrapperPreview';
import { STEP6_COPY } from '../copy';

const CHOCOLATE_LABEL: Record<string, string> = {
  milk: 'Milk',
  semidark: 'Semi-Dark',
};

const EMBOSS_LABEL: Record<string, string> = {
  emboss: 'Embossed',
};

export interface PreviewPaneProps {
  compact?: boolean;
  /**
   * Attaches this instance's root node to StudioContext's shared
   * `previewRef`, for Step7Quote's arrangement-snapshot capture. Only one
   * mounted PreviewPane should set this — StudioPage's "primary" desktop/
   * custom-brief instance, not the mobile preview strip (which is
   * CSS-hidden on larger viewports and would otherwise capture blank).
   */
  registerRef?: boolean;
}

type ViewMode = 'piece' | 'box';

/**
 * Live 2.5D preview of the design in progress. Shows the boxed arrangement
 * once a multi-piece packaging is selected and the shopper has reached the
 * arrangement step; otherwise shows a single piece close-up.
 */
export default function PreviewPane({ compact = false, registerRef = false }: PreviewPaneProps) {
  const { design, previewRef } = useStudio();
  const product = design.product ? getStudioProduct(design.product) : undefined;
  const packagingOption = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  const isMultiPiece = !!packagingOption?.grid && packagingOption.count > 1;
  // The catalog selection (step 1) sets product and packaging together, so
  // the box view is eligible as soon as a multi-piece box is chosen — no
  // step gate needed.
  const boxEligible = isMultiPiece;
  const isBar = isBarProduct(design.product);
  const printedWrapperEnabled = Boolean(design.extras.printedWrapper?.enabled);
  const showFoilOnlyPreview =
    !printedWrapperEnabled && Boolean(design.extras.foil) && design.packaging?.type === 'individual';

  const [manualMode, setManualMode] = useState<ViewMode | null>(null);
  const mode: ViewMode = manualMode ?? (boxEligible ? 'box' : 'piece');
  const canToggle = isMultiPiece;

  const { PieceView, BoxView } = activeRenderer;

  const caption = useMemo(() => {
    const parts = [
      product ? product.name : 'No canvas selected',
      CHOCOLATE_LABEL[design.chocolate] ?? design.chocolate,
      EMBOSS_LABEL[design.emboss] ?? design.emboss,
    ];
    return parts.join(' · ');
  }, [product, design.chocolate, design.emboss]);

  return (
    <div
      ref={registerRef ? previewRef : undefined}
      className={`relative flex h-full w-full flex-col items-center justify-center bg-choco text-cream ${
        compact ? 'gap-2 p-3' : 'gap-6 p-8'
      }`}
    >
      {canToggle && (
        <div
          className={`absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-cream/15 bg-choco/70 p-1 backdrop-blur ${
            compact ? 'scale-90' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => setManualMode('piece')}
            aria-pressed={mode === 'piece'}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors ${
              mode === 'piece' ? 'bg-gold text-choco' : 'text-cream/60 hover:text-cream'
            }`}
          >
            <Gem size={12} /> Piece
          </button>
          <button
            type="button"
            onClick={() => setManualMode('box')}
            aria-pressed={mode === 'box'}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors ${
              mode === 'box' ? 'bg-gold text-choco' : 'text-cream/60 hover:text-cream'
            }`}
          >
            <Box size={12} /> Box
          </button>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`flex w-full flex-1 items-center justify-center ${compact ? 'min-h-0' : ''}`}
          style={{ maxWidth: compact ? 220 : 340 }}
        >
          {mode === 'box' ? (
            <BoxView design={design} />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PieceView design={design} size={compact ? 120 : 260} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div
        className={`font-sans text-center uppercase tracking-[0.2em] ${
          compact ? 'space-y-0.5 text-[9px]' : 'space-y-1 text-xs'
        }`}
      >
        <p className="font-serif text-sm italic tracking-normal text-gold not-italic">{caption}</p>
      </div>

      {printedWrapperEnabled && design.extras.printedWrapper && (
        <PrintedWrapperPreview
          wrapper={design.extras.printedWrapper}
          foil={design.extras.foil}
          isBar={isBar}
          compact={compact}
        />
      )}

      {showFoilOnlyPreview && (
        <PrintedWrapperPreview
          foil={design.extras.foil}
          isBar={isBar}
          compact={compact}
          label={STEP6_COPY.foilPreviewLabel}
        />
      )}
    </div>
  );
}
