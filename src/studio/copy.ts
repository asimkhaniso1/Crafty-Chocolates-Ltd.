/**
 * All user-facing strings for the Chocolate Design Studio live here.
 *
 * Confidentiality: never mention the mold fabrication method or material,
 * or sheet-size names, anywhere in public copy.
 */
import type { BoxMix, ChocolateType, StudioProduct } from './types';

export const STUDIO_TITLE = 'The Design Studio';
export const STUDIO_SUBTITLE =
  "Build a piece that's entirely yours, from the first swatch to the final ribbon.";
export const STUDIO_BULK_BADGE = 'Bulk custom orders · from 50 pieces';

export const STEP_TITLES: Record<number, string> = {
  1: 'Choose your creation',
  2: 'Design it',
  3: 'Finishing touches',
  4: 'Your quote',
};

export const STEP_SUBTITLES: Record<number, string> = {
  1: 'The box is the product. Pick the piece that carries your story — everything inside follows from it.',
  2: 'Your mark, your chocolate, your message bar — brought together in one place.',
  3: 'Ribbon, sleeve, a note inside — the small details that make it a gift.',
  4: 'Here is your bespoke quote, ready to save, download, or send.',
};

/* ---------------------------------------------------------------------- */
/* Step 1 (Choose your creation) — catalog gallery                         */
/* ---------------------------------------------------------------------- */

export const CATALOG_COPY = {
  sectionSignature: 'Signature Boxes',
  sectionClassic: 'Classic Boxes',
  sectionLoose: 'Loose & Bars',
  filterAll: 'All',
  chooseCta: 'Choose this',
  chosenCta: 'Chosen',
};

export const NAV_LABELS = {
  next: 'Continue',
  back: 'Back',
  step: 'Step',
};

export const CUSTOM_BRIEF_COPY = {
  title: 'Tell us your vision',
  body:
    "Fully custom shapes are handled by our design team directly. Share a brief and reference images, and we'll follow up with a tailored quote.",
  cta: 'Send your brief via WhatsApp',
  backCta: 'Back to products',
};

export const PRODUCT_CARD_COPY: Record<string, { blurb: string }> = {
  bite: { blurb: 'A single, elegant bite — the simplest way to carry a mark.' },
  signature: { blurb: 'Our most-loved silhouette, finished to a premium standard.' },
  bar: { blurb: 'A generous rectangle, ideal for bold logos and long messages.' },
  slim: { blurb: 'A slender bar with room for a single elegant line.' },
  custom: { blurb: 'A fully bespoke shape, designed with our studio team.' },
};

/** Spec text only (no product name), e.g. "100 × 50 mm · 50g · 0.5 cm". */
function productSizeSpec(product: StudioProduct): string {
  if (product.key === 'custom') {
    return 'Bespoke shape and size, designed with our studio team';
  }
  const parts: string[] = [product.dims];
  if (product.weightG > 0) parts.push(`${product.weightG}g`);
  if (product.thicknessMm) {
    const cm = Number((product.thicknessMm / 10).toFixed(1));
    parts.push(`${cm} cm`);
  }
  return parts.join(' · ');
}

/**
 * Full "Name — spec" line used wherever a design summary needs to justify
 * price with the piece's real-world size, e.g.
 * "Crafty Bar — 100 × 50 mm · 50g · 0.5 cm".
 */
export function productSpecLine(product: StudioProduct | null | undefined): string {
  if (!product) return '';
  return `${product.name} — ${productSizeSpec(product)}`;
}

export const CHOCOLATE_NAMES: Record<string, string> = {
  milk: 'Milk',
  semidark: 'Semi-Dark',
};

export const CHOCOLATE_DESCRIPTIONS: Record<string, string> = {
  milk: 'Smooth, warm, and universally loved.',
  semidark: 'A balanced middle ground, mellow with a little edge.',
};

/** "Mixed — milk & semi-dark" copy, shared by the box-mix step and every design summary. */
export const MIXED_CHOCOLATE_LABEL = 'Mixed — milk & semi-dark';

/**
 * Chocolate summary label for a design — used wherever a quote/WhatsApp/
 * print summary needs one line for "which chocolate(s)". A multi-piece box
 * set to 'mixed' reports the mixed label instead of a single chocolate name,
 * since its cells alternate milk/semi-dark rather than all matching
 * `chocolate`.
 */
export function chocolateSummaryLabel(
  chocolate: ChocolateType,
  boxMix: BoxMix | undefined,
  isMultiPieceBox: boolean
): string {
  if (isMultiPieceBox && boxMix === 'mixed') return MIXED_CHOCOLATE_LABEL;
  return CHOCOLATE_NAMES[chocolate] ?? chocolate;
}

