import type { Dispatch } from 'react';
import { STEP_TITLES, STEP_SUBTITLES, STEP5_COPY, CENTER_BAR_COPY } from '../copy';
import type { CellAssignment, Design } from '../types';
import { BAR_CAPTION_MAX, MARK_SCALE_MAX, MARK_SCALE_MIN } from '../constraints';
import { useStudio } from '../state/StudioContext';
import { getPackagingOption } from '../data/packagingOptions';
import BoxPreview from '../preview/BoxPreview';
import type { StudioAction } from '../state/studioReducer';

function cellFor(cells: CellAssignment[], index: number): CellAssignment {
  return cells.find(c => c.index === index) ?? { index, content: 'pattern', chocolate: 'milk' };
}

/**
 * Bulk-only cell actions: every cell in the box (across all layers, for a
 * layered option) is set at once. There is no more per-cell tap-to-edit —
 * the box preview below is a live, non-interactive reflection of whichever
 * bulk action was last applied.
 */
function BulkActions({
  design,
  dispatch,
  totalCount,
}: {
  design: Design;
  dispatch: Dispatch<StudioAction>;
  totalCount: number;
}) {
  function applyBulk(kind: 'logo' | 'alternate' | 'first') {
    const first = cellFor(design.cells, 0);
    const cells: CellAssignment[] = Array.from({ length: totalCount }, (_, i) => {
      if (kind === 'logo') return { index: i, content: 'logo', chocolate: cellFor(design.cells, i).chocolate };
      if (kind === 'alternate')
        return { ...cellFor(design.cells, i), index: i, chocolate: i % 2 === 0 ? 'milk' : 'dark' };
      return { ...first, index: i };
    });
    dispatch({ type: 'SET_ALL_CELLS', cells });
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6 font-sans">
      <button
        onClick={() => applyBulk('logo')}
        className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border border-choco/20 text-choco hover:border-gold transition-all"
      >
        {STEP5_COPY.bulkAllLogo}
      </button>
      <button
        onClick={() => applyBulk('alternate')}
        className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border border-choco/20 text-choco hover:border-gold transition-all"
      >
        {STEP5_COPY.bulkAlternate}
      </button>
      <button
        onClick={() => applyBulk('first')}
        className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border border-choco/20 text-choco hover:border-gold transition-all"
      >
        {STEP5_COPY.bulkFillFirst}
      </button>
    </div>
  );
}

export default function Step5Arrange() {
  const { design, dispatch } = useStudio();

  const option = design.packaging ? getPackagingOption(design.packaging.type) : undefined;

  const headline = (
    <>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[5]}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{STEP_SUBTITLES[5]}</p>
    </>
  );

  // No packaging chosen yet.
  if (!design.packaging || !option) {
    return (
      <div>
        {headline}
        <div className="border border-dashed border-choco/20 rounded-sm p-12 text-center">
          <p className="text-clay font-medium mb-6">{STEP5_COPY.emptyBody}</p>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 4 })}
            className="bg-choco text-cream px-8 py-4 uppercase font-sans text-xs tracking-widest font-black hover:bg-gold transition-all"
          >
            {STEP5_COPY.emptyCta}
          </button>
        </div>
      </div>
    );
  }

  // X+1 signature box — the center bar carries its own mark/caption, and the
  // ring pieces get their content/chocolate via the same bulk actions used
  // by standard boxes (no per-ring-cell tapping).
  if (option.centerBar) {
    return (
      <div>
        {headline}
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start mb-10">
          <div className="bg-choco/5 p-6 flex items-center justify-center">
            <div className="w-full max-w-sm">
              <BoxPreview design={design} />
            </div>
          </div>

          <div className="border border-choco/15 bg-cream p-5 lg:sticky lg:top-40">
            <h3 className="font-black uppercase tracking-tight text-sm text-choco mb-4">
              {CENTER_BAR_COPY.panelTitle}
            </h3>

            <label className="block text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
              {CENTER_BAR_COPY.markSizeLabel}
            </label>
            <input
              type="range"
              min={MARK_SCALE_MIN}
              max={MARK_SCALE_MAX}
              step={0.01}
              value={design.centerBarScale ?? 1}
              onChange={e =>
                dispatch({ type: 'SET_CENTER_BAR_SCALE', scale: parseFloat(e.target.value) })
              }
              className="w-full accent-gold mb-5"
            />

            <label
              className="block text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2"
              htmlFor="studio-bar-caption"
            >
              {CENTER_BAR_COPY.captionLabel}
            </label>
            <input
              id="studio-bar-caption"
              type="text"
              maxLength={BAR_CAPTION_MAX}
              value={design.barCaption ?? ''}
              placeholder={CENTER_BAR_COPY.captionPlaceholder}
              onChange={e => dispatch({ type: 'SET_BAR_CAPTION', barCaption: e.target.value })}
              className="w-full border border-choco/15 bg-cream px-3 py-2 text-sm text-choco focus:border-gold outline-none"
            />
            <p className="text-[11px] text-clay/70 mt-1 italic font-serif">
              {CENTER_BAR_COPY.captionHint}
            </p>

            <p className="text-xs text-clay mt-5 pt-4 border-t border-choco/10">
              {option.grid ? CENTER_BAR_COPY.assortedNote : CENTER_BAR_COPY.singleBarNote}
            </p>
          </div>
        </div>

        {option.grid && (
          <div>
            <BulkActions design={design} dispatch={dispatch} totalCount={option.count} />
          </div>
        )}
      </div>
    );
  }

  // Single wrapped piece — arrangement doesn't apply.
  if (!option.grid || option.count <= 1) {
    return (
      <div>
        {headline}
        <div className="border border-choco/15 p-10 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-40 flex-shrink-0">
            <BoxPreview design={design} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight text-sm text-choco mb-2">
              {STEP5_COPY.singleTitle}
            </h3>
            <p className="text-sm text-clay">{STEP5_COPY.singleBody}</p>
          </div>
        </div>
      </div>
    );
  }

  // Standard box (single- or multi-layer): bulk actions apply across every
  // cell at once (all layers, for a layered option like a two-tier tin), and
  // the box preview below is a non-interactive, live reflection of the box.
  return (
    <div>
      {headline}
      <BulkActions design={design} dispatch={dispatch} totalCount={option.count} />
      <div className="bg-choco/5 p-6 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <BoxPreview design={design} />
        </div>
      </div>
    </div>
  );
}
