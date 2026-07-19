/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductPage from './components/ProductPage';
import CustomMoldSection from './components/CustomMoldSection';
import CorporateSection from './components/CorporateSection';
import ProductMarquee from './components/ProductMarquee';
import Testimonials from './components/Testimonials';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import { CartItem, Product } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts, deriveFacets } from './lib/products';
import { WHATSAPP_NUMBER } from './constants';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import OccasionPage, { occasionSlug } from './pages/OccasionPage';
import { Link } from 'react-router-dom';

export default function App() {
  const { products: allProducts, loading } = useProducts();
  // Hidden storewide: leather homeware (spinning off to its own brand),
  // the nut-butter pantry line, and discontinued keto/cooking SKUs.
  const DISCONTINUED_SKUS = new Set(['MilkBlock250g', 'BAR50DAIRYFREE', 'KETOP50', 'DatesSugar250g', 'PANDA 16 INDP', '6BARBUNDLE-MIX', '1+8SWL']);
  const products = allProducts.filter(p =>
    p.category !== 'Homeware' &&
    !p.productType.includes('Dietary Butter') &&
    !DISCONTINUED_SKUS.has(p.sku)
  );
  const { formats, events } = deriveFacets(products);
  const FORMAT_TABS_LOCAL = ['All', ...formats];

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const CATEGORY_ORDER: Record<string, number> = { 'Ready to Ship': 0, 'Custom': 1, 'Homeware': 2 };
  const filteredProducts = products
    .filter(p => {
      if (selectedFormat !== 'All' && p.format !== selectedFormat) return false;
      if (selectedEvents.size > 0 && !p.events.some(e => selectedEvents.has(e))) return false;
      return true;
    })
    .sort((a, b) => {
      const ca = CATEGORY_ORDER[a.category] ?? 99;
      const cb = CATEGORY_ORDER[b.category] ?? 99;
      if (ca !== cb) return ca - cb;
      return a.name.localeCompare(b.name);
    });

  const toggleEvent = (ev: string) => {
    setSelectedEvents(prev => {
      const next = new Set(prev);
      if (next.has(ev)) next.delete(ev); else next.add(ev);
      return next;
    });
  };
  const clearEvents = () => setSelectedEvents(new Set());

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

      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/product/:sku" element={<ProductPage products={products} onAddToCart={addToCart} />} />
        <Route path="/occasion/:slug" element={<OccasionPage products={products} onAddToCart={addToCart} />} />
        <Route path="/" element={
      <main>
        <div id="home">
          <Hero />
        </div>

        <ProductMarquee />

        {/* Our Story Section */}
        <section id="our-story" className="py-24 bg-stone-50 overflow-hidden border-b border-choco/10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <span className="text-gold text-xs uppercase tracking-[0.3em] font-bold block">Our Legacy</span>
                <h2 className="text-[40px] md:text-[60px] font-black uppercase text-choco leading-[0.9] tracking-tighter">
                  Crafting the <span className="text-gold italic font-serif lowercase font-normal">extraordinary.</span>
                </h2>
                <p className="text-clay text-lg leading-relaxed font-medium">
                  Founded in 2020, Crafty Chocolates was born from a desire to merge the precision of modern engineering with the soul of artisanal confectionery. We believe that chocolate is not just a treat, but a medium for expression.
                </p>
                <div className="flex gap-12">
                  <div>
                    <h5 className="text-choco font-black text-2xl tracking-tighter">2020</h5>
                    <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Inception</p>
                  </div>
                  <div>
                    <h5 className="text-choco font-black text-2xl tracking-tighter">500+</h5>
                    <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Custom Designs</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative aspect-video bg-choco overflow-hidden rounded-sm shadow-2xl">
                  <img
                    src="/products/choc.jpg"
                    alt="Our handcrafted chocolate"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Selection */}
        <section id="collections" className="py-24 bg-cream">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-xl">
                <span className="text-gold text-xs uppercase tracking-[0.3em] font-bold mb-4 block">Curated Selection</span>
                <h2 className="text-[40px] md:text-[60px] font-black uppercase text-choco leading-[0.9] tracking-tighter">
                  A Palette for Every <span className="text-gold italic font-serif lowercase font-normal">preference.</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-8 font-sans text-[10px] uppercase tracking-[0.2em] font-bold">
                {FORMAT_TABS_LOCAL.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedFormat(tab)}
                    className={`pb-2 border-b-2 transition-all cursor-pointer ${selectedFormat === tab ? 'border-choco text-choco' : 'border-transparent text-clay hover:text-gold'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Event / occasion chips */}
            <div className="mb-12 flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold mr-2">Occasion:</span>
              {events.map(ev => {
                const active = selectedEvents.has(ev);
                return (
                  <button
                    key={ev}
                    onClick={() => toggleEvent(ev)}
                    className={`px-3 py-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                      active
                        ? 'bg-choco text-cream border-choco'
                        : 'bg-transparent text-choco border-choco/20 hover:border-gold hover:text-gold'
                    }`}
                  >
                    {ev}
                  </button>
                );
              })}
              {selectedEvents.size > 0 && (
                <button
                  onClick={clearEvents}
                  className="px-3 py-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider text-clay hover:text-gold underline underline-offset-4 decoration-clay/30"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.2em] font-bold">
              <span className="text-gold">Popular:</span>
              {events.filter(e => ['Birthday', 'Anniversary', 'Eid', 'Wedding & Engagement', 'Baby Announcement'].includes(e)).map(e => (
                <Link key={e} to={`/occasion/${occasionSlug(e)}`} className="text-choco hover:text-gold underline underline-offset-4 decoration-choco/20">
                  {e}
                </Link>
              ))}
            </div>

            <div className="mb-8 text-[11px] uppercase tracking-[0.2em] text-clay font-bold">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
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

        <CorporateSection />

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
              <form
                className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  const email = new FormData(e.currentTarget).get('email');
                  const msg = `Hello Crafty Chocolates, please add me to the Inner Circle for tasting events and seasonal collections. Email: ${email}`;
                  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
              >
                <input
                  type="email"
                  name="email"
                  required
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
        } />
      </Routes>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />

      <WhatsAppFloat />
    </div>
  );
}
