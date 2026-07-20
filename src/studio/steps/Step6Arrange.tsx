import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { STEP_TITLES, STEP_SUBTITLES, STEP6_COPY } from '../copy';
import type { CellAssignment, CellContent, ChocolateType } from '../types';
import { useStudio } from '../state/StudioContext';
import { getPackagingOption } from '../data/packagingOptions';
import ChocolatePreview from '../preview/ChocolatePreview';

const CONTENT_OPTIONS: CellContent[] = ['logo', 'message', 'initials', 'pattern'];
const CHOCOLATE_OPTIONS: ChocolateType[] = ['milk', 'dark', 'white'];

function cellFor(cells: CellAssignment[], index: number): CellAssignment {
  return cells.find(c => c.index === index) ?? { index, content: 'pattern', chocolate: 'milk' };
}

export default function Step6Arrange() {
  const { design, dispatch } = useStudio();
  const [selected, setSelected] = useState<number | null>(null);

  const option = design.packaging ? getPackagingOption(design.packaging.type) : undefined;

  const headline = (
    <>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[6]}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{STEP_SUBTITLES[6]}</p>
    </>
  );

  // No packaging chosen yet.
  if (!design.packaging || !option) {
    return (
      <div>
        {headline}
        <div className="border border-dashed border-choco/20 rounded-sm p-12 text-center">
          <p className="text-clay font-medium mb-6">{STEP6_COPY.emptyBody}</p>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 5 })}
            className="bg-choco text-cream px-8 py-4 uppercase font-sans text-xs tracking-widest font-black hover:bg-gold transition-all"
          >
            {STEP6_COPY.emptyCta}
          </button>
        </div>
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
              {STEP6_COPY.singleTitle}
            </h3>
            <p className="text-sm text-clay">{STEP6_COPY.singleBody}</p>
          </div>
        </div>
      </div>
    );
  }

  const { rows, cols } = option.grid;
  const cells = Array.from({ length: option.count }, (_, i) => cellFor(design.cells, i));
  const selectedCell = selected !== null ? cellFor(design.cells, selected) : null;

  function updateSelected(patch: Partial<CellAssignment>) {
    if (selected === null) return;
    const current = cellFor(design.cells, selected);
    dispatch({ type: 'SET_CELL', cell: { ...current, ...patch } });
  }

  function applyBulk(kind: 'logo' | 'alternate' | 'first') {
    const first = cellFor(design.cells, 0);
    const next: CellAssignment[] = Array.from({ length: option!.count }, (_, i) => {
      if (kind === 'logo') return { index: i, content: 'logo', chocolate: cellFor(design.cells, i).chocolate };
      if (kind === 'alternate')
        return { ...cellFor(design.cells, i), chocolate: i % 2 === 0 ? 'milk' : 'dark' };
      return { ...first, index: i };
    });
    dispatch({ type: 'SET_ALL_CELLS', cells: next });
  }

  const panelContent = selectedCell && (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black uppercase tracking-tight text-sm text-choco">
          {STEP6_COPY.panelTitle(selectedCell.index)}
        </h3>
        <button
          onClick={() => setSelected(null)}
          className="text-choco/50 hover:text-choco lg:hidden"
          aria-label={STEP6_COPY.doneCta}
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
          {STEP6_COPY.panelContentLabel}
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
              {STEP6_COPY.contentLabels[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
          {STEP6_COPY.panelChocolateLabel}
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
              {STEP6_COPY.chocolateLabels[c]}
            </button>
          ))}
        </div>
      </div>

      {(selectedCell.content === 'message' || selectedCell.content === 'initials') && (
        <div className="mb-2">
          <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
            {STEP6_COPY.panelTextLabel}
          </p>
          <input
            type="text"
            value={selectedCell.text ?? ''}
            maxLength={selectedCell.content === 'initials' ? 4 : 40}
            placeholder={
              selectedCell.content === 'initials'
                ? STEP6_COPY.panelInitialsPlaceholder
                : STEP6_COPY.panelMessagePlaceholder
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
        {STEP6_COPY.doneCta}
      </button>
    </>
  );

  return (
    <div>
      {headline}

      {/* Bulk actions */}
      <div className="flex flex-wrap gap-2 mb-6 font-sans">
        <button
          onClick={() => applyBulk('logo')}
          className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border border-choco/20 text-choco hover:border-gold transition-all"
        >
          {STEP6_COPY.bulkAllLogo}
        </button>
        <button
          onClick={() => applyBulk('alternate')}
          className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border border-choco/20 text-choco hover:border-gold transition-all"
        >
          {STEP6_COPY.bulkAlternate}
        </button>
        <button
          onClick={() => applyBulk('first')}
          className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border border-choco/20 text-choco hover:border-gold transition-all"
        >
          {STEP6_COPY.bulkFillFirst}
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
              {STEP6_COPY.hintLabel}
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
