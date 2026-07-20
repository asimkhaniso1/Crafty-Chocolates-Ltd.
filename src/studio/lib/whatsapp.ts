import { WHATSAPP_NUMBER, formatPrice } from '../../constants';
import { CHOCOLATE_NAMES, EMBOSS_NAMES } from '../copy';
import { getPackagingOption } from '../data/packagingOptions';
import { getStudioProduct } from '../data/studioProducts';
import type { Design, Quote } from '../types';

/**
 * Builds a wa.me click-to-chat link summarising the design and quote.
 * Kept under ~900 characters once encoded.
 */
export function buildStudioWaLink(design: Design, quote: Quote, shareUrl?: string): string {
  const productName = design.product ? getStudioProduct(design.product)?.name ?? design.product : 'Custom piece';
  const chocolateName = CHOCOLATE_NAMES[design.chocolate] ?? design.chocolate;
  const embossName = EMBOSS_NAMES[design.emboss] ?? design.emboss;
  const packagingName = design.packaging
    ? getPackagingOption(design.packaging.type)?.name ?? design.packaging.type
    : 'Not selected';

  const lines = [
    'Hello Crafty Chocolates! I designed a piece in your Design Studio and would like a quote.',
    '',
    `Product: ${productName}`,
    `Chocolate: ${chocolateName}`,
    `Finish: ${embossName}`,
    `Packaging: ${packagingName}`,
    `Quantity: ${design.quantity}`,
    `Quoted total: ${formatPrice(quote.total)}`,
  ];

  if (shareUrl) {
    lines.push('', `View my design: ${shareUrl}`);
  }

  const text = lines.join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
