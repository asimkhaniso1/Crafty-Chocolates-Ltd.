import { useRef, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { STEP_TITLES, STEP_SUBTITLES, STEP6_COPY } from '../copy';
import { WRAPPER_MESSAGE_MAX } from '../constraints';
import { useStudio } from '../state/StudioContext';
import { getPackagingOption } from '../data/packagingOptions';
import { processWrapperImage } from '../lib/logoProcessor';

const RIBBON_SWATCHES: { key: 'black' | 'purple' | 'white'; hex: string }[] = [
  { key: 'black', hex: '#1A1A1A' },
  { key: 'purple', hex: '#5B2A86' },
  { key: 'white', hex: '#F5F1EA' },
];

const FOIL_SWATCHES: { key: 'silver' | 'gold'; hex: string }[] = [
  { key: 'silver', hex: '#C0C0C4' },
  { key: 'gold', hex: '#C9A24B' },
];

const BOX_COLOUR_SWATCHES: { key: 'choco' | 'ivory' | 'gold'; hex: string }[] = [
  { key: 'choco', hex: '#2D1E17' },
  { key: 'ivory', hex: '#F5F1EA' },
  { key: 'gold', hex: '#A67C52' },
];

const INSIDE_MESSAGE_MAX = 140;

function ToggleCard({
  label,
  body,
  active,
  onToggle,
}: {
  label: string;
  body: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`text-left p-4 border transition-all flex items-start justify-between gap-4 ${
        active ? 'border-choco bg-choco text-cream' : 'border-choco/15 hover:border-gold bg-cream'
      }`}
    >
      <span>
        <span className="block font-black uppercase tracking-tight text-sm">{label}</span>
        <span className={`block text-xs mt-1 ${active ? 'text-cream/70' : 'text-clay'}`}>{body}</span>
      </span>
      <span
        className={`flex-shrink-0 mt-1 w-9 h-5 rounded-full relative transition-colors ${
          active ? 'bg-gold' : 'bg-choco/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-cream transition-transform ${
            active ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}

/**
 * Printed wrapper: a paper wrapper around the piece that is PRINTED, not
 * embossed — it can carry a full-colour image and its own message,
 * independent of the embossed mark. Bars and loose packs only.
 */
function PrintedWrapperSection() {
  const { design, dispatch } = useStudio();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const wrapper = design.extras.printedWrapper;
  const enabled = Boolean(wrapper?.enabled);

  function toggle() {
    setError(null);
    dispatch({
      type: 'SET_EXTRAS',
      extras: { printedWrapper: enabled ? undefined : { enabled: true } },
    });
  }

  async function handleFile(file: File) {
    setError(null);
    setIsProcessing(true);
    try {
      const result = await processWrapperImage(file);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      dispatch({
        type: 'SET_EXTRAS',
        extras: { printedWrapper: { enabled: true, ...wrapper, imageDataUrl: result.imageDataUrl } },
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section>
      <ToggleCard
        label={STEP6_COPY.printedWrapperToggleLabel}
        body={STEP6_COPY.printedWrapperToggleBody}
        active={enabled}
        onToggle={toggle}
      />

      {enabled && (
        <div className="mt-3 border border-choco/15 bg-cream p-4 space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
              {STEP6_COPY.printedWrapperImageLabel}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = '';
              }}
            />
            <div className="flex items-center gap-4">
              {wrapper?.imageDataUrl && (
                <img
                  src={wrapper.imageDataUrl}
                  alt={STEP6_COPY.printedWrapperImageLabel}
                  className="h-16 w-16 border border-choco/15 object-cover"
                />
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gold border border-gold/40 px-4 py-2 hover:bg-gold/10 transition-colors disabled:opacity-40"
                >
                  {isProcessing && <Loader2 className="animate-spin" size={12} />}
                  {wrapper?.imageDataUrl
                    ? STEP6_COPY.printedWrapperImageReplaceCta
                    : STEP6_COPY.printedWrapperImageCta}
                </button>
                {wrapper?.imageDataUrl && (
                  <button
                    onClick={() =>
                      dispatch({
                        type: 'SET_EXTRAS',
                        extras: {
                          printedWrapper: { enabled: true, ...wrapper, imageDataUrl: undefined },
                        },
                      })
                    }
                    className="text-[10px] uppercase tracking-[0.2em] font-bold text-clay border border-choco/20 px-4 py-2 hover:border-gold transition-colors"
                  >
                    {STEP6_COPY.printedWrapperImageRemoveCta}
                  </button>
                )}
              </div>
            </div>
            {error && (
              <div className="mt-3 flex items-start gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-800 text-sm px-4 py-3 rounded-sm">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
              {STEP6_COPY.printedWrapperMessageLabel}
            </p>
            <input
              type="text"
              maxLength={WRAPPER_MESSAGE_MAX}
              value={wrapper?.message ?? ''}
              placeholder={STEP6_COPY.printedWrapperMessagePlaceholder}
              onChange={e =>
                dispatch({
                  type: 'SET_EXTRAS',
                  extras: {
                    printedWrapper: {
                      enabled: true,
                      ...wrapper,
                      message: e.target.value || undefined,
                    },
                  },
                })
              }
              className="w-full border border-choco/15 bg-cream px-3 py-2 text-sm text-choco focus:border-gold outline-none"
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default function Step6Extras() {
  const { design, dispatch } = useStudio();
  const [qrError, setQrError] = useState(false);

  const option = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  // The individual wrapper is a "loose pack": no box, so none of the
  // box-only extras (ribbon, box colour, sleeve, greeting card, wax seal,
  // inside message, QR) apply — only the foil colour choice does.
  const isIndividual = option?.count === 1;
  // Printed wrapper applies to the Crafty Bar and to loose-pack pieces.
  const wrapperEligible = design.product === 'bar' || isIndividual;

  const insideMessageLength = design.extras.insideMessage?.length ?? 0;

  function handleQrChange(value: string) {
    dispatch({ type: 'SET_EXTRAS', extras: { qrUrl: value } });
    setQrError(value.length > 0 && !/^https:\/\/.+/i.test(value));
  }

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[6]}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{STEP_SUBTITLES[6]}</p>

      {isIndividual ? (
        <div className="space-y-6">
          <p className="text-sm text-clay italic max-w-md">{STEP6_COPY.loosePackNote}</p>

          <section>
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-1">
              {STEP6_COPY.foilTitle}
            </h3>
            <p className="text-xs text-clay/70 mb-3">{STEP6_COPY.foilNote}</p>
            <div className="flex flex-wrap gap-3">
              {FOIL_SWATCHES.map(swatch => {
                const active = design.extras.foil === swatch.key;
                return (
                  <button
                    key={swatch.key}
                    onClick={() => dispatch({ type: 'SET_EXTRAS', extras: { foil: swatch.key } })}
                    className={`flex flex-col items-center gap-2 p-3 border transition-all ${
                      active ? 'border-choco' : 'border-choco/15 hover:border-gold'
                    }`}
                  >
                    <span
                      className="block w-9 h-9 rounded-full border border-choco/10"
                      style={{ background: swatch.hex }}
                    />
                    <span className="text-[10px] uppercase tracking-wide font-bold text-choco">
                      {STEP6_COPY.foilNames[swatch.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {wrapperEligible && <PrintedWrapperSection />}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Ribbon */}
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-3">
              {STEP6_COPY.ribbonTitle}
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => dispatch({ type: 'SET_EXTRAS', extras: { ribbon: undefined } })}
                className={`px-4 py-3 border text-xs font-bold uppercase tracking-wide transition-all ${
                  !design.extras.ribbon
                    ? 'border-choco bg-choco text-cream'
                    : 'border-choco/15 text-choco hover:border-gold'
                }`}
              >
                {STEP6_COPY.ribbonNone}
              </button>
              {RIBBON_SWATCHES.map(swatch => {
                const active = design.extras.ribbon === swatch.hex;
                return (
                  <button
                    key={swatch.key}
                    onClick={() => dispatch({ type: 'SET_EXTRAS', extras: { ribbon: swatch.hex } })}
                    className={`flex flex-col items-center gap-2 p-3 border transition-all ${
                      active ? 'border-choco' : 'border-choco/15 hover:border-gold'
                    }`}
                  >
                    <span
                      className="block w-9 h-9 rounded-full border border-choco/10"
                      style={{ background: swatch.hex }}
                    />
                    <span className="text-[10px] uppercase tracking-wide font-bold text-choco">
                      {STEP6_COPY.ribbonNames[swatch.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Box colour */}
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-3">
              {STEP6_COPY.boxColourTitle}
            </h3>
            <div className="flex flex-wrap gap-3">
              {BOX_COLOUR_SWATCHES.map(swatch => {
                const active = design.extras.boxColour === swatch.hex;
                return (
                  <button
                    key={swatch.key}
                    onClick={() => dispatch({ type: 'SET_EXTRAS', extras: { boxColour: swatch.hex } })}
                    className={`flex flex-col items-center gap-2 p-3 border transition-all ${
                      active ? 'border-choco' : 'border-choco/15 hover:border-gold'
                    }`}
                  >
                    <span
                      className="block w-9 h-9 rounded-full border border-choco/10"
                      style={{ background: swatch.hex }}
                    />
                    <span className="text-[10px] uppercase tracking-wide font-bold text-choco">
                      {STEP6_COPY.boxColourNames[swatch.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Toggles */}
          <section className="grid sm:grid-cols-3 gap-3">
            <ToggleCard
              label={STEP6_COPY.sleeveToggleLabel}
              body={STEP6_COPY.sleeveToggleBody}
              active={!!design.extras.sleevePrint}
              onToggle={() =>
                dispatch({ type: 'SET_EXTRAS', extras: { sleevePrint: !design.extras.sleevePrint } })
              }
            />
            <ToggleCard
              label={STEP6_COPY.greetingCardToggleLabel}
              body={STEP6_COPY.greetingCardToggleBody}
              active={!!design.extras.greetingCard}
              onToggle={() =>
                dispatch({ type: 'SET_EXTRAS', extras: { greetingCard: !design.extras.greetingCard } })
              }
            />
            <ToggleCard
              label={STEP6_COPY.waxSealToggleLabel}
              body={STEP6_COPY.waxSealToggleBody}
              active={!!design.extras.waxSeal}
              onToggle={() => dispatch({ type: 'SET_EXTRAS', extras: { waxSeal: !design.extras.waxSeal } })}
            />
          </section>

          {/* Inside message */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay">
                {STEP6_COPY.insideMessageTitle}
              </h3>
              <span className="text-[10px] text-clay/60 font-sans">
                {STEP6_COPY.insideMessageCounter(insideMessageLength, INSIDE_MESSAGE_MAX)}
              </span>
            </div>
            <textarea
              value={design.extras.insideMessage ?? ''}
              maxLength={INSIDE_MESSAGE_MAX}
              placeholder={STEP6_COPY.insideMessagePlaceholder}
              onChange={e => dispatch({ type: 'SET_EXTRAS', extras: { insideMessage: e.target.value } })}
              rows={3}
              className="w-full border border-choco/15 bg-cream px-4 py-3 text-sm text-choco focus:border-gold outline-none resize-none"
            />
          </section>

          {/* QR code */}
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-1">
              {STEP6_COPY.qrTitle}
            </h3>
            <p className="text-xs text-clay/70 mb-2">{STEP6_COPY.qrNote}</p>
            <input
              type="url"
              value={design.extras.qrUrl ?? ''}
              placeholder={STEP6_COPY.qrPlaceholder}
              onChange={e => handleQrChange(e.target.value)}
              className={`w-full border bg-cream px-4 py-3 text-sm text-choco outline-none ${
                qrError ? 'border-red-400' : 'border-choco/15 focus:border-gold'
              }`}
            />
            {qrError && <p className="text-xs text-red-500 mt-1">{STEP6_COPY.qrInvalid}</p>}
          </section>

          {/* Printed wrapper (Crafty Bar in a box still qualifies) */}
          {wrapperEligible && <PrintedWrapperSection />}
        </div>
      )}
    </div>
  );
}
