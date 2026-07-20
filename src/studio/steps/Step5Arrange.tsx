import { useState, type Dispatch } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { STEP_TITLES, STEP_SUBTITLES, STEP5_COPY, CENTER_BAR_COPY } from '../copy';
import type { CellAssignment, CellContent, ChocolateType, Design, PackagingOption } from '../types';
import { BAR_CAPTION_MAX, MARK_SCALE_MAX, MARK_SCALE_MIN } from '../constraints';
import { useStudio } from '../state/StudioContext';
import { getPackagingOption } from '../data/packagingOptions';
import ChocolatePreview from '../preview/ChocolatePreview';
import BoxPreview from '../preview/BoxPreview';
import type { StudioAction } from '../state/studioReducer';

const CONTENT_OPTIONS: CellContent[] = ['logo', 'message', 'initials', 'pattern'];
const CHOCOLATE_OPTIONS: ChocolateType[] = ['milk', 'dark', 'semidark'];

function cellFor(cells: CellAssignment[], index: number): CellAssignment {
  return cells.find(c => c.index === index) ?? { index, content: 'pattern', chocolate: 'milk' };
}

/**
 * Shared per-cell arrange grid + tap-to-edit panel, used for standard boxes
 * and (alongside the center-bar panel) for X+1 ring pieces.
 */
