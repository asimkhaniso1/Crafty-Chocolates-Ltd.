import { WHATSAPP_NUMBER, formatPrice } from '../../constants';
import {
  CHOCOLATE_NAMES,
  EMBOSS_NAMES,
  centerBarSpec,
  packagingSummaryName,
  productSpecLine,
  formatEstimatedWeight,
} from '../copy';
import { getPackagingOption } from '../data/packagingOptions';
import { getStudioProduct } from '../data/studioProducts';
import type { Design, Quote } from '../types';

/**
 * Builds a wa.me click-to-chat link summarising the design and quote.
 * Kept under ~900 characters once encoded.
 */
export function buildStudioWaLink(design: Design, quote: Quote, shareUrl?: string): string {
  const productName = design.product
    ? productSpecLine(getStudioProduct(design.product)) || design.product
    : 'Custom piece';
  const chocolateName = CHOCOLATE_NAMES[design.chocolate] ?? design.chocolate;
  const embossName = EMBOSS_NAMES[design.emboss] ?? design.emboss;
  const packagingOption = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  const packagingName = design.packaging
    ? packagingOption
      ? packagingSummaryName(packagingOption.name, packagingOption.count, packagingOption.centerBar)
      : design.packaging.type
    : 'Not selected';

  const lines = [
    'Hello Crafty Chocolates! I designed a piece in your Design Studio and would like a quote.',
    '',
    `Product: ${productName}`,
    `Chocolate: ${chocolateName}`,
    `Finish: ${embossName}`,
    `Packaging: ${packagingName}`,
  ];

  if (packagingOption?.centerBar) {
    const spec = centerBarSpec(design.packaging?.type);
    if (spec) lines.push(`Message bar: ${spec}`);
  }

  if (design.barCaption?.trim()) {
    lines.push(`Bar caption: "${design.barCaption.trim()}"`);
  }

  if (design.extras.insideMessage?.trim()) {
    lines.push(`Butter-paper message: "${design.extras.insideMessage.trim()}"`);
  }

  const wrapper = design.extras.printedWrapper;
  if (wrapper?.enabled) {
    const details = [
      wrapper.message?.trim() ? `"${wrapper.message.trim()}"` : '',
      wrapper.imageDataUrl ? 'with image' : '',
    ]
      .filter(Boolean)
      .join(', ');
    lines.push(`Printed wrapper: Yes${details ? ` (${details})` : ''}`);
  }

  lines.push(`Quantity: ${design.quantity}`, `Quoted total: ${formatPrice(quote.total)}`);

  if (quote.estimatedWeightG !== undefined) {
    lines.push(`Est. weight: ${formatEstimatedWeight(quote.estimatedWeightG)}`);
  }

  if (shareUrl) {
    lines.push('', `View my design: ${shareUrl}`);
  }

  const text = lines.join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
