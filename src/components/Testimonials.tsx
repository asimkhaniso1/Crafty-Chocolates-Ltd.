import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: "The fidelity of their custom silicone molds allowed us to reproduce our company logo with microscopic precision. A true engineering marvel in chocolate.",
    author: "Elena Vance",
    role: "Creative Director, ArchiStruct Global"
  },
  {
    id: 2,
    quote: "Crafty Chocolates transformed our wedding vision into a set of architectural pralines that guests are still talking about. It's art you can eat.",
    author: "Julian Thorne",
    role: "Private Collector"
  },
  {
    id: 3,
    quote: "Finding a studio that understands both the physics of structural design and the chemistry of tempering is rare. They are the future of artisanal sweets.",
    author: "Dr. Marcus Chen",
    role: "Food Scientist"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-cream overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-bold mb-4 block">Client Feedback</span>
          <h2 className="text-[40px] md:text-[60px] font-black uppercase text-choco leading-[0.9] tracking-tighter">
            Voices of the <span className="text-gold italic font-serif lowercase font-normal">atelier.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative p-8 md:p-12 border border-choco/5 bg-white shadow-sm flex flex-col justify-between"
            >
              <Quote className="text-gold/20 absolute top-8 right-8" size={48} strokeWidth={1} />
              
              <p className="text-clay text-lg leading-relaxed italic font-serif mb-8 relative z-10">
                "{t.quote}"
              </p>
              
              <div>
                <div className="w-10 h-px bg-gold mb-4" />
                <h4 className="font-bold uppercase tracking-tight text-choco text-sm">
                  {t.author}
                </h4>
                <p className="text-gold text-[10px] uppercase tracking-widest font-black mt-1">
                  {t.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 flex justify-center items-center gap-12 opacity-30 grayscale"
        >
          {/* Logo cloud placeholders */}
          <span className="font-serif italic text-xl">Vogue</span>
          <span className="font-black uppercase tracking-tighter text-2xl">Archi</span>
          <span className="font-sans font-bold text-sm tracking-widest uppercase">Gourmet</span>
          <span className="font-serif font-black text-2xl tracking-tight">Eater</span>
        </motion.div>
      </div>
    </section>
  );
}
