import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, X, AlertTriangle, Loader2 } from 'lucide-react';
import { STEP_TITLES, STEP_SUBTITLES, STUDIO_COPY_STEP3 } from '../copy';
import { useStudio } from '../state/StudioContext';
import { processLogoFile, initialsToMask } from '../lib/logoProcessor';

export default function Step3Mark() {
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
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[3]}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{STEP_SUBTITLES[3]}</p>

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
    </div>
  );
}
