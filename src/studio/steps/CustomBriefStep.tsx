import { useState } from 'react';
import { ArrowLeft, Scale, Wrench } from 'lucide-react';
import { CUSTOM_BRIEF_COPY, CHOCOLATE_NAMES, STEP6_COPY, formatEstimatedWeight } from '../copy';
import { WRAPPER_MESSAGE_MAX } from '../constraints';
import { WHATSAPP_NUMBER, formatPrice } from '../../constants';
import { useStudio } from '../state/StudioContext';
import type { ChocolateType } from '../types';

const INPUT_CLASS =
  'w-full border border-choco/20 bg-cream px-4 py-3 text-choco text-sm outline-none focus:border-gold transition-colors';

const CHIP_CLASS = (active: boolean) =>
  `px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border transition-all ${
    active ? 'bg-choco text-cream border-choco' : 'border-choco/20 text-choco hover:border-gold'
  }`;

/** Largest mold: a piece must fit within A4 (either orientation). */
const MOLD_MAX_LONG_CM = 28;
const MOLD_MAX_SHORT_CM = 19;
const THICKNESS_MIN_MM = 4;
const THICKNESS_MAX_MM = 25;
/** Custom shapes are made to order from a new mold — they start at 100 pieces. */
const CUSTOM_MIN_QTY = 100;
/**
 * One-time tooling for a bespoke shape (design + laser-cut + vacuum-form),
 * separate from the standard studio's fee.designMold pricing rule, which
 * stays on standard-canvas quotes.
 */
const CUSTOM_TOOLING_FEE_PKR = 20000;

/**
 * Matches the real Crafty Bite: 10 g at 3 × 3 × 1 cm. Kept consistent with
 * studioProducts.ts weights rather than textbook chocolate density.
 */
const CHOCOLATE_DENSITY_G_PER_CM3 = 10 / 9;

/**
 * How much of the width × height bounding box a silhouette typically fills.
 * A letter is mostly negative space; a heart nearly fills its box.
 */
const SHAPE_FILL_FACTORS: Record<string, number> = {
  logo: 0.6,
  letter: 0.45,
  heart: 0.75,
  organic: 0.7,
  other: 0.65,
};

type WrapMode = 'none' | 'foil' | 'printed';

