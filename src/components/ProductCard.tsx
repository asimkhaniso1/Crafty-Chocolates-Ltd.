import { MouseEvent } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Share2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  key?: string;
}

const IMAGE_PLACEHOLDERS: Record<string, string> = {
  'product_truffles': 'https://images.unsplash.com/photo-1549007994-cb92cfd7d4d8?auto=format&fit=crop&q=80&w=800',
  'product_dark_bar': 'https://images.unsplash.com/photo-1623334234217-37c88e5066a9?auto=format&fit=crop&q=80&w=800',
  'custom_mold_process': 'https://images.unsplash.com/photo-1623334234204-62921a8cd354?auto=format&fit=crop&q=80&w=800',
  'seasonal_pumpkin': 'https://images.unsplash.com/photo-1579954115545-a95591f28be0?auto=format&fit=crop&q=80&w=800'
};

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleShare = async (e: MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `Crafty Chocolates - ${product.name}`,
      text: product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Simple fallback alert for browser consistency
        alert(`Link to ${product.name} copied to clipboard!`);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="group"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-white mb-6 border border-choco/5 group-hover:border-gold/30 transition-colors duration-500">
        <motion.img
          layoutId={`img-${product.id}`}
          src={IMAGE_PLACEHOLDERS[product.image] || `https://picsum.photos/seed/${product.id}/800/1000`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
          referrerPolicy="no-referrer"
        />
        
        {/* Subtle Overlay Tint */}
        <div className="absolute inset-0 bg-choco/0 group-hover:bg-choco/10 transition-colors duration-700 pointer-events-none" />

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-choco rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 active:scale-95 z-20 shadow-sm border border-choco/5"
          title="Share product"
        >
          <Share2 size={16} strokeWidth={2.5} />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-choco/80 via-choco/40 to-transparent">
          <button
            onClick={() => onAddToCart(product)}
            className="w-full bg-white text-choco py-3 flex items-center justify-center gap-2 text-[10px] font-sans font-black uppercase tracking-[0.2em] hover:bg-gold hover:text-white transition-all transform active:scale-95"
          >
            <ShoppingCart size={14} /> Add to Bag
          </button>
        </div>
      </div>
      
      <div className="space-y-2 transform transition-transform duration-500 group-hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-sans font-bold text-gold tracking-widest block mb-1 group-hover:tracking-[0.3em] transition-all duration-500">
              {product.category}
            </span>
            <h3 className="text-xl font-bold uppercase tracking-tight text-choco leading-none group-hover:text-gold transition-colors">
              {product.name}
            </h3>
          </div>
          <span className="text-lg font-bold text-choco">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-clay text-sm leading-relaxed line-clamp-2 italic font-serif opacity-80 group-hover:opacity-100 transition-opacity">
          {product.description}
        </p>
      </div>
    </motion.div>
  );
}
