import { useEffect, useMemo, useState } from 'react';
import { toPng } from 'html-to-image';
import { MessageCircle, Download, Save, Clock, Truck, Package, Check, Copy, Scale } from 'lucide-react';
import {
  STEP_TITLES,
  STEP_SUBTITLES,
  QUOTE_COPY,
  SAVE_SHARE_COPY,
  productSpecLine,
  formatEstimatedWeight,
} from '../copy';
import { formatPrice } from '../../constants';
import { useStudio } from '../state/StudioContext';
import { usePricingRules } from '../lib/usePricingRules';
import { computeQuote } from '../lib/pricing';
import { buildStudioWaLink } from '../lib/whatsapp';
import { saveDesign } from '../lib/designStore';
import { getStudioProduct } from '../data/studioProducts';
import QuotePrintSheet from '../output/QuotePrintSheet';

const QUANTITY_PRESETS = [50, 100, 250, 500];

interface Step7QuoteProps {
  onSave?: () => void;
}

interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  shareUrl?: string;
  isLocal?: boolean;
  error?: string;
  copied?: boolean;
}

export default function Step7Quote({ onSave }: Step7QuoteProps) {
  const { design, dispatch, previewRef } = useStudio();
  const { rules, source } = usePricingRules();
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });
  const [arrangementImage, setArrangementImage] = useState<string | undefined>(undefined);

  const quote = useMemo(() => computeQuote(design, rules), [design, rules]);

  // Capture a snapshot of the box/piece preview once, when the quote step is
  // viewed — used as a small "Your arrangement" thumbnail on screen and in
  // the printable quote. Not persisted to the Design; on-screen/PDF only.
  useEffect(() => {
    const node = previewRef.current;
    if (!node || node.offsetWidth === 0 || node.offsetHeight === 0) return;
    let cancelled = false;
    // Race against a timeout: html-to-image can hang indefinitely in some
    // environments (embedded/driven browsers), and the snapshot is a
    // nice-to-have — never let it wedge state or leak work.
    Promise.race([
      toPng(node, { pixelRatio: 2 }),
      new Promise<null>(resolve => setTimeout(() => resolve(null), 6000)),
    ])
      .then(dataUrl => {
        if (!cancelled && dataUrl) setArrangementImage(dataUrl);
      })
      .catch(() => {
        // Silently skip — e.g. an image asset couldn't be inlined.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = (value: number) => {
    const next = Math.max(1, Math.floor(value || 0));
    dispatch({ type: 'SET_QUANTITY', quantity: next });
  };

  const handleWhatsApp = () => {
    const link = buildStudioWaLink(design, quote, saveState.shareUrl);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    window.print();
  };

  const handleSave = async () => {
    setSaveState({ status: 'saving' });
    const result = await saveDesign(design, quote);
    if ('error' in result) {
      setSaveState({ status: 'error', error: result.error });
      return;
    }
    setSaveState({
      status: 'saved',
      shareUrl: result.shareUrl,
      isLocal: result.source === 'local',
    });
    onSave?.();
  };

  const handleCopyLink = async () => {
    if (!saveState.shareUrl) return;
    try {
      await navigator.clipboard.writeText(saveState.shareUrl);
      setSaveState(prev => ({ ...prev, copied: true }));
      setTimeout(() => setSaveState(prev => ({ ...prev, copied: false })), 2000);
    } catch {
      // Clipboard access denied; the user can still select the link text.
    }
  };

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[4]}
      </h2>
      <p className="text-clay font-medium mb-3 max-w-lg">{STEP_SUBTITLES[4]}</p>
      {design.product && (
        <p className="text-xs uppercase tracking-[0.15em] font-bold text-gold mb-10">
          {productSpecLine(getStudioProduct(design.product))}
        </p>
      )}

      {/* Quantity selector */}
      <div className="mb-8 border border-choco/15 p-6">
        <label className="block text-xs font-black uppercase tracking-[0.2em] text-clay mb-3">
          {QUOTE_COPY.quantityLabel}
        </label>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="number"
            min={1}
            value={design.quantity}
            onChange={e => handleQuantityChange(Number(e.target.value))}
            className="w-32 border border-choco/20 bg-cream px-3 py-2 text-lg font-black text-choco focus:border-gold focus:outline-none"
          />
          {quote.moq > design.quantity && (
            <p className="text-xs text-gold font-semibold">{QUOTE_COPY.moqClampNote(quote.moq)}</p>
          )}
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-clay mr-3">
            {QUOTE_COPY.quantityPresetsLabel}
          </span>
          <div className="inline-flex flex-wrap gap-2 mt-2">
            {QUANTITY_PRESETS.map(preset => (
              <button
                key={preset}
                onClick={() => handleQuantityChange(preset)}
                className={`px-3 py-1 text-xs font-bold border transition-all ${
                  design.quantity === preset
                    ? 'border-choco bg-choco text-cream'
                    : 'border-choco/15 text-choco hover:border-gold'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-clay/70 italic font-serif mt-4 pt-4 border-t border-choco/10">
          {QUOTE_COPY.moqBulkNote}
        </p>
      </div>

      {/* Arrangement snapshot */}
      {arrangementImage && (
        <div className="mb-8 border border-choco/15 p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-clay mb-4">
            Your arrangement
          </h3>
          <img
            src={arrangementImage}
            alt="Your arrangement"
            className="max-w-[220px] rounded-sm border border-choco/10"
          />
        </div>
      )}

      {/* Breakdown */}
      <div className="mb-8 border border-choco/15 p-6">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-clay mb-4">
          {QUOTE_COPY.breakdownTitle}
        </h3>
        <div className="divide-y divide-choco/10">
          {quote.lines.map((line, i) => (
            <div key={`line-${i}`} className="flex justify-between py-2 text-sm">
              <span className="text-clay">{line.label}</span>
              <span className="text-choco font-semibold">{formatPrice(line.amount)}</span>
            </div>
          ))}
          {quote.fees.map((fee, i) => (
            <div key={`fee-${i}`} className="flex justify-between py-2 text-sm">
              <span className="text-clay">{fee.label}</span>
              <span className="text-choco font-semibold">{formatPrice(fee.amount)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-baseline pt-4 mt-2 border-t border-choco/20">
          <span className="text-sm font-black uppercase tracking-wide text-choco">
            {QUOTE_COPY.totalLabel}
          </span>
          <span className="text-3xl font-black text-choco">{formatPrice(quote.total)}</span>
        </div>
      </div>

      {/* Chips */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex flex-col items-center gap-1 border border-choco/15 py-4 px-2 text-center">
          <Package size={18} className="text-gold" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-clay">
            {QUOTE_COPY.moqChipLabel}
          </span>
          <span className="text-sm font-black text-choco">{quote.moq}</span>
        </div>
        <div className="flex flex-col items-center gap-1 border border-choco/15 py-4 px-2 text-center">
          <Clock size={18} className="text-gold" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-clay">
            {QUOTE_COPY.leadChipLabel}
          </span>
          <span className="text-sm font-black text-choco">{QUOTE_COPY.leadDaysValue(quote.leadDays)}</span>
        </div>
        <div className="flex flex-col items-center gap-1 border border-choco/15 py-4 px-2 text-center">
          <Truck size={18} className="text-gold" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-clay">
            {QUOTE_COPY.deliveryChipLabel}
          </span>
          <span className="text-sm font-black text-choco">
            {QUOTE_COPY.deliveryDaysValue(quote.deliveryDays)}
          </span>
        </div>
        {quote.estimatedWeightG !== undefined && (
          <div className="flex flex-col items-center gap-1 border border-choco/15 py-4 px-2 text-center">
            <Scale size={18} className="text-gold" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-clay">
              {QUOTE_COPY.weightChipLabel}
            </span>
            <span className="text-sm font-black text-choco">
              {formatEstimatedWeight(quote.estimatedWeightG)}
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-clay italic mb-8">
        {source === 'fallback' ? QUOTE_COPY.fallbackPricingNote : QUOTE_COPY.livePricingNote}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleWhatsApp}
          className="inline-flex items-center gap-2 bg-choco text-cream px-6 py-3 font-black uppercase text-xs tracking-[0.15em] hover:bg-choco/90 transition-all"
        >
          <MessageCircle size={16} />
          {QUOTE_COPY.sendWhatsAppCta}
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 border border-choco text-choco px-6 py-3 font-black uppercase text-xs tracking-[0.15em] hover:border-gold hover:text-gold transition-all"
        >
          <Download size={16} />
          {QUOTE_COPY.downloadQuoteCta}
        </button>
        <button
          onClick={handleSave}
          disabled={saveState.status === 'saving'}
          className="inline-flex items-center gap-2 border border-choco/30 text-choco px-6 py-3 font-black uppercase text-xs tracking-[0.15em] hover:border-gold hover:text-gold transition-all disabled:opacity-50"
        >
          <Save size={16} />
          {saveState.status === 'saving' ? SAVE_SHARE_COPY.saving : QUOTE_COPY.saveDesignCta}
        </button>
      </div>

      {saveState.status === 'error' && (
        <p className="mt-4 text-xs text-red-600 font-semibold">{saveState.error}</p>
      )}

      {saveState.status === 'saved' && saveState.shareUrl && (
        <div className="mt-6 border border-choco/15 bg-choco/[0.03] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-choco mb-1">
            {SAVE_SHARE_COPY.savedTitle}
          </p>
          <p className="text-xs text-clay mb-3">
            {saveState.isLocal ? SAVE_SHARE_COPY.savedLocalBody : SAVE_SHARE_COPY.savedCloudBody}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <code className="text-xs bg-cream border border-choco/15 px-3 py-2 break-all">
              {saveState.shareUrl}
            </code>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 border border-choco/30 text-choco px-4 py-2 font-black uppercase text-[11px] tracking-[0.15em] hover:border-gold hover:text-gold transition-all"
            >
              {saveState.copied ? <Check size={14} /> : <Copy size={14} />}
              {saveState.copied ? SAVE_SHARE_COPY.copied : SAVE_SHARE_COPY.copyLink}
            </button>
          </div>
        </div>
      )}

      <QuotePrintSheet design={design} quote={quote} arrangementImage={arrangementImage} />
    </div>
  );
}
