import { ArrowLeft } from 'lucide-react';
import { CUSTOM_BRIEF_COPY } from '../copy';
import { WHATSAPP_NUMBER } from '../../constants';
import { useStudio } from '../state/StudioContext';

export default function CustomBriefStep() {
  const { dispatch } = useStudio();
  const message = 'Hello Crafty Chocolates, I would like to share a brief for a fully custom design.';
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <div>
      <button
        onClick={() => dispatch({ type: 'BACK_TO_PRODUCTS' })}
        className="mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold text-choco hover:text-gold transition-colors"
      >
        <ArrowLeft size={14} />
        {CUSTOM_BRIEF_COPY.backCta}
      </button>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {CUSTOM_BRIEF_COPY.title}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{CUSTOM_BRIEF_COPY.body}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-block bg-gold text-white px-10 py-5 uppercase font-sans text-xs tracking-widest font-black hover:bg-choco transition-all"
      >
        {CUSTOM_BRIEF_COPY.cta}
      </a>
    </div>
  );
}