function ArrangeGrid({
  design,
  dispatch,
  option,
  indexOffset = 0,
}: {
  design: Design;
  dispatch: Dispatch<StudioAction>;
  option: PackagingOption;
  /** First absolute cell index this grid edits — non-zero for one layer of a multi-layer option. */
  indexOffset?: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const { rows, cols } = option.grid!;
  // Per-layer cell count: for a single-layer option this is option.count;
  // for a layered option (e.g. a two-tier tin) it's just this layer's grid.
  const layerCount = rows * cols;
  const cells = Array.from({ length: layerCount }, (_, i) => cellFor(design.cells, indexOffset + i));
  const selectedCell = selected !== null ? cellFor(design.cells, selected) : null;

  function updateSelected(patch: Partial<CellAssignment>) {
    if (selected === null) return;
    const current = cellFor(design.cells, selected);
    dispatch({ type: 'SET_CELL', cell: { ...current, ...patch } });
  }

  function applyBulk(kind: 'logo' | 'alternate' | 'first') {
    const first = cellFor(design.cells, indexOffset);
    const layerCells: CellAssignment[] = Array.from({ length: layerCount }, (_, i) => {
      const idx = indexOffset + i;
      if (kind === 'logo') return { index: idx, content: 'logo', chocolate: cellFor(design.cells, idx).chocolate };
      if (kind === 'alternate')
        return { ...cellFor(design.cells, idx), chocolate: i % 2 === 0 ? 'milk' : 'dark' };
      return { ...first, index: idx };
    });
    // Only this layer's cells are replaced; other layers' assignments (and
    // any other cells outside this grid's range) are preserved as-is.
    const otherCells = design.cells.filter(c => c.index < indexOffset || c.index >= indexOffset + layerCount);
    dispatch({ type: 'SET_ALL_CELLS', cells: [...otherCells, ...layerCells] });
  }

  const panelContent = selectedCell && (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black uppercase tracking-tight text-sm text-choco">
          {STEP5_COPY.panelTitle(selectedCell.index - indexOffset)}
        </h3>
        <button
          onClick={() => setSelected(null)}
          className="text-choco/50 hover:text-choco lg:hidden"
          aria-label={STEP5_COPY.doneCta}
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
          {STEP5_COPY.panelContentLabel}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CONTENT_OPTIONS.map(c => (
            <button
              key={c}
              onClick={() => updateSelected({ content: c })}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wide border transition-all ${
                selectedCell.content === c
                  ? 'bg-choco text-cream border-choco'
                  : 'border-choco/15 text-choco hover:border-gold'
              }`}
            >
              {STEP5_COPY.contentLabels[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
          {STEP5_COPY.panelChocolateLabel}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {CHOCOLATE_OPTIONS.map(c => (
            <button
              key={c}
              onClick={() => updateSelected({ chocolate: c })}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wide border transition-all ${
                selectedCell.chocolate === c
                  ? 'bg-choco text-cream border-choco'
                  : 'border-choco/15 text-choco hover:border-gold'
              }`}
            >
              {STEP5_COPY.chocolateLabels[c]}
            </button>
          ))}
        </div>
      </div>

      {(selectedCell.content === 'message' || selectedCell.content === 'initials') && (
        <div className="mb-2">
          <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
            {STEP5_COPY.panelTextLabel}
          </p>
          <input
            type="text"
            value={selectedCell.text ?? ''}
            maxLength={selectedCell.content === 'initials' ? 4 : 40}
            placeholder={
              selectedCell.content === 'initials'
                ? STEP5_COPY.panelInitialsPlaceholder
                : STEP5_COPY.panelMessagePlaceholder
            }
            onChange={e => updateSelected({ text: e.target.value })}
            className="w-full border border-choco/15 bg-cream px-3 py-2 text-sm text-choco focus:border-gold outline-none"
          />
        </div>
      )}

      <button
        onClick={() => setSelected(null)}
        className="hidden lg:block mt-6 w-full bg-choco text-cream px-6 py-3 uppercase font-sans text-xs tracking-widest font-black hover:bg-gold transition-all"
      >
        {STEP5_COPY.doneCta}
      </button>
    </>
  );

  return (
    <div>
      {/* Bulk actions */}
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

      <div className="grid lg:grid-cols-[1fr_260px] gap-8">
        <div
          className="grid gap-3 bg-choco/5 p-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {cells.map(cell => (
            <button
              key={cell.index}
              onClick={() => setSelected(cell.index)}
              className={`relative aspect-square flex items-center justify-center bg-cream transition-all rounded-sm ${
                selected === cell.index ? 'ring-2 ring-gold' : 'hover:ring-1 hover:ring-choco/30'
              }`}
            >
              <ChocolatePreview design={design} cell={cell} size={80} />
            </button>
          ))}
        </div>

        {/* Desktop side panel */}
        <div className="hidden lg:block">
          {selectedCell ? (
            <div className="border border-choco/15 bg-cream p-5 sticky top-40">{panelContent}</div>
          ) : (
            <div className="border border-dashed border-choco/20 p-5 text-xs text-clay/60 uppercase tracking-[0.15em] text-center">
              {STEP5_COPY.hintLabel}
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {selectedCell && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-cream border-t border-choco/15 p-5 rounded-t-2xl shadow-[0_-10px_30px_rgba(45,30,23,0.25)] max-h-[70vh] overflow-y-auto"
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * A multi-layer packaging (e.g. a two-tier tin) arranges one layer's worth
 * of cells at a time, behind a "Layer 1 / Layer 2" tab switch; each tab
 * reuses the same ArrangeGrid, offset to that layer's slice of `cells`.
 */
function LayeredArrangeGrid({
  design,
  dispatch,
  option,
}: {
  design: Design;
  dispatch: Dispatch<StudioAction>;
  option: PackagingOption;
}) {
  const layers = option.layers ?? 1;
  const perLayer = option.grid!.rows * option.grid!.cols;
  const [activeLayer, setActiveLayer] = useState(0);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 font-sans">
        {Array.from({ length: layers }, (_, i) => (
          <button
            key={i}
            onClick={() => setActiveLayer(i)}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold border transition-all ${
              activeLayer === i
                ? 'bg-choco text-cream border-choco'
                : 'border-choco/20 text-choco hover:border-gold'
            }`}
          >
            {STEP5_COPY.layerTabLabel(i + 1)}
          </button>
        ))}
      </div>
      {/* Keyed wrapper (rather than a key on ArrangeGrid itself) remounts on
          layer switch, resetting the grid's internal "selected cell" state. */}
      <div key={activeLayer}>
        <ArrangeGrid design={design} dispatch={dispatch} option={option} indexOffset={activeLayer * perLayer} />
      </div>
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
  // ring pieces are individually arrangeable via the same grid used by
  // standard boxes.
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

        {option.grid && <ArrangeGrid design={design} dispatch={dispatch} option={option} />}
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
            <ChocolatePreview design={design} size={160} />
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

  // Multi-layer packaging (e.g. a two-tier tin): arrange one layer at a
  // time behind a tab switch, reusing the same per-cell grid.
  if ((option.layers ?? 1) > 1) {
    return (
      <div>
        {headline}
        <LayeredArrangeGrid design={design} dispatch={dispatch} option={option} />
      </div>
    );
  }

  return (
    <div>
      {headline}
      <ArrangeGrid design={design} dispatch={dispatch} option={option} />
    </div>
  );
}
