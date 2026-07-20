import { useMemo, useState } from 'react';
import { STEP_TITLES, STEP_SUBTITLES, PACKAGING_OCCASION_LABELS, STEP4_COPY } from '../copy';
import { PACKAGING_OPTIONS, getPackagingOption } from '../data/packagingOptions';
import { useStudio } from '../state/StudioContext';

const OCCASION_FILTERS = ['wedding', 'eid', 'corporate', 'birthday'] as const;
type OccasionFilter = (typeof OCCASION_FILTERS)[number] | 'all';

/** Small dot-grid glyph representing a packaging option's arrangement. */
function GridGlyph({ rows, cols }: { rows: number; cols: number }) {
  const total = rows * cols;
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="block aspect-square w-2 rounded-full bg-current" />
      ))}
    </div>
  );
}

type Presentation = 'boxed' | 'loose';

/** Two-card chooser: presentation style comes before the packaging options. */
function PresentationChooser({
  view,
  onChooseBoxed,
  onChooseLoose,
}: {
  view: Presentation | null;
  onChooseBoxed: () => void;
  onChooseLoose: () => void;
}) {
  return (
    <div className="mb-8">
      <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-3">
        {STEP4_COPY.presentationTitle}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <button
          onClick={onChooseBoxed}
          className={`relative text-left p-5 border transition-all ${
            view === 'boxed' ? 'border-choco bg-choco text-cream' : 'border-choco/15 hover:border-gold bg-cream'
          }`}
        >
          <h4 className="font-black uppercase tracking-tight text-sm">
            {STEP4_COPY.presentationBoxedTitle}
          </h4>
          <p className={`text-xs mt-1 ${view === 'boxed' ? 'text-cream/70' : 'text-clay'}`}>
            {STEP4_COPY.presentationBoxedBody}
          </p>
          <span
            className={`inline-block mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${
              view === 'boxed' ? 'text-gold' : 'text-choco/40'
            }`}
          >
            {view === 'boxed' ? STEP4_COPY.presentationChosenCta : STEP4_COPY.presentationChooseCta}
          </span>
        </button>
        <button
          onClick={onChooseLoose}
          className={`relative text-left p-5 border transition-all ${
            view === 'loose' ? 'border-choco bg-choco text-cream' : 'border-choco/15 hover:border-gold bg-cream'
          }`}
        >
          <h4 className="font-black uppercase tracking-tight text-sm">
            {STEP4_COPY.presentationLooseTitle}
          </h4>
          <p className={`text-xs mt-1 ${view === 'loose' ? 'text-cream/70' : 'text-clay'}`}>
            {STEP4_COPY.presentationLooseBody}
          </p>
          <span
            className={`inline-block mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${
              view === 'loose' ? 'text-gold' : 'text-choco/40'
            }`}
          >
            {view === 'loose' ? STEP4_COPY.presentationChosenCta : STEP4_COPY.presentationChooseCta}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function Step4Packaging() {
  const { design, dispatch } = useStudio();
  const [filter, setFilter] = useState<OccasionFilter>('all');

  // Derived once on mount (and again whenever this step remounts, e.g. when
  // revisiting it) so the chooser reflects whatever packaging is currently
  // selected — no extra state field needed.
  const initialView: Presentation | null =
    design.packaging?.type === 'individual' ? 'loose' : design.packaging ? 'boxed' : null;
  const [view, setView] = useState<Presentation | null>(initialView);

  const boxedOptions = useMemo(
    () => PACKAGING_OPTIONS.filter(o => o.type !== 'individual'),
    []
  );
  const individualOption = getPackagingOption('individual');

  const options = useMemo(() => {
    if (filter === 'all') return boxedOptions;
    return boxedOptions.filter(o => o.occasions.includes(filter));
  }, [filter, boxedOptions]);

  function handleChooseLoose() {
    setView('loose');
    dispatch({ type: 'SET_PACKAGING', packaging: { type: 'individual', count: 1 } });
  }

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[4]}
      </h2>
      <p className="text-clay font-medium mb-8 max-w-lg">{STEP_SUBTITLES[4]}</p>

      <PresentationChooser view={view} onChooseBoxed={() => setView('boxed')} onChooseLoose={handleChooseLoose} />

      {view === 'loose' && individualOption && (
        <div className="border border-choco bg-choco text-cream p-6">
          <h3 className="font-black uppercase tracking-tight text-sm">{STEP4_COPY.looseConfirmedTitle}</h3>
          <p className="text-xs mt-1 text-cream/70">{STEP4_COPY.piecesLabel(individualOption.count)}</p>
          <p className="text-[11px] mt-3 italic font-serif text-cream/60">{STEP4_COPY.individualNote}</p>
        </div>
      )}

      {view === 'boxed' && (
        <>
          {/* Occasion filter chips */}
          <div className="flex flex-wrap gap-2 mb-8 font-sans">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border transition-all ${
                filter === 'all'
                  ? 'bg-choco text-cream border-choco'
                  : 'border-choco/20 text-choco hover:border-gold'
              }`}
            >
              {STEP4_COPY.filterAll}
            </button>
            {OCCASION_FILTERS.map(o => (
              <button
                key={o}
                onClick={() => setFilter(o)}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border transition-all ${
                  filter === o
                    ? 'bg-choco text-cream border-choco'
                    : 'border-choco/20 text-choco hover:border-gold'
                }`}
              >
                {PACKAGING_OCCASION_LABELS[o]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {options.map(option => {
              const active = design.packaging?.type === option.type;
              return (
                <button
                  key={option.type}
                  onClick={() =>
                    dispatch({
                      type: 'SET_PACKAGING',
                      packaging: { type: option.type, count: option.count },
                    })
                  }
                  className={`relative text-left p-5 border transition-all ${
                    active ? 'border-choco bg-choco text-cream' : 'border-choco/15 hover:border-gold bg-cream'
                  }`}
                >
                  <div className={`mb-4 ${active ? 'text-cream/80' : 'text-choco/50'}`}>
                    {option.grid ? (
                      <GridGlyph rows={option.grid.rows} cols={option.grid.cols} />
                    ) : (
                      <span className="block h-4 w-4 rounded-full bg-current" />
                    )}
                  </div>

                  <h3 className="font-black uppercase tracking-tight text-sm">{option.name}</h3>
                  <p className={`text-xs mt-1 ${active ? 'text-cream/70' : 'text-clay'}`}>
                    {option.centerBar
                      ? STEP4_COPY.centerBarPiecesLabel(option.count)
                      : STEP4_COPY.piecesLabel(option.count)}
                  </p>

                  {option.centerBar && (
                    <p
                      className={`text-[11px] mt-3 italic font-serif ${
                        active ? 'text-cream/60' : 'text-clay/70'
                      }`}
                    >
                      {STEP4_COPY.centerBarNote}
                    </p>
                  )}

                  <span
                    className={`inline-block mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${
                      active ? 'text-gold' : 'text-choco/40'
                    }`}
                  >
                    {active ? STEP4_COPY.selectedCta : STEP4_COPY.selectCta}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
