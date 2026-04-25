import { motion } from 'motion/react';
import { Layers, PenTool, Cpu, Sparkles } from 'lucide-react';

export default function CustomMoldSection() {
  const steps = [
    {
      icon: <PenTool className="text-gold" />,
      title: "Design Concepts",
      desc: "Our artists work with you to sketch unique reliefs and patterns."
    },
    {
      icon: <Cpu className="text-gold" />,
      title: "Digital Sculpting",
      desc: "We transform sketches into 3D models with precision engineering."
    },
    {
      icon: <Layers className="text-gold" />,
      title: "In-House Casting",
      desc: "Molds are fabricated in our food-grade silicone studio."
    },
    {
      icon: <Sparkles className="text-gold" />,
      title: "Final Pour",
      desc: "Your vision, cast in premium single-origin chocolate."
    }
  ];

  return (
    <section id="custom-molds" className="py-24 bg-cream overflow-hidden border-y border-choco/10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-gold text-xs uppercase tracking-[0.3em] font-bold mb-4 block">Bespoke Production</span>
            <h2 className="text-[50px] md:text-[70px] font-black uppercase text-choco mb-10 leading-[0.9] tracking-tighter">
              A Studio Where Design Meets <span className="text-gold italic font-serif lowercase font-normal">decoherence.</span>
            </h2>
            <p className="text-clay text-lg mb-16 leading-relaxed font-medium">
              We aren't just chocolatiers; we are designers. Unlike traditional shops, we house a fully-equipped manufacturing studio. From corporate logos to architectural miniatures, we cast your wildest ideas into velvet chocolate.
            </p>

            <div className="grid sm:grid-cols-2 gap-10">
              {steps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-4"
                >
                  <div className="w-14 h-14 border border-choco/20 rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                  <h4 className="font-bold uppercase tracking-tight text-choco text-lg">{step.title}</h4>
                  <p className="text-clay text-sm leading-relaxed italic">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-choco p-2 rotate-2 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1623334234204-62921a8cd354?auto=format&fit=crop&q=80&w=1200" 
                alt="Chocolate mold studio"
                className="w-full h-full object-cover grayscale-[0.2]"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Absolute accent images */}
            <motion.div 
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 w-64 h-64 bg-gold p-1 shadow-2xl hidden md:block"
            >
              <img 
                src="https://images.unsplash.com/photo-1623334234217-37c88e5066a9?auto=format&fit=crop&q=80&w=600" 
                alt="Detailed mold"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
