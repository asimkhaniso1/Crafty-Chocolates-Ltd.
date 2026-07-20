import { useRef, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { STEP_TITLES, STEP_SUBTITLES, STEP3_WRAPPED_COPY, STEP6_COPY } from '../copy';
import { WRAPPER_MESSAGE_MAX, WRAPPER_SCALE_MIN, WRAPPER_SCALE_MAX } from '../constraints';
import { useStudio } from '../state/StudioContext';
import { getPackagingOption } from '../data/packagingOptions';
import { isBarProduct } from '../data/studioProducts';
import { processWrapperImage } from '../lib/logoProcessor';

const FOIL_SWATCHES: { key: 'silver' | 'gold'; hex: string }[] = [
  { key: 'silver', hex: '#C0C0C4' },
  { key: 'gold', hex: '#C9A24B' },
];

const RIBBON_SWATCHES: { key: 'black' | 'purple' | 'white'; hex: string }[] = [
  { key: 'black', hex: '#1A1A1A' },
  { key: 'purple', hex: '#5B2A86' },
  { key: 'white', hex: '#F5F1EA' },
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
 * Wrapped/unwrapped choice + foil colour — merged in from the old standalone
 * "Wrapped or unwrapped" step. `isLoose` drives which extras field it writes
 * to: `extras.foil` alone for a loose pack, `extras.piecesWrapped` (plus
 * foil colour) for a boxed pack.
 */
function WrappedSection({ isLoose }: { isLoose: boolean }) {
  const { design, dispatch } = useStudio();
  const wrapped = isLoose ? Boolean(design.extras.foil) : design.extras.piecesWrapped === true;

  function chooseWrapped() {
    if (isLoose) {
      dispatch({ type: 'SET_EXTRAS', extras: { foil: design.extras.foil ?? 'silver' } });
    } else {
      dispatch({ type: 'SET_EXTRAS', extras: { piecesWrapped: true, foil: design.extras.foil ?? 'silver' } });
    }
  }

  function chooseUnwrapped() {
    if (isLoose) {
      dispatch({ type: 'SET_EXTRAS', extras: { foil: undefined } });
    } else {
      dispatch({ type: 'SET_EXTRAS', extras: { piecesWrapped: false, foil: undefined } });
    }
  }

  const wrappedTitle = isLoose ? STEP3_WRAPPED_COPY.looseWrappedTitle : STEP3_WRAPPED_COPY.boxedWrappedTitle;
  const wrappedBody = isLoose ? STEP3_WRAPPED_COPY.looseWrappedBody : STEP3_WRAPPED_COPY.boxedWrappedBody;
  const unwrappedTitle = isLoose ? STEP3_WRAPPED_COPY.looseUnwrappedTitle : STEP3_WRAPPED_COPY.boxedUnwrappedTitle;
  const unwrappedBody = isLoose ? STEP3_WRAPPED_COPY.looseUnwrappedBody : STEP3_WRAPPED_COPY.boxedUnwrappedBody;

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <button
          onClick={chooseWrapped}
          className={`relative text-left p-6 border transition-all ${
            wrapped ? 'border-choco bg-choco text-cream' : 'border-choco/15 hover:border-gold bg-cream'
          }`}
        >
          <h3 className="font-black uppercase tracking-tight text-lg mb-1">{wrappedTitle}</h3>
          <p className={`text-sm ${wrapped ? 'text-cream/70' : 'text-clay'}`}>{wrappedBody}</p>
          <span
            className={`inline-block mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${
              wrapped ? 'text-gold' : 'text-choco/40'
            }`}
          >
            {wrapped ? STEP3_WRAPPED_COPY.chosenCta : STEP3_WRAPPED_COPY.chooseCta}
          </span>
        </button>
        <button
          onClick={chooseUnwrapped}
          className={`relative text-left p-6 border transition-all ${
            !wrapped ? 'border-choco bg-choco text-cream' : 'border-choco/15 hover:border-gold bg-cream'
          }`}
        >
          <h3 className="font-black uppercase tracking-tight text-lg mb-1">{unwrappedTitle}</h3>
          <p className={`text-sm ${!wrapped ? 'text-cream/70' : 'text-clay'}`}>{unwrappedBody}</p>
          <span
            className={`inline-block mt-4 text-[10px] uppercase tracking-[0.2em] font-bold ${
              !wrapped ? 'text-gold' : 'text-choco/40'
            }`}
          >
            {!wrapped ? STEP3_WRAPPED_COPY.chosenCta : STEP3_WRAPPED_COPY.chooseCta}
          </span>
        </button>
      </div>

      {wrapped && (
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-3">
            {STEP3_WRAPPED_COPY.foilPickerTitle}
          </h3>
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
        </div>
      )}
    </section>
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

          {wrapper?.imageDataUrl && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
                {STEP6_COPY.printedWrapperScaleLabel}
              </p>
              <input
                type="range"
                min={WRAPPER_SCALE_MIN}
                max={WRAPPER_SCALE_MAX}
                step={0.01}
                value={wrapper?.scale ?? 1}
                onChange={e =>
                  dispatch({
                    type: 'SET_EXTRAS',
                    extras: {
                      printedWrapper: { enabled: true, ...wrapper, scale: parseFloat(e.target.value) },
                    },
                  })
                }
                className="w-full accent-gold"
              />
            </div>
          )}

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

export default function Step3Finishing() {
  const { design, dispatch } = useStudio();
  const [qrError, setQrError] = useState(false);

  const option = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  // The individual wrapper is a "loose pack": no box, so none of the
  // box-only extras (ribbon, box colour, sleeve, greeting card, wax seal,
  // butter-paper message, QR) apply — only the wrap/foil choice does. Gated
  // on the packaging *type*, not count === 1 — the wedding favour box is
  // also a single-piece box (count 1) but is a real boxed presentation, not
  // a loose pack.
  const isIndividual = option?.type === 'individual';
  const isWeddingFavor = option?.type === 'wedding-favor';
  // Printed wrapper applies to bar-shaped products, loose-pack pieces, and
  // the center message bar of X+1/wedding-favour boxes (per catalog: "add
  // your message on the chocolate bar wrapper").
  const wrapperEligible = isBarProduct(design.product) || isIndividual || Boolean(option?.centerBar);

  const piecesWrapped = design.extras.piecesWrapped === true;
  const insideMessageLength = design.extras.insideMessage?.length ?? 0;

  function handleQrChange(value: string) {
    dispatch({ type: 'SET_EXTRAS', extras: { qrUrl: value } });
    setQrError(value.length > 0 && !/^https:\/\/.+/i.test(value));
  }

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[3]}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{STEP_SUBTITLES[3]}</p>

      {isIndividual ? (
        <div className="space-y-10">
          <WrappedSection isLoose />
          {wrapperEligible && <PrintedWrapperSection />}
        </div>
      ) : (
        <div className="space-y-10">
          <WrappedSection isLoose={false} />

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

          {/* Toggles — the wedding favour box has no printed sleeve */}
          <section className={`grid gap-3 ${isWeddingFavor ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
            {!isWeddingFavor && (
              <ToggleCard
                label={STEP6_COPY.sleeveToggleLabel}
                body={STEP6_COPY.sleeveToggleBody}
                active={!!design.extras.sleevePrint}
                onToggle={() =>
                  dispatch({ type: 'SET_EXTRAS', extras: { sleevePrint: !design.extras.sleevePrint } })
                }
              />
            )}
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

          {/* Inside message — butter paper is the medium for bare pieces; when
              pieces are foil-wrapped, the message prints on the sleeve instead. */}
          <section>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay">
                {STEP6_COPY.insideMessageTitle}
              </h3>
              {!piecesWrapped && (
                <span className="text-[10px] text-clay/60 font-sans">
                  {STEP6_COPY.insideMessageCounter(insideMessageLength, INSIDE_MESSAGE_MAX)}
                </span>
              )}
            </div>
            <p className="text-xs text-clay/70 italic font-serif mb-2">
              {piecesWrapped ? STEP6_COPY.insideMessageWrappedNote : STEP6_COPY.insideMessageBareNote}
            </p>
            <textarea
              value={design.extras.insideMessage ?? ''}
              maxLength={INSIDE_MESSAGE_MAX}
              placeholder={STEP6_COPY.insideMessagePlaceholder}
              onChange={e => dispatch({ type: 'SET_EXTRAS', extras: { insideMessage: e.target.value } })}
              rows={3}
              className="w-full border border-choco/15 bg-cream px-4 py-3 text-sm text-choco focus:border-gold outline-none resize-none"
            />
          </section>

          {/* QR code — not offered on the wedding favour box (no sleeve to print it on) */}
          {!isWeddingFavor && (
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
          )}

          {/* Printed wrapper (Crafty Bar in a box still qualifies) */}
          {wrapperEligible && <PrintedWrapperSection />}
        </div>
      )}
    </div>
  );
}
