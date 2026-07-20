import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, X, AlertTriangle, Loader2 } from 'lucide-react';
import {
  STEP_TITLES,
  STEP_SUBTITLES,
  STUDIO_COPY_STEP3,
  CENTER_BAR_COPY,
  CHOCOLATE_NAMES,
  CHOCOLATE_DESCRIPTIONS,
  STEP4_COPY,
  MIXED_CHOCOLATE_LABEL,
} from '../copy';
import { BAR_CAPTION_MAX, MARK_SCALE_MIN, MARK_SCALE_MAX } from '../constraints';
import { useStudio } from '../state/StudioContext';
import { isBarProduct } from '../data/studioProducts';
import { getPackagingOption } from '../data/packagingOptions';
import { processLogoFile, initialsToMask } from '../lib/logoProcessor';
import type { BoxMix, ChocolateType } from '../types';

const CHOCOLATE_SWATCHES: { key: ChocolateType; color: string }[] = [
  { key: 'milk', color: '#7B4A26' },
  { key: 'semidark', color: '#56331B' },
];

/**
 * Mark upload/initials — carried over wholesale from the old "Add your mark"
 * step, now the first section of the combined "Design it" step.
 */
function MarkSection() {
  const { design, dispatch } = useStudio();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initials, setInitials] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const logo = design.logo;

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);
      try {
        const result = await processLogoFile(file);
        if ('error' in result) {
          setError(result.error);
        } else {
          dispatch({ type: 'SET_LOGO', logo: result.logo });
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [dispatch]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  const handleScaleChange = useCallback(
    (value: number) => {
      if (!logo) return;
      dispatch({ type: 'SET_LOGO', logo: { ...logo, scale: value } });
    },
    [dispatch, logo]
  );

  const handleRemove = useCallback(() => {
    dispatch({ type: 'CLEAR_LOGO' });
    setError(null);
  }, [dispatch]);

  const handleApplyInitials = useCallback(async () => {
    if (!initials.trim()) return;
    setError(null);
    setIsProcessing(true);
    try {
      const logoState = await initialsToMask(initials);
      if (!logoState.maskDataUrl) {
        setError(STUDIO_COPY_STEP3.genericError);
        return;
      }
      dispatch({ type: 'SET_LOGO', logo: logoState });
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, initials]);

  return (
    <section>
      {!logo && (
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          className={`border border-dashed rounded-sm p-12 text-center cursor-pointer transition-all ${
            isDragging ? 'border-gold bg-gold/5' : 'border-choco/20 hover:border-choco/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            className="hidden"
            onChange={handleInputChange}
          />
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3 text-clay">
              <Loader2 className="animate-spin" size={28} />
              <p className="text-sm font-medium">{STUDIO_COPY_STEP3.processing}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <UploadCloud className="text-choco/50" size={32} />
              <p className="text-choco font-bold">{STUDIO_COPY_STEP3.dropzoneTitle}</p>
              <p className="text-clay text-sm">{STUDIO_COPY_STEP3.dropzoneBody}</p>
              <span className="mt-2 inline-block text-[10px] uppercase tracking-[0.2em] font-bold text-gold border border-gold/40 px-4 py-2">
                {STUDIO_COPY_STEP3.browseButton}
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-800 text-sm px-4 py-3 rounded-sm">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {logo && (
        <div className="mt-2">
          <div className="flex flex-col sm:flex-row gap-6 items-start bg-choco text-cream p-6 rounded-sm">
            <div className="w-32 h-32 shrink-0 bg-cream/10 border border-cream/20 flex items-center justify-center rounded-sm overflow-hidden">
              <img
                src={logo.maskDataUrl}
                alt={logo.originalName}
                className="max-w-[85%] max-h-[85%] object-contain"
                style={{ filter: 'invert(1)' }}
              />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold truncate max-w-[70%]">{logo.originalName}</p>
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-bold text-cream/60 hover:text-cream transition-colors"
                >
                  <X size={14} />
                  {STUDIO_COPY_STEP3.removeButton}
                </button>
              </div>

              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-cream/60 mb-2">
                {STUDIO_COPY_STEP3.scaleLabel}
              </label>
              <input
                type="range"
                min={0.5}
                max={1.4}
                step={0.01}
                value={logo.scale}
                onChange={e => handleScaleChange(parseFloat(e.target.value))}
                className="w-full accent-gold"
              />

              {isBarProduct(design.product) && (
                <div className="mt-5">
                  <label
                    className="block text-[10px] uppercase tracking-[0.2em] font-bold text-cream/60 mb-2"
                    htmlFor="studio-bar-caption-step2"
                  >
                    {CENTER_BAR_COPY.captionLabel}
                  </label>
                  <input
                    id="studio-bar-caption-step2"
                    type="text"
                    maxLength={BAR_CAPTION_MAX}
                    value={design.barCaption ?? ''}
                    placeholder={CENTER_BAR_COPY.captionPlaceholder}
                    onChange={e => dispatch({ type: 'SET_BAR_CAPTION', barCaption: e.target.value })}
                    className="w-full border border-cream/20 bg-cream/10 px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-gold outline-none"
                  />
                  <p className="text-[10px] text-cream/50 mt-1 italic font-serif">{CENTER_BAR_COPY.captionHint}</p>
                </div>
              )}
            </div>
          </div>

          {logo.warnings.length > 0 && (
            <div className="mt-4 space-y-2">
              {logo.warnings.map((warning, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-800 text-sm px-4 py-3 rounded-sm"
                >
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-10 pt-8 border-t border-choco/10">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-clay mb-3">
          {STUDIO_COPY_STEP3.initialsPrompt}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full">
            <label className="sr-only" htmlFor="studio-initials-input">
              {STUDIO_COPY_STEP3.initialsLabel}
            </label>
            <input
              id="studio-initials-input"
              type="text"
              maxLength={4}
              value={initials}
              onChange={e => setInitials(e.target.value.toUpperCase())}
              placeholder={STUDIO_COPY_STEP3.initialsPlaceholder}
              className="w-full sm:w-48 border border-choco/20 px-4 py-3 text-choco font-serif text-2xl tracking-widest text-center focus:outline-none focus:border-gold"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            />
          </div>
          <button
            onClick={() => void handleApplyInitials()}
            disabled={!initials.trim() || isProcessing}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold border border-gold/40 px-5 py-3 hover:bg-gold/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {STUDIO_COPY_STEP3.initialsApply}
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * "All one chocolate" vs "Mixed milk & semi-dark" — shown once a multi-piece
 * box is selected. Carried over from the old box-size step; the reducer
 * rebuilds `design.cells` to alternate milk/semi-dark for 'mixed', or to all
 * match `design.chocolate` for 'single'.
 */
function BoxMixPicker({ boxMix }: { boxMix: BoxMix }) {
  const { dispatch } = useStudio();

  function choose(mix: BoxMix) {
    dispatch({ type: 'SET_BOX_MIX', boxMix: mix });
  }

  const cards: { key: BoxMix; title: string; body: string }[] = [
    { key: 'single', title: STEP4_COPY.boxMixSingleTitle, body: STEP4_COPY.boxMixSingleBody },
    { key: 'mixed', title: STEP4_COPY.boxMixMixedTitle, body: STEP4_COPY.boxMixMixedBody },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-3">
        {STEP4_COPY.boxMixTitle}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(card => {
          const active = boxMix === card.key;
          return (
            <button
              key={card.key}
              onClick={() => choose(card.key)}
              className={`relative text-left p-5 border transition-all ${
                active ? 'border-choco bg-choco text-cream' : 'border-choco/15 hover:border-gold bg-cream'
              }`}
            >
              <h4 className="font-black uppercase tracking-tight text-sm">{card.title}</h4>
              <p className={`text-xs mt-1 ${active ? 'text-cream/70' : 'text-clay'}`}>{card.body}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChocolateSection() {
  const { design, dispatch } = useStudio();
  const packagingOption = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  const isMultiPieceBox = Boolean(packagingOption?.grid && packagingOption.count > 1);

  return (
    <section className="mt-12 pt-10 border-t border-choco/10">
      <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-4">Chocolate</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {CHOCOLATE_SWATCHES.map(swatch => {
          const active = design.chocolate === swatch.key && (!isMultiPieceBox || design.boxMix !== 'mixed');
          return (
            <button
              key={swatch.key}
              onClick={() => dispatch({ type: 'SET_CHOCOLATE', chocolate: swatch.key })}
              className={`text-left border p-4 transition-all ${
                active ? 'border-choco' : 'border-choco/15 hover:border-gold'
              }`}
            >
              <div
                className="w-full aspect-square rounded-full mb-4 border border-choco/10"
                style={{ background: swatch.color }}
              />
              <h3 className="font-black uppercase tracking-tight text-sm text-choco">
                {CHOCOLATE_NAMES[swatch.key]}
              </h3>
              <p className="text-xs text-clay mt-1">{CHOCOLATE_DESCRIPTIONS[swatch.key]}</p>
            </button>
          );
        })}
        {isMultiPieceBox && (
          <button
            onClick={() => dispatch({ type: 'SET_BOX_MIX', boxMix: 'mixed' })}
            className={`text-left border p-4 transition-all ${
              design.boxMix === 'mixed' ? 'border-choco' : 'border-choco/15 hover:border-gold'
            }`}
          >
            <div
              className="w-full aspect-square rounded-full mb-4 border border-choco/10"
              style={{ background: 'linear-gradient(135deg, #7B4A26 50%, #56331B 50%)' }}
            />
            <h3 className="font-black uppercase tracking-tight text-sm text-choco">Mixed</h3>
            <p className="text-xs text-clay mt-1">{MIXED_CHOCOLATE_LABEL}</p>
          </button>
        )}
      </div>

      {isMultiPieceBox && <BoxMixPicker boxMix={design.boxMix ?? 'single'} />}
    </section>
  );
}

/**
 * Center-bar controls (mark size on bar + caption) for X+1/wedding-favour
 * packaging — the customer's mark is applied to the large message bar
 * separately from the ring pieces above.
 */
function CenterBarPanel() {
  const { design, dispatch } = useStudio();
  const option = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  if (!option?.centerBar) return null;

  const hasRing = Boolean(option.grid && option.count > 1);
  const scale = Math.min(MARK_SCALE_MAX, Math.max(MARK_SCALE_MIN, design.centerBarScale ?? 1));

  return (
    <section className="mt-12 pt-10 border-t border-choco/10">
      <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
        {CENTER_BAR_COPY.panelTitle}
      </h3>
      <p className="text-xs text-clay/70 italic font-serif mb-6">
        {hasRing ? CENTER_BAR_COPY.assortedNote : CENTER_BAR_COPY.singleBarNote}
      </p>

      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-clay mb-2">
        {CENTER_BAR_COPY.markSizeLabel}
      </label>
      <input
        type="range"
        min={MARK_SCALE_MIN}
        max={MARK_SCALE_MAX}
        step={0.01}
        value={scale}
        onChange={e => dispatch({ type: 'SET_CENTER_BAR_SCALE', scale: parseFloat(e.target.value) })}
        className="w-full accent-gold"
      />

      <div className="mt-6">
        <label
          className="block text-[10px] uppercase tracking-[0.2em] font-bold text-clay mb-2"
          htmlFor="studio-centerbar-caption"
        >
          {CENTER_BAR_COPY.captionLabel}
        </label>
        <input
          id="studio-centerbar-caption"
          type="text"
          maxLength={BAR_CAPTION_MAX}
          value={design.barCaption ?? ''}
          placeholder={CENTER_BAR_COPY.captionPlaceholder}
          onChange={e => dispatch({ type: 'SET_BAR_CAPTION', barCaption: e.target.value })}
          className="w-full border border-choco/15 bg-cream px-3 py-2 text-sm text-choco focus:border-gold outline-none"
        />
        <p className="text-[10px] text-clay/60 mt-1 italic font-serif">{CENTER_BAR_COPY.captionHint}</p>
      </div>
    </section>
  );
}

export default function Step2Design() {
  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[2]}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{STEP_SUBTITLES[2]}</p>

      <MarkSection />
      <ChocolateSection />
      <CenterBarPanel />
    </div>
  );
}
