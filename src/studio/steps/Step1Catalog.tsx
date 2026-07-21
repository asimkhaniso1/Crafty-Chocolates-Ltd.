import { useMemo, useState } from 'react';
import { STEP_TITLES, STEP_SUBTITLES, PACKAGING_OCCASION_LABELS, CATALOG_COPY } from '../copy';
import { CATALOG_ITEMS, type CatalogItem, type CatalogSection } from '../data/catalog';
import { getPackagingOption } from '../data/packagingOptions';
import { useStudio } from '../state/StudioContext';

const OCCASION_FILTERS = ['wedding', 'eid', 'corporate', 'birthday'] as const;
type OccasionFilter = (typeof OCCASION_FILTERS)[number] | 'all';

const SECTION_ORDER: CatalogSection[] = ['signature', 'classic', 'loose'];
const SECTION_TITLES: Record<CatalogSection, string> = {
  signature: CATALOG_COPY.sectionSignature,
  classic: CATALOG_COPY.sectionClassic,
  loose: CATALOG_COPY.sectionLoose,
};

/** Small dot-grid glyph standing in for a packaging option's arrangement, used when there's no product photo. */
function GridGlyph({ rows, cols }: { rows: number; cols: number }) {
  const total = rows * cols;
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="block aspect-square w-2 rounded-full bg-current" />
      ))}
    </div>
  );
}

function CatalogCard({
  item,
  active,
  onSelect,
}: {
  key?: string;
  item: CatalogItem;
  active: boolean;
  onSelect: () => void;
}) {
  const option = item.packagingType ? getPackagingOption(item.packagingType) : undefined;

  return (
    <button
      onClick={onSelect}
      className={`relative text-left border transition-all overflow-hidden ${
        active ? 'border-choco bg-choco text-cream' : 'border-choco/15 hover:border-gold bg-cream'
      }`}
    >
      {item.photo ? (
        <div className="aspect-[4/3] w-full overflow-hidden bg-choco/5">
          <img src={item.photo} alt={item.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className={`aspect-[4/3] w-full flex items-center justify-center ${active ? 'text-cream/60' : 'text-choco/30'}`}>
          {option?.grid ? <GridGlyph rows={option.grid.rows} cols={option.grid.cols} /> : <span className="block h-6 w-6 rounded-full bg-current" />}
        </div>
      )}

      <div className="p-5">
        <h3 className="font-black uppercase tracking-tight text-sm">{item.name}</h3>
        <p className={`text-xs mt-1 ${active ? 'text-cream/70' : 'text-clay'}`}>{item.contentsLine}</p>

        {item.occasions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.occasions.map(o => (
              <span
                key={o}
                className={`text-[9px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 rounded-full border ${
                  active ? 'border-cream/30 text-cream/70' : 'border-choco/20 text-clay'
                }`}
              >
                {PACKAGING_OCCASION_LABELS[o] ?? o}
              </span>
            ))}
          </div>
        )}

        <span
          className={`inline-block mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${
            active ? 'text-gold' : 'text-choco/40'
          }`}
        >
          {active ? CATALOG_COPY.chosenCta : CATALOG_COPY.chooseCta}
        </span>
      </div>
    </button>
  );
}

export default function Step1Catalog() {
  const { design, dispatch } = useStudio();
  const [filter, setFilter] = useState<OccasionFilter>('all');

  const items = useMemo(() => {
    if (filter === 'all') return CATALOG_ITEMS;
    return CATALOG_ITEMS.filter(i => i.occasions.includes(filter) || i.product === 'custom');
  }, [filter]);

  const sections = useMemo(
    () =>
      SECTION_ORDER.map(section => ({
        section,
        items: items.filter(i => i.section === section),
      })).filter(s => s.items.length > 0),
    [items]
  );

  function selectItem(item: CatalogItem) {
    if (item.product === 'custom') {
      dispatch({ type: 'SELECT_CATALOG_ITEM', product: 'custom', packaging: null });
      return;
    }
    const option = item.packagingType ? getPackagingOption(item.packagingType) : undefined;
    dispatch({
      type: 'SELECT_CATALOG_ITEM',
      product: item.product,
      packaging: item.packagingType ? { type: item.packagingType, count: option?.count ?? 1 } : null,
    });
  }

  function isActive(item: CatalogItem): boolean {
    if (item.product === 'custom') return design.product === 'custom';
    return design.product === item.product && design.packaging?.type === item.packagingType;
  }

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[1]}
      </h2>
      <p className="text-clay font-medium mb-8 max-w-lg">{STEP_SUBTITLES[1]}</p>

      {/* Occasion filter chips */}
      <div className="flex flex-wrap gap-2 mb-10 font-sans">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border transition-all ${
            filter === 'all' ? 'bg-choco text-cream border-choco' : 'border-choco/20 text-choco hover:border-gold'
          }`}
        >
          {CATALOG_COPY.filterAll}
        </button>
        {OCCASION_FILTERS.map(o => (
          <button
            key={o}
            onClick={() => setFilter(o)}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border transition-all ${
              filter === o ? 'bg-choco text-cream border-choco' : 'border-choco/20 text-choco hover:border-gold'
            }`}
          >
            {PACKAGING_OCCASION_LABELS[o]}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {sections.map(({ section, items: sectionItems }) => (
          <section key={section}>
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-gold mb-4">
              {SECTION_TITLES[section]}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {sectionItems.map(item => (
                <CatalogCard key={item.key} item={item} active={isActive(item)} onSelect={() => selectItem(item)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