// The studio produces one finish — an embossed, raised mark. Kept as a
// lookup (rather than inlined) since the WhatsApp summary and print sheet
// still print a "Finish" line.
export const EMBOSS_NAMES: Record<string, string> = {
  emboss: 'Embossed',
};

export const WARNINGS = {
  fineDetail:
    'This design has very fine detail that may not translate cleanly onto chocolate. Consider simplifying it for the cleanest result.',
  fileTooLarge: 'That file is larger than we can accept. Please upload something under 5MB.',
  unsupportedFormat: 'We can’t read that file format. Please upload a PNG, JPG, or SVG.',
  sizeExceeded:
    'Your design exceeds our in-house mold size. Please scale it down or split it across multiple pieces.',
};

export const CTA_LABELS = {
  saveDesign: 'Save design',
  downloadQuote: 'Download quote',
  sendWhatsApp: 'Send via WhatsApp',
};

export const PACKAGING_OCCASION_LABELS: Record<string, string> = {
  wedding: 'Wedding',
  eid: 'Eid',
  corporate: 'Corporate',
  birthday: 'Birthday',
};

/* ---------------------------------------------------------------------- */
/* Step 2 (Design it) — mark upload/initials, part of the combined design */
/* step alongside chocolate and the center-bar panel.                     */
/* ---------------------------------------------------------------------- */

export const STUDIO_COPY_STEP3 = {
  dropzoneTitle: 'Drop your logo or artwork here',
  dropzoneBody: 'PNG, JPG, or SVG, up to 5MB. We\'ll clean it up automatically.',
  browseButton: 'Browse files',
  processing: 'Reading your artwork…',
  removeButton: 'Remove',
  scaleLabel: 'Size on chocolate',
  initialsPrompt: 'No logo? Type your initials instead.',
  initialsLabel: 'Initials (up to 4 characters)',
  initialsPlaceholder: 'e.g. AK',
  initialsApply: 'Use these initials',
  sendViaWhatsApp:
    'That file type needs a closer look from our team. Please send it to us via WhatsApp and we\'ll prepare it for you.',
  emptyResult:
    "We couldn't find a clear mark in that image. Try a version with more contrast against its background.",
  genericError: 'Something went wrong reading that file. Please try a different image.',
} as const;

// ---------------------------------------------------------------------------
// Step 4 — Quote copy (added by pricing/quote implementation)
// ---------------------------------------------------------------------------

export const QUOTE_COPY = {
  quantityLabel: 'Quantity',
  quantityPresetsLabel: 'Quick picks',
  moqNote: (moq: number) => `Minimum order quantity for this piece is ${moq}.`,
  moqClampNote: (moq: number) =>
    `Your quantity is below the minimum order of ${moq}. Your quote reflects ${moq} pieces.`,
  moqBulkNote:
    'The studio is built for bulk custom orders — every piece is quoted from a minimum of 50.',
  breakdownTitle: 'Your breakdown',
  totalLabel: 'Total quote',
  moqChipLabel: 'MOQ',
  leadChipLabel: 'Lead time',
  deliveryChipLabel: 'Est. delivery',
  weightChipLabel: 'Est. weight',
  leadDaysValue: (days: number) => `${days} days`,
  deliveryDaysValue: (days: number) => `${days} days`,
  fallbackPricingNote:
    'Indicative pricing — this is an estimate. Your final quote is confirmed by our studio team.',
  livePricingNote: 'Live pricing — reflects our current studio rates.',
  saveDesignCta: 'Save design',
  downloadQuoteCta: 'Download quote (PDF)',
  sendWhatsAppCta: 'Send via WhatsApp',
  discountAppliedNote: (pct: number) => `Volume discount applied: ${pct}% off unit price.`,
};

/**
 * "≈ 4.2 kg" / "≈ 850 g" — the quote's estimated filled weight is always
 * an approximation (box + piece weights are placeholders where not
 * confirmed by a spec sheet), so it's always shown with the "≈" prefix.
 */
export function formatEstimatedWeight(grams: number): string {
  if (grams >= 1000) return `≈ ${(grams / 1000).toFixed(1)} kg`;
  return `≈ ${Math.round(grams)} g`;
}

export const QUOTE_LINE_LABELS = {
  unitPrice: 'Unit price',
  chocolateSubtotal: 'Chocolates subtotal',
  packaging: (blocks: number, perPcs: number) => `Packaging (${blocks} × ${perPcs}-pc)`,
  packagingPerBox: (boxes: number) => `Packaging (${boxes} ${boxes === 1 ? 'box' : 'boxes'})`,
  extraRibbon: 'Ribbon',
  extraSleevePrint: 'Sleeve print',
  extraGreetingCard: 'Greeting card',
  extraWaxSeal: 'Wax seal',
  extraQr: 'QR code',
  extraInsideMessage: 'Butter-paper message',
  messageBar: 'Message bar',
  weddingBar: 'Wedding bar',
  printedWrapper: 'Printed wrapper',
  designMoldFee: 'Design & mold fee',
};

