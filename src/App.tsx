/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import CustomMoldSection from './components/CustomMoldSection';
import Testimonials from './components/Testimonials';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import { PRODUCTS } from './constants';
import { CartItem, Product } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Classic' | 'Bespoke' | 'Seasonal'>('All');

  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => 
      prev.map((item) => 
        item.product.id === productId 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-amber-200 selection:text-amber-900">
      <Header cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />
      
      <main>
        <Hero />
        
        {/* Featured Products Selection */}
        <section id="shop" className="py-24 bg-cream">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-xl">
                <span className="text-gold text-xs uppercase tracking-[0.3em] font-bold mb-4 block">Curated Selection</span>
                <h2 className="text-[40px] md:text-[60px] font-black uppercase text-choco leading-[0.9] tracking-tighter">
                  A Palette for Every <span className="text-gold italic font-serif lowercase font-normal">preference.</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-8 font-sans text-[10px] uppercase tracking-[0.2em] font-bold">
                {['All', 'Classic', 'Bespoke', 'Seasonal'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setSelectedCategory(tab as any)}
                    className={`pb-2 border-b-2 transition-all cursor-pointer ${
                      selectedCategory === tab ? 'border-choco text-choco' : 'border-transparent text-clay hover:text-gold'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <motion.div 
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ProductCard 
                      product={product} 
                      onAddToCart={addToCart} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        <CustomMoldSection />

        <Testimonials />

        {/* Newsletter / CTA Section */}
        <section className="py-28 bg-choco text-cream overflow-hidden relative">
          <div className="container mx-auto px-6 relative z-10 text-center max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-[50px] md:text-[80px] font-black uppercase mb-10 leading-[0.85] tracking-tighter">
                The Inner <br />
                <span className="text-gold italic font-serif lowercase font-normal">circle.</span>
              </h2>
              <p className="text-cream/50 mb-12 text-lg font-medium leading-relaxed italic">
                Receive invitations to private tasting events and early access to our seasonal bespoke collections.
              </p>
              <form className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="DIGITAL ADDRESS" 
                  className="flex-1 bg-white/5 border border-white/10 px-8 py-5 text-cream placeholder:text-cream/20 focus:outline-none focus:bg-white/10 transition-all font-sans text-xs tracking-widest"
                />
                <button className="bg-gold text-white px-10 py-5 uppercase font-sans text-xs tracking-widest font-black hover:bg-white hover:text-choco transition-all">
                  Join
                </button>
              </form>
            </motion.div>
          </div>
          
          {/* Decorative background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-white/5 rounded-full rotate-45" />
        </section>
      </main>

      <Footer />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}
