import { createPortal } from 'react-dom';
import { CHOCOLATE_NAMES, EMBOSS_NAMES, PRINT_SHEET_COPY, packagingSummaryName } from '../copy';
import { WHATSAPP_DISPLAY, PHONE_DISPLAY, formatPrice } from '../../constants';
import { getPackagingOption } from '../data/packagingOptions';
import { getStudioProduct } from '../data/studioProducts';
import type { Design, Quote } from '../types';

interface QuotePrintSheetProps {
  design: Design;
  quote: Quote;
}

/**
 * Hidden on screen, rendered only for window.print(). Portalled to
 * document.body so the app's animated/clipped containers can never affect it;
 * printing simply hides #root and shows the sheet (see the <style> block).
 */
export default function QuotePrintSheet({ design, quote }: QuotePrintSheetProps) {
  const productName = design.product
    ? getStudioProduct(design.product)?.name ?? design.product
    : 'Custom piece';
  const chocolateName = CHOCOLATE_NAMES[design.chocolate] ?? design.chocolate;
  const embossName = EMBOSS_NAMES[design.emboss] ?? design.emboss;
  const packagingOption = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  const packagingName = design.packaging
    ? packagingOption
      ? packagingSummaryName(packagingOption.name, packagingOption.count, packagingOption.centerBar)
      : design.packaging.type
    : 'Not selected';
  const wrapper = design.extras.printedWrapper;
  const wrapperSummary = wrapper?.enabled
    ? ['Yes', wrapper.message?.trim() ? `"${wrapper.message.trim()}"` : '', wrapper.imageDataUrl ? 'with image' : '']
        .filter(Boolean)
        .join(' — ')
    : null;
  const today = new Date().toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return createPortal(
    <div id="studio-print-sheet">
      <style>{`
        #studio-print-sheet { display: none; }
        @media print {
          #root { display: none !important; }
          #studio-print-sheet {
            display: block !important;
            padding: 32px;
            font-family: 'Inter', sans-serif;
            color: #2D1E17;
          }
        }
      `}</style>

      <header className="mb-8 border-b border-choco/20 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-choco">
          {PRINT_SHEET_COPY.brand}
        </h1>
        <p className="text-sm text-clay italic">{PRINT_SHEET_COPY.tagline}</p>
        <div className="mt-4 flex justify-between text-sm text-clay">
          <span className="uppercase tracking-wide">{PRINT_SHEET_COPY.quoteTitle}</span>
          <span>
            {PRINT_SHEET_COPY.dateLabel}: {today}
          </span>
        </div>
      </header>

      <section className="mb-8">
        <table className="w-full text-sm mb-4">
          <tbody>
            <tr>
              <td className="py-1 text-clay">{PRINT_SHEET_COPY.productLabel}</td>
              <td className="py-1 text-right font-semibold text-choco">{productName}</td>
            </tr>
            <tr>
              <td className="py-1 text-clay">Chocolate</td>
              <td className="py-1 text-right font-semibold text-choco">{chocolateName}</td>
            </tr>
            <tr>
              <td className="py-1 text-clay">Finish</td>
              <td className="py-1 text-right font-semibold text-choco">{embossName}</td>
            </tr>
            <tr>
              <td className="py-1 text-clay">Packaging</td>
              <td className="py-1 text-right font-semibold text-choco">{packagingName}</td>
            </tr>
            {design.barCaption?.trim() && (
              <tr>
                <td className="py-1 text-clay">Bar caption</td>
                <td className="py-1 text-right font-semibold text-choco">
                  &ldquo;{design.barCaption.trim()}&rdquo;
                </td>
              </tr>
            )}
            {design.extras.insideMessage?.trim() && (
              <tr>
                <td className="py-1 text-clay">Butter-paper message</td>
                <td className="py-1 text-right font-semibold text-choco">
                  &ldquo;{design.extras.insideMessage.trim()}&rdquo;
                </td>
              </tr>
            )}
            {wrapperSummary && (
              <tr>
                <td className="py-1 text-clay">Printed wrapper</td>
                <td className="py-1 text-right font-semibold text-choco">{wrapperSummary}</td>
              </tr>
            )}
            <tr>
              <td className="py-1 text-clay">{PRINT_SHEET_COPY.quantityLabel}</td>
              <td className="py-1 text-right font-semibold text-choco">{design.quantity}</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full text-sm border-t border-choco/20 pt-2">
          <tbody>
            {quote.lines.map((line, i) => (
              <tr key={`line-${i}`}>
                <td className="py-1 text-clay">{line.label}</td>
                <td className="py-1 text-right text-choco">{formatPrice(line.amount)}</td>
              </tr>
            ))}
            {quote.fees.map((fee, i) => (
              <tr key={`fee-${i}`}>
                <td className="py-1 text-clay">{fee.label}</td>
                <td className="py-1 text-right text-choco">{formatPrice(fee.amount)}</td>
              </tr>
            ))}
            <tr className="border-t border-choco/30">
              <td className="py-2 font-black uppercase text-choco">Total</td>
              <td className="py-2 text-right font-black text-choco">{formatPrice(quote.total)}</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4 text-xs text-clay">
          MOQ: {quote.moq} &middot; Lead time: {quote.leadDays} days &middot; Est. delivery:{' '}
          {quote.deliveryDays} days
        </p>
      </section>

      <footer className="border-t border-choco/20 pt-4 text-xs text-clay">
        <p>
          {PRINT_SHEET_COPY.contactWhatsApp}: {WHATSAPP_DISPLAY} &middot;{' '}
          {PRINT_SHEET_COPY.contactPhone}: {PHONE_DISPLAY} &middot; {PRINT_SHEET_COPY.contactWeb}
        </p>
        <p className="mt-2">{PRINT_SHEET_COPY.footerNote}</p>
      </footer>
    </div>,
    document.body
  );
}
