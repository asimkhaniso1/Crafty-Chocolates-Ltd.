import { motion } from 'motion/react';
import { Building2, Gem, Heart, MessageCircle, Package } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

const CORPORATE_MESSAGE = "Hello Crafty Chocolates, I'd like a quote for corporate logo chocolates. Company: ___  Quantity: ___  Occasion: ___";
const WEDDING_MESSAGE = "Hello Crafty Chocolates, I'd like to order wedding favors. Event date: ___  Guest count: ___";
const OEM_MESSAGE = "Hello Crafty Chocolates, I'm interested in wholesale / white-label supply. Business: ___  Monthly quantity: ___";
const CORPORATE_WA_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(CORPORATE_MESSAGE)}`;
const WEDDING_WA_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WEDDING_MESSAGE)}`;
const OEM_WA_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(OEM_MESSAGE)}`;

const TIERS = [
  {
    icon: Building2,
    label: 'Logo Bites',
    price: 'Rs. 770',
    unit: 'per 3-piece box · min. 50 boxes',
    desc: 'Your logo cast into every chocolate with a custom-engineered mold, in a foil-sleeved box. Sample box Rs. 500 in Karachi.',
    cta: CORPORATE_WA_URL,
    ctaLabel: 'Request a Sample',
  },
  {
    icon: Gem,
    label: 'Logo Bar Box',
    price: 'Rs. 3,550',
    unit: 'per 16+1 box · min. 10 boxes',
    desc: 'A full custom logo bar plus 16 assorted Belgian-blend chocolates, with your branding on the box and wrappers.',
    cta: CORPORATE_WA_URL,
    ctaLabel: 'Get a Quote',
  },
  {
    icon: Heart,
    label: 'Wedding Favors',
    price: 'Rs. 1,100',
    unit: 'per 5-piece box · min. 10 boxes',
    desc: 'Gold favor boxes with the couple’s names and date on every wrapper — Shadi, Nikah and Walima collections in Urdu or English.',
    cta: WEDDING_WA_URL,
    ctaLabel: 'Plan My Event',
  },
];

export default function CorporateSection() {
  return (
    <section id="corporate" className="py-24 bg-stone-50 border-b border-choco/10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-xl mb-16">
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-bold mb-4 block">Corporate &amp; Events</span>
          <h2 className="text-[40px] md:text-[60px] font-black uppercase text-choco leading-[0.9] tracking-tighter">
            Your logo, <span className="text-gold italic font-serif lowercase font-normal">in the chocolate.</span>
          </h2>
          <p className="text-clay text-lg leading-relaxed font-medium mt-6">
            Custom molded chocolates with your company logo embossed into the chocolate itself &mdash; not printed
            on a wrapper &mdash; by Pakistan&rsquo;s only in-house custom chocolate mold studio. Free mold design
            mock-up within 48 hours; delivery in 5&ndash;6 days.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="border border-choco/15 bg-cream p-8 flex flex-col"
            >
              <tier.icon className="text-gold mb-6" size={28} strokeWidth={1.5} />
              <h3 className="text-choco font-black uppercase tracking-tight text-xl mb-1">{tier.label}</h3>
              <p className="text-choco font-black text-3xl tracking-tighter">{tier.price}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-5">{tier.unit}</p>
              <p className="text-clay leading-relaxed font-medium text-sm mb-8 flex-1">{tier.desc}</p>
              <a
                href={tier.cta}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-choco text-white px-6 py-4 uppercase font-sans text-xs tracking-widest font-bold hover:bg-gold transition-all"
              >
                <MessageCircle size={14} strokeWidth={2.5} />
                {tier.ctaLabel}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Wholesale / white-label strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 border border-choco/15 bg-choco text-cream p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6"
        >
          <Package className="text-gold shrink-0" size={32} strokeWidth={1.5} />
          <div className="flex-1">
            <h3 className="font-black uppercase tracking-tight text-xl mb-1">
              Wholesale &amp; White-Label
            </h3>
            <p className="text-cream/60 font-medium text-sm leading-relaxed max-w-2xl">
              For gift studios, event planners, caterers and hotels: we craft and foil-wrap
              custom-molded chocolates in bulk &mdash; you box and brand them your way.
              Steady supply, consistent quality, your name on the box.
            </p>
          </div>
          <a
            href={OEM_WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold text-white px-6 py-4 uppercase font-sans text-xs tracking-widest font-bold hover:bg-cream hover:text-choco transition-all shrink-0"
          >
            <MessageCircle size={14} strokeWidth={2.5} />
            Talk Supply
          </a>
        </motion.div>
      </div>
    </section>
  );
}
