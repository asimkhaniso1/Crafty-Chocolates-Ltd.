import { Link } from 'react-router-dom';

// Running gallery of signature products; scrolls continuously, pauses on hover.
// Popular items first (owner's sales data), then the rest.
const ITEMS: { src: string; sku: string; label: string }[] = [
  { src: '/products/ai_bar50dark.png', sku: 'BAR50DARK', label: 'Orange Bar 50g' },
  { src: '/products/ai_birthday_box.png', sku: 'BDAY|5PBox', label: 'Birthday Box' },
  { src: '/products/ai_golden_4plus1.png', sku: '1+4SWL', label: 'Custom 4+1 Golden Box' },
  { src: '/products/ai_wedding_gold.png', sku: 'WED-5G', label: 'Wedding Gold Box' },
  { src: '/products/ai_logobites_separator.png', sku: '3PC-LB-MW', label: 'Logo Bites' },
  { src: '/products/ai_metal_9plus1.png', sku: '1+9Bday', label: '9+1 Metal Box' },
  { src: '/products/ai_16plus1.png', sku: '16+1 Birthday Box', label: '16+1 Box' },
  { src: '/products/ai_12pcs.png', sku: '12PCS-CGold', label: '12 Pieces Box' },
  { src: '/products/ai_dates_box.png', sku: 'RAMZ-6D', label: 'Chocolate Dates' },
  { src: '/products/ai_bdaybite_square.png', sku: 'BDAYBITE|5W', label: 'Birthday Bites' },
];

export default function ProductMarquee() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <section className="bg-choco py-10 overflow-hidden border-y border-gold/20" aria-label="Signature products">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <Link
            key={`${item.sku}-${i}`}
            to={`/product/${encodeURIComponent(item.sku)}`}
            className="group mx-4 shrink-0 w-44 md:w-52"
            aria-hidden={i >= ITEMS.length}
            tabIndex={i >= ITEMS.length ? -1 : 0}
          >
            <div className="aspect-square overflow-hidden bg-cream/5 border border-white/10">
              <img
                src={item.src}
                alt={item.label}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-cream/60 group-hover:text-gold transition-colors">
              {item.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