function parsePositive(value: string): number | null {
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function CustomBriefStep() {
  const { design, dispatch } = useStudio();
  const spec = design.customSpec ?? {};

  const [width, setWidth] = useState(spec.widthCm?.toString() ?? '');
  const [height, setHeight] = useState(spec.heightCm?.toString() ?? '');
  const [thickness, setThickness] = useState(spec.thicknessMm?.toString() ?? '');
  const [quantity, setQuantity] = useState('');
  const [details, setDetails] = useState('');

  const shapeType = spec.shapeType ?? '';
  const chocolate = design.chocolate;
  const wrapMode: WrapMode = design.extras.printedWrapper?.enabled
    ? 'printed'
    : design.extras.foil
      ? 'foil'
      : 'none';
  const foil = design.extras.foil ?? 'silver';
  const wrapperMessage = design.extras.printedWrapper?.message ?? '';

  const widthCm = parsePositive(width);
  const heightCm = parsePositive(height);
  const thicknessMm = parsePositive(thickness);

  function updateDim(field: 'widthCm' | 'heightCm' | 'thicknessMm', raw: string) {
    if (field === 'widthCm') setWidth(raw);
    if (field === 'heightCm') setHeight(raw);
    if (field === 'thicknessMm') setThickness(raw);
    dispatch({ type: 'SET_CUSTOM_SPEC', spec: { [field]: parsePositive(raw) ?? undefined } });
  }

  function setWrapMode(mode: WrapMode) {
    if (mode === 'none') {
      dispatch({ type: 'SET_EXTRAS', extras: { foil: undefined, printedWrapper: undefined } });
    } else if (mode === 'foil') {
      dispatch({
        type: 'SET_EXTRAS',
        extras: { foil: design.extras.foil ?? 'silver', printedWrapper: undefined },
      });
    } else {
      dispatch({
        type: 'SET_EXTRAS',
        extras: {
          foil: design.extras.foil ?? 'silver',
          printedWrapper: { enabled: true, ...design.extras.printedWrapper },
        },
      });
    }
  }

  const fitsMold =
    widthCm !== null &&
    heightCm !== null &&
    Math.max(widthCm, heightCm) <= MOLD_MAX_LONG_CM &&
    Math.min(widthCm, heightCm) <= MOLD_MAX_SHORT_CM;
  const sizeInvalid = widthCm !== null && heightCm !== null && !fitsMold;

  const thicknessOk =
    thicknessMm !== null && thicknessMm >= THICKNESS_MIN_MM && thicknessMm <= THICKNESS_MAX_MM;

  const pieceWeightG =
    widthCm !== null && heightCm !== null && thicknessMm !== null && fitsMold
      ? widthCm *
        heightCm *
        (thicknessMm / 10) *
        CHOCOLATE_DENSITY_G_PER_CM3 *
        (SHAPE_FILL_FACTORS[shapeType] ?? 0.65)
      : null;

  const quantityN = parsePositive(quantity);
  const quantityBelowMoq = quantityN !== null && quantityN < CUSTOM_MIN_QTY;
  const batchWeightG = pieceWeightG !== null && quantityN !== null ? pieceWeightG * quantityN : null;

  const briefReady = Boolean(shapeType) && fitsMold && thicknessOk && !quantityBelowMoq;

  const shapeLabel = CUSTOM_BRIEF_COPY.shapeTypes.find(s => s.key === shapeType)?.label;
  const lines = ['Hello Crafty Chocolates, I would like a brief for a custom shape.'];
  if (shapeLabel) lines.push(`Shape: ${shapeLabel}`);
  if (widthCm !== null && heightCm !== null) lines.push(`Size: ${widthCm} x ${heightCm} cm`);
  if (thicknessMm !== null) lines.push(`Thickness: ${thicknessMm} mm`);
  if (pieceWeightG !== null) lines.push(`Est. piece weight: ${formatEstimatedWeight(pieceWeightG)}`);
  lines.push(`Chocolate: ${CHOCOLATE_NAMES[chocolate]}`);
  if (wrapMode === 'foil') {
    lines.push(`Wrapping: Foil-wrapped (${STEP6_COPY.foilNames[foil]})`);
  } else if (wrapMode === 'printed') {
    lines.push(`Wrapping: Printed wrapper (${STEP6_COPY.foilNames[foil]} foil ends)`);
    if (wrapperMessage.trim()) lines.push(`Wrapper message: ${wrapperMessage.trim()}`);
  }
  if (quantityN !== null && !quantityBelowMoq) {
    lines.push(`Quantity: ${quantityN} pcs`);
    if (batchWeightG !== null) lines.push(`Est. batch weight: ${formatEstimatedWeight(batchWeightG)}`);
  }
  if (details.trim()) lines.push(`Idea: ${details.trim()}`);
  lines.push(`Mold tooling (one-time): ${formatPrice(CUSTOM_TOOLING_FEE_PKR)}`);
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
                onClick={() =>
                  dispatch({ type: 'SET_CUSTOM_SPEC', spec: { shapeType: active ? undefined : s.key } })
                }
                className={CHIP_CLASS(active)}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size + thickness */}
      <div className="mb-8 max-w-md">
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-choco mb-3">
          {CUSTOM_BRIEF_COPY.sizeLabel}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
              {CUSTOM_BRIEF_COPY.widthLabel}
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              value={width}
              onChange={e => updateDim('widthCm', e.target.value)}
              placeholder="e.g. 5"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
              {CUSTOM_BRIEF_COPY.heightLabel}
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              value={height}
              onChange={e => updateDim('heightCm', e.target.value)}
              placeholder="e.g. 5"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
              {CUSTOM_BRIEF_COPY.thicknessLabel}
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={THICKNESS_MIN_MM}
              max={THICKNESS_MAX_MM}
              value={thickness}
              onChange={e => updateDim('thicknessMm', e.target.value)}
              placeholder="e.g. 10"
              className={INPUT_CLASS}
            />
          </div>
        </div>
        {sizeInvalid ? (
          <p className="text-red-700 text-xs mt-2 font-semibold">{CUSTOM_BRIEF_COPY.sizeError}</p>
        ) : (
          <p className="text-clay text-xs mt-2">{CUSTOM_BRIEF_COPY.sizeHint}</p>
        )}
        <p className="text-clay text-xs mt-1">{CUSTOM_BRIEF_COPY.thicknessHint}</p>
      </div>

      {/* Estimated weight */}
      {pieceWeightG !== null && (
        <div className="mb-8 max-w-md border border-gold/40 bg-gold/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <Scale size={18} className="text-gold shrink-0" />
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-choco">
                {CUSTOM_BRIEF_COPY.weightLabel}
              </span>
              <span className="text-choco font-black text-lg">
                {formatEstimatedWeight(pieceWeightG)}
                {batchWeightG !== null && (
                  <span className="font-bold text-sm text-clay">
                    {' '}
                    &middot; {CUSTOM_BRIEF_COPY.weightTotalLabel}: {formatEstimatedWeight(batchWeightG)}
                  </span>
                )}
              </span>
            </div>
          </div>
          <p className="text-clay text-xs mt-2">{CUSTOM_BRIEF_COPY.weightNote}</p>
        </div>
      )}

      {/* Chocolate */}
      <div className="mb-8">
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-choco mb-3">
          {CUSTOM_BRIEF_COPY.chocolateLabel}
        </h3>
        <div className="flex flex-wrap gap-2 font-sans">
          {(['milk', 'semidark'] as ChocolateType[]).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => dispatch({ type: 'SET_CHOCOLATE', chocolate: c })}
              className={CHIP_CLASS(chocolate === c)}
            >
              {CHOCOLATE_NAMES[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Wrapping */}
      <div className="mb-8">
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-choco mb-3">
          {CUSTOM_BRIEF_COPY.wrapLabel}
        </h3>
        <div className="flex flex-wrap gap-2 font-sans">
          {(
            [
              ['none', CUSTOM_BRIEF_COPY.wrapNone],
              ['foil', CUSTOM_BRIEF_COPY.wrapFoil],
              ['printed', CUSTOM_BRIEF_COPY.wrapPrinted],
            ] as [WrapMode, string][]
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setWrapMode(mode)}
              className={CHIP_CLASS(wrapMode === mode)}
            >
              {label}
            </button>
          ))}
        </div>

        {wrapMode !== 'none' && (
          <div className="mt-4">
            <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
              {CUSTOM_BRIEF_COPY.foilColourLabel}
            </label>
            <div className="flex gap-2 font-sans">
              {(['silver', 'gold'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_EXTRAS', extras: { foil: c } })}
                  className={CHIP_CLASS(foil === c)}
                >
                  {STEP6_COPY.foilNames[c]}
                </button>
              ))}
            </div>
          </div>
        )}

        {wrapMode === 'printed' && (
          <div className="mt-4 max-w-md">
            <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-clay mb-2">
              {CUSTOM_BRIEF_COPY.wrapperMessageLabel}
            </label>
            <input
              type="text"
              value={wrapperMessage}
              maxLength={WRAPPER_MESSAGE_MAX}
              onChange={e =>
                dispatch({
                  type: 'SET_EXTRAS',
                  extras: {
                    printedWrapper: {
                      enabled: true,
                      ...design.extras.printedWrapper,
                      message: e.target.value || undefined,
                    },
                  },
                })
              }
              placeholder={CUSTOM_BRIEF_COPY.wrapperMessagePlaceholder}
              className={INPUT_CLASS}
            />
            <p className="text-clay text-xs mt-2">{CUSTOM_BRIEF_COPY.wrapperArtworkNote}</p>
          </div>
        )}
      </div>

      {/* One-time tooling */}
      <div className="mb-8 max-w-md border border-choco/15 bg-choco/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <Wrench size={18} className="text-choco/60 shrink-0" />
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-choco">
              {CUSTOM_BRIEF_COPY.toolingLabel}
            </span>
            <span className="text-choco font-black text-lg">{formatPrice(CUSTOM_TOOLING_FEE_PKR)}</span>
          </div>
        </div>
        <p className="text-clay text-xs mt-2">{CUSTOM_BRIEF_COPY.toolingNote}</p>
      </div>

      {/* Quantity */}
      <div className="mb-8 max-w-[200px]">
        <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-choco mb-3">
          {CUSTOM_BRIEF_COPY.quantityLabel}
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={CUSTOM_MIN_QTY}
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          placeholder={`e.g. ${CUSTOM_MIN_QTY}`}
          className={INPUT_CLASS}
        />
        {quantityBelowMoq ? (
          <p className="text-red-700 text-xs mt-2 font-semibold">{CUSTOM_BRIEF_COPY.moqError}</p>
        ) : (
          <p className="text-clay text-xs mt-2">{CUSTOM_BRIEF_COPY.moqNote}</p>
        )}
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

      {briefReady ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-gold text-white px-10 py-5 uppercase font-sans text-xs tracking-widest font-black hover:bg-choco transition-all"
        >
          {CUSTOM_BRIEF_COPY.cta}
        </a>
      ) : (
        <div>
          <span className="inline-block bg-gold/40 text-white px-10 py-5 uppercase font-sans text-xs tracking-widest font-black cursor-not-allowed select-none">
            {CUSTOM_BRIEF_COPY.cta}
          </span>
          <p className="text-clay text-xs mt-3">
            {quantityBelowMoq ? CUSTOM_BRIEF_COPY.moqError : CUSTOM_BRIEF_COPY.ctaLockedNote}
          </p>
        </div>
      )}
    </div>
  );
}