/* ---------------------------------------------------------------------- */
/* Step 2 (Design it) — box-mix control, reused from the old box-size step */
/* ---------------------------------------------------------------------- */

export const STEP4_COPY = {
  piecesLabel: (n: number) => (n === 1 ? '1 piece' : `${n} pieces`),
  centerBarPiecesLabel: (n: number) =>
    n === 1 ? `1 piece + your message bar in the center` : `${n} pieces + your message bar in the center`,
  centerBarNote: 'Our signature box — assorted chocolates around one large embossed message bar.',
  boxMixTitle: 'How should the box be mixed?',
  boxMixSingleTitle: 'All one chocolate',
  boxMixSingleBody: 'Every piece in the box matches the chocolate you chose earlier.',
  boxMixMixedTitle: MIXED_CHOCOLATE_LABEL,
  boxMixMixedBody: 'Pieces alternate milk and semi-dark, for a classic assorted look.',
  boxMixChosenCta: 'Chosen',
  boxMixChooseCta: 'Choose',
};

/* ---------------------------------------------------------------------- */
/* Step 3 (Finishing touches) — wrapped/unwrapped choice, shared by both  */
/* the loose and boxed packaging types.                                   */
/* ---------------------------------------------------------------------- */

export const STEP3_WRAPPED_COPY = {
  looseWrappedTitle: 'Foil-wrapped',
  looseWrappedBody: 'Each piece individually wrapped in a foil finish.',
  looseUnwrappedTitle: 'Unwrapped',
  looseUnwrappedBody: 'Bare chocolate, no wrapper — a quieter, minimal finish.',
  boxedWrappedTitle: 'Foil-wrapped pieces',
  boxedWrappedBody: 'Every piece in the box individually wrapped in foil.',
  boxedUnwrappedTitle: 'Bare, in paper cups',
  boxedUnwrappedBody: 'Bare chocolate pieces, set in paper cups inside the box.',
  chosenCta: 'Chosen',
  chooseCta: 'Choose',
  foilPickerTitle: 'Foil colour',
  wrappedCardLabel: 'Wrapped',
  unwrappedCardLabel: 'Unwrapped',
  // X+1 boxes: the ring pieces are moulded assorted shapes, not the
  // customer's flat canvas, so they can never be individually foil-wrapped.
  assortedRingNote: 'The assorted pieces around your message bar pack unwrapped, set in paper cups.',
};

/** Summary naming for X+1 boxes in WhatsApp / print output. */
export const packagingSummaryName = (name: string, count: number, centerBar?: boolean) =>
  centerBar ? `${name} (${count} pieces + message bar)` : name;

/* ---------------------------------------------------------------------- */
/* Center bar (X+1 boxes) & bar caption                                    */
/* ---------------------------------------------------------------------- */

export const CENTER_BAR_COPY = {
  panelTitle: 'Center bar',
  assortedNote:
    'Arrange each surrounding piece, and the center bar carries your featured mark.',
  // Wedding favour box: a single bar, no surrounding ring pieces to arrange.
  singleBarNote: 'Each favour box carries one embossed bar with your featured mark.',
  markSizeLabel: 'Mark size on the bar',
  captionLabel: 'Caption line (optional)',
  captionHint: 'Embossed beneath your mark',
  captionPlaceholder: 'e.g. Congratulations, Ayesha & Bilal',
};

/**
 * Real-world spec of the center/message bar, by packaging type — used
 * wherever a design summary needs to justify the "message bar" line with
 * its physical size (WhatsApp summary, print sheet).
 */
const CENTER_BAR_SPECS: Record<string, string> = {
  '4+1': '120 × 60 mm · 50g',
  '9+1': '85 × 85 mm · 60g',
  '16+1': '85 × 85 mm · 60g',
  // Weight unconfirmed for the wedding favour bar — omitted rather than guessed.
  'wedding-favor': '60 × 60 mm',
};

export function centerBarSpec(packagingType: string | undefined): string | undefined {
  if (!packagingType) return undefined;
  return CENTER_BAR_SPECS[packagingType];
}

/**
 * Approximate center/message bar weight in grams, by packaging type — used
 * only for the quote's estimated filled weight (never shown on its own).
 * Placeholder/estimate for 'wedding-favor', whose exact bar weight is
 * unconfirmed.
 */
