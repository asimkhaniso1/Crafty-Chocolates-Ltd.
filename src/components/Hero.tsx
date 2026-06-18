import { motion } from 'motion/react';
import { Phone, MessageCircle } from 'lucide-react';
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '../constants';

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 flex flex-col overflow-hidden bg-cream">
      <div className="flex-1 flex">
        {/* Left Vertical Text Branding */}
        <div className="hidden md:flex w-24 border-r border-choco/10 items-center justify-center">
          <span className="rotate-[-90deg] whitespace-nowrap uppercase tracking-[0.4em] text-[10px] font-sans font-bold text-gold">
            Est. 2020 &nbsp;•&nbsp; Artisanal Fabrication
          </span>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 relative">
          {/* Hero Text Area */}
          <div className="col-span-1 md:col-span-7 p-8 md:p-16 flex flex-col justify-center">
            <motion.h1
              className="text-[60px] md:text-[80px] lg:text-[110px] leading-[0.85] font-black uppercase mb-10 tracking-tighter text-choco"
            >
              {"Your Idea,".split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  className="inline-block"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
              <br />
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-gold italic block mt-2"
              >
                In Cocoa.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="max-w-md text-lg leading-relaxed mb-12 text-clay font-medium"
            >
              We don't just melt chocolate; we engineer it. From logo-engraved pralines to architectural sculptures, our in-house 3D mold studio brings your vision to life in single-origin dark chocolate.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="flex flex-wrap gap-6"
            >
              <a
                href="#custom-molds"
                className="bg-choco text-white px-10 py-5 uppercase font-sans text-xs tracking-widest font-bold hover:bg-gold transition-all shadow-xl shadow-choco/10"
              >
                Start Custom Order
              </a>
              <a
                href="#collections"
                className="border border-choco text-choco px-10 py-5 uppercase font-sans text-xs tracking-widest font-bold hover:bg-choco hover:text-cream transition-all"
              >
                View Gallery
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="mt-10 pt-8 border-t border-choco/10 max-w-md"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gold mb-4">
                Place your order
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="flex items-center gap-3 text-choco hover:text-gold transition-colors group"
                >
                  <span className="w-9 h-9 rounded-full border border-choco/20 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/10 transition-all">
                    <Phone size={14} strokeWidth={2.5} />
                  </span>
                  <span className="font-black tracking-tight text-base md:text-lg">{PHONE_DISPLAY}</span>
                </a>
                <span className="text-clay/40 text-xs">or</span>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-choco hover:text-[#25D366] transition-colors group"
                >
                  <span className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                    <MessageCircle size={14} strokeWidth={2.5} />
                  </span>
                  <span className="font-black uppercase tracking-widest text-xs">Chat on WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Feature Display Area */}
          <div className="col-span-1 md:col-span-5 bg-choco p-8 md:p-12 flex flex-col justify-between relative min-h-[500px]">
            {/* Decorative Element */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 2 }}
              className="absolute -left-12 top-1/2 -translate-y-1/2 w-24 h-24 bg-gold rounded-full flex items-center justify-center text-white text-3xl font-bold italic shadow-2xl z-20"
            >
              C
            </motion.div>

            <div className="border-l border-white/20 pl-8 mt-12 md:mt-0">
              <h3 className="text-white/40 font-sans text-[10px] uppercase tracking-[0.3em] mb-6">The Mold Process</h3>
              <p className="text-white text-2xl lg:text-3xl leading-snug italic font-serif">
                "The fidelity of their custom silicone molds allowed us to reproduce our company logo with microscopic precision."
              </p>
              <p className="text-gold mt-6 font-sans text-xs uppercase tracking-widest font-bold">— ArchiStruct Global</p>
            </div>

            {/* Logo / Brand Mark */}
            <div className="mt-12 flex justify-center relative z-10">
              <img
                src="/logo.png"
                alt="Crafty Chocolates Logo"
                className="w-32 md:w-48 object-contain drop-shadow-2xl"
              />
            </div>

            {/* Background Texture/Image */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-20 transition-opacity hover:opacity-30">
              <img
                src="https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&q=80&w=1200"
                alt="Chocolate texture"
                className="w-full h-full object-cover mix-blend-overlay"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
