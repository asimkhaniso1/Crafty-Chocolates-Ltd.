import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem, Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-choco/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-cream z-[70] shadow-2xl flex flex-col border-l border-choco/10"
          >
            <div className="p-8 border-b border-choco/5 flex justify-between items-center bg-white">
              <h2 className="text-xl font-black uppercase tracking-tighter text-choco flex items-center gap-3">
                <ShoppingBag size={20} className="text-gold" /> Your Archive
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-choco">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-clay space-y-6">
                  <div className="w-16 h-16 border border-choco/10 rounded-full flex items-center justify-center">
                    <ShoppingBag size={24} strokeWidth={1} />
                  </div>
                  <p className="font-serif italic text-lg text-center">Your collection is empty. <br/>A blank canvas awaits.</p>
                  <button 
                    onClick={onClose}
                    className="text-gold font-black uppercase tracking-[0.2em] text-[10px] border-b border-gold pb-1 hover:text-choco hover:border-choco transition-all"
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex gap-6 group">
                    <div className="w-24 h-24 bg-white flex-shrink-0 border border-choco/5 overflow-hidden">
                      <img 
                        src={`https://picsum.photos/seed/${item.product.id}/200`} 
                        alt={item.product.name}
                        className="w-full h-full object-cover grayscale-[0.3] transition-all group-hover:grayscale-0"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold uppercase tracking-tight text-choco leading-none">{item.product.name}</h4>
                          <span className="text-choco font-bold text-sm">${item.product.price.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-gold uppercase tracking-widest font-black mt-2">{item.product.category}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center border border-choco/10 bg-white">
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="px-2 py-1 hover:bg-stone-50 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-xs font-bold text-choco">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="px-2 py-1 hover:bg-stone-50 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemove(item.product.id)}
                          className="text-choco/20 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 bg-white border-t border-choco/10">
                <div className="flex justify-between mb-6">
                  <span className="text-clay uppercase tracking-[0.2em] text-[10px] font-black">Archive Subtotal</span>
                  <span className="text-2xl font-black tracking-tighter text-choco">${subtotal.toFixed(2)}</span>
                </div>
                <button className="w-full bg-choco text-white py-5 font-black uppercase tracking-widest text-xs hover:bg-gold transition-all shadow-xl shadow-choco/10">
                  Begin Checkout
                </button>
                <div className="mt-6 flex justify-center">
                   <img 
                     src="https://storage.googleapis.com/static.6sd3zosursi3hp5e554img.asia-southeast1.run.app/logo_c8f85be0.png" 
                     className="h-12 object-contain opacity-80" 
                     alt="Brand Logo"
                   />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
