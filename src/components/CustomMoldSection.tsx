import { motion } from 'motion/react';
import { Layers, PenTool, Cpu, Sparkles } from 'lucide-react';

export default function CustomMoldSection() {
  const steps = [
    {
      icon: <PenTool className="text-gold" />,
      title: "Design & Sketch",
      desc: "We turn your idea — a logo, monogram, letter, or organic form — into a clean chocolate relief."
    },
    {
      icon: <Cpu className="text-gold" />,
      title: "Precision Laser-Cutting",
      desc: "Every mold is laser-cut in-house for razor-sharp edges and the finest engraved detail."
    },
    {
      icon: <Layers className="text-gold" />,
      title: "In-House Vacuum-Forming",
      desc: "We vacuum-form each mold in our own studio — bespoke shapes at sizes up to A4, no outsourcing."
    },
    {
      icon: <Sparkles className="text-gold" />,
      title: "Final Pour",
      desc: "Your vision, cast in premium chocolate and finished by hand."
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
              A Studio Where Design Meets <span className="text-gold italic font-serif lowercase font-normal">craft.</span>
            </h2>
            <p className="text-clay text-lg mb-16 leading-relaxed font-medium">
              We aren't just chocolatiers; we are makers. In our own studio we design, laser-cut, and vacuum-form every custom chocolate mold in-house — so we can shape almost anything, from a corporate logo embossed in chocolate to bespoke organic forms and large plaques up to A4 size. Your idea, engineered into a mold, then cast in velvet chocolate.
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
                src="/products/ai_logobites_separator.png"
                alt="Custom logo chocolate bites"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Absolute accent images */}
            <motion.div 
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 w-64 h-64 bg-gold p-1 shadow-2xl hidden md:block"
            >
              <img
                src="/products/ai_golden_4plus1.png"
                alt="Custom engraved chocolate box"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
