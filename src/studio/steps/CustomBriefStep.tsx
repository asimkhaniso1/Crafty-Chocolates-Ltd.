import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CUSTOM_BRIEF_COPY } from '../copy';
import { WHATSAPP_NUMBER } from '../../constants';
import { useStudio } from '../state/StudioContext';

const INPUT_CLASS =
  'w-full border border-choco/20 bg-cream px-4 py-3 text-choco text-sm outline-none focus:border-gold transition-colors';

export default function CustomBriefStep() {
  const { dispatch } = useStudio();
  const [shapeType, setShapeType] = useState<string>('');
  const [size, setSize] = useState('');
  const [details, setDetails] = useState('');

  const lines = ['Hello Crafty Chocolates, I would like a brief for a custom shape.'];
  const shapeLabel = CUSTOM_BRIEF_COPY.shapeTypes.find(s => s.key === shapeType)?.label;
  if (shapeLabel) lines.push(`Shape: ${shapeLabel}`);
  if (size.trim()) lines.push(`Approx size: ${size.trim()}`);
  if (details.trim()) lines.push(`Idea: ${details.trim()}`);
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;

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

      {/* Shape type */}
      <div className="mb-8">
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-choco mb-3">
          {CUSTOM_BRIEF_COPY.shapeLabel}
        </h3>
        <div className="flex flex-wrap gap-2 font-sans">
          {CUSTOM_BRIEF_COPY.shapeTypes.map(s => {
            const active = shapeType === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setShapeType(active ? '' : s.key)}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border transition-all ${
                  active
                    ? 'bg-choco text-cream border-choco'
                    : 'border-choco/20 text-choco hover:border-gold'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div className="mb-8 max-w-md">
        <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-choco mb-3">
          {CUSTOM_BRIEF_COPY.sizeLabel}
        </label>
        <input
          type="text"
          value={size}
          onChange={e => setSize(e.target.value)}
          placeholder="e.g. 5 cm wide"
          className={INPUT_CLASS}
        />
        <p className="text-clay text-xs mt-2">{CUSTOM_BRIEF_COPY.sizeHint}</p>
      </div>

      {/* Details */}
      <div className="mb-10 max-w-md">
        <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-choco mb-3">
          {CUSTOM_BRIEF_COPY.detailsLabel}
        </label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          rows={3}
          placeholder={CUSTOM_BRIEF_COPY.detailsPlaceholder}
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

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
