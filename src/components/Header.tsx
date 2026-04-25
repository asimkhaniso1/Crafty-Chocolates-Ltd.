import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export default function Header({ cartCount, onOpenCart }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-cream/95 backdrop-blur-md py-4 border-choco/10 shadow-sm' 
          : 'bg-transparent py-8 border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4">
            <img 
              src="https://storage.googleapis.com/static.6sd3zosursi3hp5e554img.asia-southeast1.run.app/logo_c8f85be0.png" 
              alt="Crafty Chocolates Logo" 
              className="h-14 w-14 object-contain"
            />
            <div className="flex flex-col leading-none">
              <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-choco">
                Crafty<br/>Chocolates
              </span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-10">
            {['Collections', 'Custom Molds', 'Our Story', 'Shop'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-choco hover:text-gold transition-colors underline-offset-8 hover:underline decoration-gold"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end mr-4">
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.3em] text-gold">Est. 2020</span>
          </div>

          <button className="text-choco hover:text-gold transition-colors">
            <User size={18} strokeWidth={2.5} />
          </button>
          
          <button 
            onClick={onOpenCart}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 border border-choco rounded-full flex items-center justify-center font-sans text-xs transition-all group-hover:bg-choco group-hover:text-cream">
              {cartCount}
            </div>
            <ShoppingBag size={18} className="text-choco" strokeWidth={2.5} />
          </button>

          <button 
            className="md:hidden p-2 text-choco"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-cream border-t border-choco/10 overflow-hidden md:hidden"
          >
            <nav className="flex flex-col p-8 gap-6 text-center">
              {['Collections', 'Custom Molds', 'Our Story', 'Shop'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-serif text-2xl text-choco hover:text-gold italic"
                >
                  {item}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
