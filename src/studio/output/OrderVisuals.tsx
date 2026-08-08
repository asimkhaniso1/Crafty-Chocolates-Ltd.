import type { ReactNode } from 'react';
import { activeRenderer } from '../preview/DesignRenderer';
import PrintedWrapperPreview from '../preview/PrintedWrapperPreview';
import { getPackagingOption } from '../data/packagingOptions';
import { isBarProduct } from '../data/studioProducts';
import { ORDER_VISUALS_COPY } from '../copy';
import type { Design } from '../types';

function Tile({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div
      className={`bg-choco text-cream rounded-sm p-4 flex flex-col items-center gap-3 ${
        wide ? 'col-span-2' : ''
      }`}
    >
      <div className="flex w-full flex-1 items-center justify-center min-h-[150px]">{children}</div>
      <span className="text-[9px] uppercase tracking-[0.2em] text-cream/60 font-sans font-bold">
        {label}
      </span>
    </div>
  );
}

/**
 * "How your order will look": every visual the order actually includes —
 * the boxed arrangement (when a boxed packaging is chosen), the piece
 * close-up, and the foil/printed-wrapper card when pieces ship wrapped.
 * Rendered live from the design (not a snapshot), so it always matches the
 * chosen wrap state. Used on the quote step and the printable quote sheet.
 */
export default function OrderVisuals({ design }: { design: Design }) {
  const option = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  const boxEligible = Boolean(option && ((option.grid && option.count > 1) || option.centerBar));
  const printedWrapperEnabled = Boolean(design.extras.printedWrapper?.enabled);
  const foilWrapped =
    Boolean(design.extras.foil) &&
    (design.packaging?.type === 'individual' ||
      design.product === 'custom' ||
      design.extras.piecesWrapped === true);
  const showWrapperTile = printedWrapperEnabled || foilWrapped;
  const { PieceView, BoxView } = activeRenderer;

  return (
    <div className="grid grid-cols-2 gap-4">
      {boxEligible && (
        <Tile label={ORDER_VISUALS_COPY.boxed}>
          <div className="w-full" style={{ maxWidth: 220 }}>
            <BoxView design={design} />
          </div>
        </Tile>
      )}
      <Tile label={ORDER_VISUALS_COPY.piece} wide={!boxEligible && !showWrapperTile}>
        <div className="w-full" style={{ maxWidth: 170 }}>
          <PieceView design={design} size={170} />
        </div>
      </Tile>
      {showWrapperTile && (
        <Tile
          label={printedWrapperEnabled ? ORDER_VISUALS_COPY.printedWrapper : ORDER_VISUALS_COPY.foil}
          wide
        >
          <PrintedWrapperPreview
            wrapper={printedWrapperEnabled ? design.extras.printedWrapper : undefined}
            foil={design.extras.foil}
            isBar={isBarProduct(design.product)}
            label=""
          />
        </Tile>
      )}
    </div>
  );
}
