import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { STEP_TITLES, STEP_SUBTITLES, PACKAGING_OCCASION_LABELS, STEP5_COPY } from '../copy';
import { PACKAGING_OPTIONS } from '../data/packagingOptions';
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

export default function Step5Packaging() {
  const { design, dispatch } = useStudio();
  const [filter, setFilter] = useState<OccasionFilter>('all');

  const options = useMemo(() => {
    if (filter === 'all') return PACKAGING_OPTIONS;
    return PACKAGING_OPTIONS.filter(o => o.occasions.includes(filter));
  }, [filter]);

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[5]}
      </h2>
      <p className="text-clay font-medium mb-8 max-w-lg">{STEP_SUBTITLES[5]}</p>

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
          {STEP5_COPY.filterAll}
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
          const isIndividual = option.type === 'individual';
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
              {option.premium && (
                <span
                  className={`absolute top-3 right-3 flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] font-bold px-2 py-1 rounded-full ${
                    active ? 'bg-gold text-choco' : 'bg-gold/15 text-gold'
                  }`}
                >
                  <Sparkles size={10} /> {STEP5_COPY.premiumBadge}
                </span>
              )}

              <div
                className={`mb-4 ${active ? 'text-cream/80' : 'text-choco/50'}`}
              >
                {option.grid ? (
                  <GridGlyph rows={option.grid.rows} cols={option.grid.cols} />
                ) : (
                  <span className="block h-4 w-4 rounded-full bg-current" />
                )}
              </div>

              <h3 className="font-black uppercase tracking-tight text-sm">{option.name}</h3>
              <p className={`text-xs mt-1 ${active ? 'text-cream/70' : 'text-clay'}`}>
                {STEP5_COPY.piecesLabel(option.count)}
              </p>

              {isIndividual && (
                <p className={`text-[11px] mt-3 italic font-serif ${active ? 'text-cream/60' : 'text-clay/70'}`}>
                  {STEP5_COPY.individualNote}
                </p>
              )}

              <span
                className={`inline-block mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${
                  active ? 'text-gold' : 'text-choco/40'
                }`}
              >
                {active ? STEP5_COPY.selectedCta : STEP5_COPY.selectCta}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
