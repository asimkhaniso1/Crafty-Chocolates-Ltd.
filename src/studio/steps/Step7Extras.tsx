import { useState } from 'react';
import { STEP_TITLES, STEP_SUBTITLES, STEP7_COPY } from '../copy';
import { useStudio } from '../state/StudioContext';
import { getPackagingOption } from '../data/packagingOptions';

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

export default function Step7Extras() {
  const { design, dispatch } = useStudio();
  const [qrError, setQrError] = useState(false);

  const option = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  const isIndividual = option?.count === 1;

  const insideMessageLength = design.extras.insideMessage?.length ?? 0;

  function handleQrChange(value: string) {
    dispatch({ type: 'SET_EXTRAS', extras: { qrUrl: value } });
    setQrError(value.length > 0 && !/^https:\/\/.+/i.test(value));
  }

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[7]}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{STEP_SUBTITLES[7]}</p>

      <div className="space-y-10">
        {/* Ribbon */}
        <section>
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-3">
            {STEP7_COPY.ribbonTitle}
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
              {STEP7_COPY.ribbonNone}
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
                    {STEP7_COPY.ribbonNames[swatch.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Foil — only for individual wrapper */}
        {isIndividual && (
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-1">
              {STEP7_COPY.foilTitle}
            </h3>
            <p className="text-xs text-clay/70 mb-3">{STEP7_COPY.foilNote}</p>
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
                      {STEP7_COPY.foilNames[swatch.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Box colour */}
        <section>
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-3">
            {STEP7_COPY.boxColourTitle}
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
                    {STEP7_COPY.boxColourNames[swatch.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Toggles */}
        <section className="grid sm:grid-cols-3 gap-3">
          <ToggleCard
            label={STEP7_COPY.sleeveToggleLabel}
            body={STEP7_COPY.sleeveToggleBody}
            active={!!design.extras.sleevePrint}
            onToggle={() =>
              dispatch({ type: 'SET_EXTRAS', extras: { sleevePrint: !design.extras.sleevePrint } })
            }
          />
          <ToggleCard
            label={STEP7_COPY.greetingCardToggleLabel}
            body={STEP7_COPY.greetingCardToggleBody}
            active={!!design.extras.greetingCard}
            onToggle={() =>
              dispatch({ type: 'SET_EXTRAS', extras: { greetingCard: !design.extras.greetingCard } })
            }
          />
          <ToggleCard
            label={STEP7_COPY.waxSealToggleLabel}
            body={STEP7_COPY.waxSealToggleBody}
            active={!!design.extras.waxSeal}
            onToggle={() => dispatch({ type: 'SET_EXTRAS', extras: { waxSeal: !design.extras.waxSeal } })}
          />
        </section>

        {/* Inside message */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay">
              {STEP7_COPY.insideMessageTitle}
            </h3>
            <span className="text-[10px] text-clay/60 font-sans">
              {STEP7_COPY.insideMessageCounter(insideMessageLength, INSIDE_MESSAGE_MAX)}
            </span>
          </div>
          <textarea
            value={design.extras.insideMessage ?? ''}
            maxLength={INSIDE_MESSAGE_MAX}
            placeholder={STEP7_COPY.insideMessagePlaceholder}
            onChange={e => dispatch({ type: 'SET_EXTRAS', extras: { insideMessage: e.target.value } })}
            rows={3}
            className="w-full border border-choco/15 bg-cream px-4 py-3 text-sm text-choco focus:border-gold outline-none resize-none"
          />
        </section>

        {/* QR code */}
        <section>
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-clay mb-1">
            {STEP7_COPY.qrTitle}
          </h3>
          <p className="text-xs text-clay/70 mb-2">{STEP7_COPY.qrNote}</p>
          <input
            type="url"
            value={design.extras.qrUrl ?? ''}
            placeholder={STEP7_COPY.qrPlaceholder}
            onChange={e => handleQrChange(e.target.value)}
            className={`w-full border bg-cream px-4 py-3 text-sm text-choco outline-none ${
              qrError ? 'border-red-400' : 'border-choco/15 focus:border-gold'
            }`}
          />
          {qrError && <p className="text-xs text-red-500 mt-1">{STEP7_COPY.qrInvalid}</p>}
        </section>
      </div>
    </div>
  );
}
