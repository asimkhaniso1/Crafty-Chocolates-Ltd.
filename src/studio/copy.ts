/**
 * All user-facing strings for the Chocolate Design Studio live here.
 *
 * Confidentiality: never mention the mold fabrication method or material,
 * or sheet-size names, anywhere in public copy.
 */

export const STUDIO_TITLE = 'The Design Studio';
export const STUDIO_SUBTITLE =
  "Build a piece that's entirely yours, from the first swatch to the final ribbon.";

export const STEP_TITLES: Record<number, string> = {
  1: 'Choose your canvas',
  2: 'Choose your chocolate',
  3: 'Add your mark',
  4: 'Choose your packaging',
  5: 'Arrange your box',
  6: 'Finishing touches',
  7: 'Your quote',
};

export const STEP_SUBTITLES: Record<number, string> = {
  1: 'Every design begins with a shape. Pick the piece that carries your story.',
  2: 'Milk, dark, or semi-dark — the base of everything to come.',
  3: 'Upload a logo, a monogram, or a message. We translate it into a mark on chocolate.',
  4: 'From a single wrapped piece to a signature box, choose how it arrives.',
  5: 'Assign a chocolate and a mark to every cell in your box.',
  6: 'Ribbon, sleeve, a note inside — the small details that make it a gift.',
  7: 'Here is your bespoke quote, ready to save, download, or send.',
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
  custom: { blurb: 'A fully bespoke shape, designed with our studio team.' },
};

export const CHOCOLATE_NAMES: Record<string, string> = {
  milk: 'Milk',
  dark: 'Dark',
  semidark: 'Semi-Dark',
};

export const CHOCOLATE_DESCRIPTIONS: Record<string, string> = {
  milk: 'Smooth, warm, and universally loved.',
  dark: 'Rich and refined, for the discerning palate.',
  semidark: 'A balanced middle ground, mellow with a little edge.',
};

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
/* Step 3 (Add your mark) — added by the logo processing / mark step work */
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
// Step 8 — Quote copy (added by pricing/quote implementation)
// ---------------------------------------------------------------------------

export const QUOTE_COPY = {
  quantityLabel: 'Quantity',
  quantityPresetsLabel: 'Quick picks',
  moqNote: (moq: number) => `Minimum order quantity for this piece is ${moq}.`,
  moqClampNote: (moq: number) =>
    `Your quantity is below the minimum order of ${moq}. Your quote reflects ${moq} pieces.`,
  breakdownTitle: 'Your breakdown',
  totalLabel: 'Total quote',
  moqChipLabel: 'MOQ',
  leadChipLabel: 'Lead time',
  deliveryChipLabel: 'Est. delivery',
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

export const QUOTE_LINE_LABELS = {
  unitPrice: 'Unit price',
  chocolateSubtotal: 'Chocolates subtotal',
  packaging: (blocks: number, perPcs: number) => `Packaging (${blocks} × ${perPcs}-pc)`,
  extraRibbon: 'Ribbon',
  extraSleevePrint: 'Sleeve print',
  extraGreetingCard: 'Greeting card',
  extraWaxSeal: 'Wax seal',
  extraQr: 'QR code',
  extraInsideMessage: 'Butter-paper message',
  messageBar: 'Message bar',
  printedWrapper: 'Printed wrapper',
  designMoldFee: 'Design & mold fee',
};

/* ---------------------------------------------------------------------- */
/* Step 5 (Choose your packaging) — added by packaging/arrange/extras work */
/* ---------------------------------------------------------------------- */

export const STEP4_COPY = {
  filterAll: 'All',
  piecesLabel: (n: number) => (n === 1 ? '1 piece' : `${n} pieces`),
  centerBarPiecesLabel: (n: number) => `${n} pieces + your message bar in the center`,
  centerBarNote: 'Our signature box — assorted chocolates around one large embossed message bar.',
  individualNote: "You'll choose a foil colour for the wrapper in a later step.",
  selectCta: 'Select',
  selectedCta: 'Selected',
};

/** Summary naming for X+1 boxes in WhatsApp / print output. */
export const packagingSummaryName = (name: string, count: number, centerBar?: boolean) =>
  centerBar ? `${name} (${count} pieces + message bar)` : name;

/* ---------------------------------------------------------------------- */
/* Step 5 (Arrange your box) — added by packaging/arrange/extras work */
/* ---------------------------------------------------------------------- */

export const STEP5_COPY = {
  emptyTitle: 'Pick your packaging first',
  emptyBody: 'Choose how your chocolates arrive, then come back to arrange each piece.',
  emptyCta: 'Choose packaging',
  singleTitle: 'A single, wrapped piece',
  singleBody:
    'Arrangement applies to boxes of more than one piece. Your single wrapped chocolate carries the mark and finish you already chose.',
  bulkAllLogo: 'All logo',
  bulkAlternate: 'Alternate milk / dark',
  bulkFillFirst: 'Fill like first cell',
  panelTitle: (index: number) => `Piece ${index + 1}`,
  panelContentLabel: 'Content',
  panelChocolateLabel: 'Chocolate',
  panelTextLabel: 'Text',
  panelMessagePlaceholder: 'Made with love',
  panelInitialsPlaceholder: 'AB',
  doneCta: 'Done',
  hintLabel: 'Tap a piece to edit it',
  contentLabels: {
    logo: 'Logo',
    message: 'Message',
    initials: 'Initials',
    pattern: 'Pattern',
  } as Record<string, string>,
  chocolateLabels: {
    milk: 'Milk',
    dark: 'Dark',
    semidark: 'Semi-Dark',
  } as Record<string, string>,
};

/* ---------------------------------------------------------------------- */
/* Center bar (X+1 boxes) & bar caption                                    */
/* ---------------------------------------------------------------------- */

export const CENTER_BAR_COPY = {
  panelTitle: 'Center bar',
  assortedNote:
    'Arrange each surrounding piece, and the center bar carries your featured mark.',
  markSizeLabel: 'Mark size on the bar',
  captionLabel: 'Caption line (optional)',
  captionHint: 'Embossed beneath your mark',
  captionPlaceholder: 'e.g. Congratulations, Ayesha & Bilal',
};

/* ---------------------------------------------------------------------- */
/* Step 6 (Finishing touches) — added by packaging/arrange/extras work */
/* ---------------------------------------------------------------------- */

export const STEP6_COPY = {
  loosePackNote:
    'Individually foil-wrapped, packed loose — ready for your own presentation.',
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
  insideMessageTitle: 'Personal message — printed on butter paper inside the box',
  insideMessagePlaceholder: 'Write a short note to go inside the box…',
  insideMessageCounter: (used: number, max: number) => `${used} / ${max}`,
  printedWrapperToggleLabel: 'Printed wrapper',
  printedWrapperToggleBody:
    'A printed paper wrapper around your chocolate — it can carry a full-colour image and its own message, separate from the embossed mark.',
  printedWrapperImageLabel: 'Wrapper image (full colour, optional)',
  printedWrapperImageCta: 'Upload image',
  printedWrapperImageReplaceCta: 'Replace image',
  printedWrapperImageRemoveCta: 'Remove image',
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
