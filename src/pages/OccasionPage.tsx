import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { deriveFacets } from '../lib/products';

interface OccasionPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function occasionSlug(event: string): string {
  return event.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// SEO copy per occasion; falls back to a generic line for any other event.
const OCCASION_COPY: Record<string, { title: string; blurb: string }> = {
  'birthday': {
    title: 'Birthday Chocolates & Gift Boxes',
    blurb: 'Handcrafted birthday chocolate boxes and bars with personalized wrappers — made fresh in Karachi, delivered across Pakistan.',
  },
  'anniversary': {
    title: 'Anniversary Chocolate Gifts',
    blurb: 'Celebrate another year with handcrafted chocolates and custom messages on every wrapper.',
  },
  'eid': {
    title: 'Eid Chocolate Gift Boxes',
    blurb: 'Eid Mubarak boxes in Urdu and English, chocolate-coated dates, and golden gift boxes for family and corporate giving.',
  },
  'wedding-engagement': {
    title: 'Wedding, Engagement & Nikah Chocolate Favors',
    blurb: 'Shadi Mubarak and Baat Pakki favor boxes with the couple’s names and date on every wrapper — Urdu or English calligraphy.',
  },
  'baby-announcement': {
    title: 'Baby Announcement Chocolates',
    blurb: 'Welcome your little one with personalized chocolate boxes — the baby’s name on every wrapper, in blue, pink, or gold.',
  },
};

export default function OccasionPage({ products, onAddToCart }: OccasionPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const { events } = deriveFacets(products);
  const event = events.find(e => occasionSlug(e) === slug);
  const matched = event ? products.filter(p => p.events.includes(event)) : [];
  const copy = (slug && OCCASION_COPY[slug]) || {
    title: event ? `${event} Chocolates` : 'Occasion',
    blurb: 'Handcrafted chocolates for every occasion — made in Karachi, delivered across Pakistan.',
  };

  useEffect(() => {
    if (event) {
      document.title = `${copy.title} | Crafty Chocolates`;
    }
    return () => { document.title = 'Crafty Chocolates — Custom Logo & Gift Chocolates, Handcrafted in Karachi, Pakistan'; };
  }, [event, copy.title]);

  return (
    <main className="pt-40 pb-24 bg-cream min-h-screen">
      <div className="container mx-auto px-6 md:px-12">
        <Link to="/" className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold hover:text-choco transition-colors">
          &larr; All collections
        </Link>
        <h1 className="text-[40px] md:text-[60px] font-black uppercase text-choco leading-[0.9] tracking-tighter mt-6 mb-4">
          {copy.title}
        </h1>
        <p className="text-clay text-lg leading-relaxed font-medium max-w-2xl mb-16">{copy.blurb}</p>

        {event ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24"
          >
            {matched.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </motion.div>
        ) : (
          <p className="text-clay font-medium">
            We couldn&rsquo;t find that occasion. <Link to="/" className="text-gold underline underline-offset-4">Browse all chocolates</Link>.
          </p>
        )}
      </div>
    </main>
  );
}
