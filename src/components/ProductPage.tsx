import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { formatPrice } from '../constants';
import { Product } from '../types';

interface ProductPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductPage({ products, onAddToCart }: ProductPageProps) {
  const { sku } = useParams<{ sku: string }>();
  const navigate = useNavigate();
  const product = useMemo(
    () => products.find(p => encodeURIComponent(p.sku) === sku || p.sku === sku || p.id === sku),
    [sku, products]
  );
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-choco gap-6 px-6 text-center">
        <p className="font-serif italic text-xl">We couldn't find that piece.</p>
        <Link to="/" className="text-gold underline-offset-4 underline text-xs font-black uppercase tracking-[0.2em]">
          Return to collection
        </Link>
      </div>
    );
  }

  const images = [product.image, ...product.gallery.filter(g => g !== product.image)];
  const heroImage = activeImage ?? images[0];

  const specs: [string, string | number][] = [];
  if (product.chocolateType.length) specs.push(['Chocolate', product.chocolateType.join(', ')]);
  if (product.flavour.length) specs.push(['Flavour', product.flavour.join(', ')]);
  if (product.fillings.length) specs.push(['Fillings', product.fillings.join(', ')]);
  if (product.pieceCount) specs.push(['Piece count', String(product.pieceCount)]);
  if (product.packageWeight) specs.push(['Package weight', product.packageWeight]);
  if (product.productType.length) specs.push(['Type', product.productType.join(', ')]);

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12">
        <button
          onClick={() => (window.history.length > 2 ? navigate(-1) : navigate('/'))}
          className="mb-12 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-clay hover:text-gold transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Gallery */}
          <div>
            <motion.div
              key={heroImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="aspect-square bg-white border border-choco/5 overflow-hidden"
            >
              <img
                src={heroImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {images.map((src) => (
                  <button
                    key={src}
                    onClick={() => setActiveImage(src)}
                    className={`w-20 h-20 border overflow-hidden transition-all ${
                      heroImage === src
                        ? 'border-gold ring-2 ring-gold/30'
                        : 'border-choco/10 hover:border-choco/40'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <span className="text-[10px] uppercase font-sans font-bold text-gold tracking-[0.3em] block mb-3">
                {product.category} {product.format ? `· ${product.format}` : ''}
              </span>
              <h1 className="text-4xl md:text-5xl font-black uppercase text-choco leading-[0.9] tracking-tighter">
                {product.name}
              </h1>
              <p className="text-clay text-xs uppercase tracking-[0.2em] font-bold mt-3">SKU · {product.sku}</p>
            </div>

            <div className="text-3xl font-black text-choco tracking-tight">
              {formatPrice(product.price, product.currency)}
            </div>

            {product.description && (
              <p className="text-clay leading-relaxed font-serif italic text-base">
                {product.description}
              </p>
            )}

            {product.events.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.events.map(e => (
                  <span key={e} className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold border border-choco/20 text-choco bg-white">
                    {e}
                  </span>
                ))}
              </div>
            )}

            {specs.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-choco/10 pt-8">
                {specs.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-1">{k}</dt>
                    <dd className="text-choco text-sm font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {product.certifications.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-4">
                {product.certifications.map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold bg-gold/10 text-gold border border-gold/30">
                    <Check size={12} strokeWidth={3} /> {c}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => onAddToCart(product)}
              className="w-full md:w-auto bg-choco text-white px-12 py-5 font-black uppercase tracking-widest text-xs hover:bg-gold transition-all flex items-center justify-center gap-3 shadow-lg shadow-choco/10"
            >
              <ShoppingCart size={16} /> Add to Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
