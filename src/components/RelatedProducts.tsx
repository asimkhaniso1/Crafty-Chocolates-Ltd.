import { useMemo } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';

interface RelatedProductsProps {
  /** The product being viewed — excluded from its own recommendations. */
  current: Product;
  products: Product[];
  onAddToCart: (product: Product) => void;
  title?: string;
  /** How many to show; the grid is built for 4. */
  limit?: number;
}

/**
 * Scores how closely another product relates to the one being viewed.
 * Shared occasions matter most (someone shopping Eid wants Eid), then the
 * same category/format, then a comparable price bracket — a shopper looking
 * at a Rs. 15,000 hamper isn't served by a Rs. 300 bar.
 */
function relevance(current: Product, other: Product): number {
  let score = 0;

  const sharedEvents = other.events.filter(e => current.events.includes(e)).length;
  score += sharedEvents * 5;

  const sharedTags = other.tags.filter(t => current.tags.includes(t)).length;
  score += sharedTags * 3;

  if (other.category === current.category) score += 2;
  if (other.format && other.format === current.format) score += 2;

  const sharedTypes = other.productType.filter(t => current.productType.includes(t)).length;
  score += sharedTypes * 2;

  // Price proximity: full marks within 40% of the viewed price, tapering off.
  if (current.price > 0 && other.price > 0) {
    const ratio = Math.min(current.price, other.price) / Math.max(current.price, other.price);
    score += ratio >= 0.6 ? 3 : ratio >= 0.35 ? 1 : 0;
  }

  return score;
}

export default function RelatedProducts({
  current,
  products,
  onAddToCart,
  title = 'You may also like',
  limit = 4,
}: RelatedProductsProps) {
  const related = useMemo(() => {
    const pool = products.filter(p => p.id !== current.id);
    const scored = pool
      .map(p => ({ product: p, score: relevance(current, p) }))
      // Stable tiebreak by name so the row doesn't reshuffle between renders.
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
    return scored.slice(0, limit).map(s => s.product);
  }, [current, products, limit]);

  if (related.length === 0) return null;

  return (
    <section className="mt-24 pt-16 border-t border-choco/10">
      <h2 className="text-center text-2xl md:text-3xl font-black uppercase text-choco tracking-tighter mb-3">
        {title}
      </h2>
      <p className="text-center text-clay font-serif italic mb-12">
        Chosen to sit alongside {current.name}.
      </p>

      {/* Swipeable row on small screens, settled grid from md up. */}
      <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
        {related.map(p => (
          <div key={p.id} className="min-w-[75%] sm:min-w-[45%] snap-start md:min-w-0">
            <ProductCard product={p} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </section>
  );
}