const CENTER_BAR_WEIGHTS_G: Record<string, number> = {
  '4+1': 50,
  '9+1': 60,
  '16+1': 60,
  'wedding-favor': 55,
};

export function centerBarWeightG(packagingType: string | undefined): number {
  if (!packagingType) return 0;
  return CENTER_BAR_WEIGHTS_G[packagingType] ?? 0;
}

/* ---------------------------------------------------------------------- */
/* Step 3 (Finishing touches) — ribbon, box colour, extras                */
/* ---------------------------------------------------------------------- */

export const STEP6_COPY = {
  ribbonTitle: 'Ribbon',
  ribbonNone: 'No ribbon',
  ribbonNames: {
    black: 'Classic Black',
    purple: 'Royal Purple',
    white: 'Ivory White',
  } as Record<string, string>,
  foilTitle: 'Foil wrap',
  foilNote: 'Wraps your individual piece in a foil finish.',
  foilNames: {
    silver: 'Silver',
    gold: 'Gold',
  } as Record<string, string>,
  foilPreviewLabel: 'Foil wrap preview',
  boxColourTitle: 'Box colour',
  boxColourNames: {
    choco: 'Deep Chocolate',
    ivory: 'Ivory',
    gold: 'Gold',
  } as Record<string, string>,
  sleeveToggleLabel: 'Printed sleeve',
  sleeveToggleBody: 'A branded paper sleeve wrapped around the box.',
  greetingCardToggleLabel: 'Greeting card',
  greetingCardToggleBody: 'A matching card tucked inside the box.',
  waxSealToggleLabel: 'Wax seal',
  waxSealToggleBody: 'A pressed wax seal finishing the ribbon.',
  insideMessageTitle: 'Personal message',
  // Butter paper is the medium for bare/unwrapped pieces; when pieces are
  // foil-wrapped, the message moves to the printed sleeve instead — the
  // field itself stays, only the helper copy changes to say where it lands.
  insideMessageBareNote: 'Printed on butter paper, placed inside the box.',
  insideMessageWrappedNote: "Pieces are foil-wrapped, so this prints on the sleeve instead of butter paper.",
  insideMessagePlaceholder: 'Write a short note to go inside the box…',
  insideMessageCounter: (used: number, max: number) => `${used} / ${max}`,
  printedWrapperToggleLabel: 'Printed wrapper',
  printedWrapperToggleBody:
    'A printed paper wrapper around your chocolate — it can carry a full-colour image and its own message, separate from the embossed mark.',
  printedWrapperFrontLabel: 'Front',
  printedWrapperBackLabel: 'Back',
  printedWrapperImageLabel: 'Wrapper image (full colour, optional)',
  printedWrapperImageCta: 'Upload image',
  printedWrapperImageReplaceCta: 'Replace image',
  printedWrapperImageRemoveCta: 'Remove image',
  printedWrapperScaleLabel: 'Image size',
  printedWrapperMessageLabel: 'Wrapper message (optional)',
  printedWrapperMessagePlaceholder: 'e.g. Thank you for celebrating with us',
  qrTitle: 'QR code',
  qrPlaceholder: 'https://your-link.com',
  qrNote: 'Printed on the sleeve.',
  qrInvalid: 'Please enter a valid https:// link.',
};

export const PRINT_SHEET_COPY = {
  brand: 'Crafty Chocolates',
  tagline: 'Your Idea, In Cocoa',
  quoteTitle: 'Design Studio Quote',
  dateLabel: 'Date',
  productLabel: 'Product',
  quantityLabel: 'Quantity',
  contactWhatsApp: 'WhatsApp',
  contactPhone: 'Phone',
  contactWeb: 'craftychocolates.com',
  footerNote: 'This is an indicative quote generated by the Crafty Chocolates Design Studio.',
};

/* ---------------------------------------------------------------------- */
/* Save / share / load — added by the save-and-share implementation work  */
/* ---------------------------------------------------------------------- */

export const SAVE_SHARE_COPY = {
  saving: 'Saving your design…',
  savedTitle: 'Design saved',
  savedCloudBody: 'Your design is saved. Share this link anytime to pick up where you left off.',
  savedLocalBody:
    'Saved on this device only. This link will only work in this browser, since we couldn’t reach our servers.',
  copyLink: 'Copy link',
  copied: 'Copied',
  saveError: 'We couldn’t save your design right now. Please try again.',
  designTooLarge: 'This design is too large to save. Try simplifying your logo or message.',
  loadingDesign: 'Loading your saved design…',
  loadError: 'We couldn’t find that saved design. Starting a new one.',
};
