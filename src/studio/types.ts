/**
 * Shared contract for the Chocolate Design Studio.
 * Downstream agents (steps, preview, pricing) build on these types.
 */

export type ProductKey = 'bite' | 'signature' | 'bar' | 'custom';
export type ChocolateType = 'milk' | 'dark' | 'semidark';
/** The studio only ever produces an emboss finish; kept as a literal union for forward-compat. */
export type EmbossStyle = 'emboss';
export type CellContent = 'logo' | 'message' | 'initials' | 'pattern';

export interface LogoState {
  maskDataUrl: string;
  originalName: string;
  scale: number;
  warnings: string[];
}

export interface CellAssignment {
  index: number;
  content: CellContent;
  chocolate: ChocolateType;
  text?: string;
}

export interface PackagingSelection {
  type: string;
  count: number;
}

export interface PrintedWrapper {
  enabled: true;
  /** Full-colour artwork, downscaled to a compact data URL. */
  imageDataUrl?: string;
  message?: string;
}

export interface DesignExtras {
  ribbon?: string;
  foil?: 'silver' | 'gold';
  boxColour?: string;
  sleevePrint?: boolean;
  /** Personal message, printed on butter paper placed inside the box. */
  insideMessage?: string;
  greetingCard?: boolean;
  qrUrl?: string;
  waxSeal?: boolean;
  /** Printed paper wrapper around the piece (bars and loose packs). */
  printedWrapper?: PrintedWrapper;
}

export interface Design {
  v: 1;
  product: ProductKey | null;
  chocolate: ChocolateType;
  logo: LogoState | null;
  emboss: EmbossStyle;
  packaging: PackagingSelection | null;
  cells: CellAssignment[];
  extras: DesignExtras;
  quantity: number;
  /** Optional caption embossed beneath the mark on bar faces. */
  barCaption?: string;
  /** Mark scale on the X+1 center bar (0.5–1.4, default 1). */
  centerBarScale?: number;
}

export type StudioStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PricingRule {
  rule_key: string;
  kind:
    | 'base_unit'
    | 'addon_unit'
    | 'packaging'
    | 'moq'
    | 'qty_tier'
    | 'mold_fee'
    | 'artwork_fee'
    | 'lead_time'
    | 'delivery';
  value: number;
  meta: Record<string, unknown>;
}

export interface QuoteLine {
  label: string;
  amount: number;
}

export interface Quote {
  unit: number;
  subtotal: number;
  fees: QuoteLine[];
  total: number;
  moq: number;
  leadDays: number;
  deliveryDays: number;
  lines: QuoteLine[];
}

export interface StudioProduct {
  key: ProductKey;
  name: string;
  tagline: string;
  weightG: number;
  dims: string;
  shape: 'square' | 'rectangle' | 'custom';
  /** Thickness of the piece, in millimetres (all bars are 5mm except logo bites). */
  thicknessMm?: number;
}

/** Percentage rect (0–100) of the customizable center-bar area within a box photo. */
export interface PhotoOverlayRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PackagingOption {
  type: string;
  name: string;
  count: number;
  grid: { rows: number; cols: number } | null;
  occasions: string[];
  /** X+1 signature boxes: N individually arrangeable ring pieces around one large message bar. */
  centerBar?: true;
  /** Real product photo used as the box preview, when available. */
  photo?: string;
  /** Where the customer's center bar sits within the photo. */
  overlay?: PhotoOverlayRect;
}
