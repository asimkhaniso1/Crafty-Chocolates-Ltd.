/**
 * Shared contract for the Chocolate Design Studio.
 * Downstream agents (steps, preview, pricing) build on these types.
 */

export type ProductKey = 'bite' | 'signature' | 'bar' | 'custom' | 'slim';
export type ChocolateType = 'milk' | 'semidark';
/**
 * Box-size step (multi-piece boxes only): whether every cell uses the
 * chosen chocolate ('single', the default) or cells alternate milk/
 * semi-dark ('mixed'). Additive field — undefined behaves as 'single'.
 */
export type BoxMix = 'single' | 'mixed';
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
  /** Image size within the wrapper band (0.5–1.5, default 1). */
  scale?: number;
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
  /**
   * Boxed presentation only: whether each piece inside the box is
   * individually foil-wrapped (true) or bare/in paper cups (false or
   * undefined — undefined means unspecified/bare). Loose-pack wrap status
   * is carried by `foil` alone (set = foil-wrapped, unset = unwrapped).
   */
  piecesWrapped?: boolean;
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
  /** Box-size step: whether a multi-piece box is all one chocolate or alternates milk/semi-dark. Default 'single'. */
  boxMix?: BoxMix;
  /** Optional caption embossed beneath the mark on bar faces. */
  barCaption?: string;
  /** Mark scale on the X+1 center bar (0.5–1.4, default 1). */
  centerBarScale?: number;
}

export type StudioStep = 1 | 2 | 3 | 4;

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
  /** Approximate total filled weight (pieces + center bar + empty box/tin), in grams. Always a placeholder-grade estimate. */
  estimatedWeightG?: number;
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
  /** Shape of the center bar's face; 'square' (85×85mm, 60g) unless noted. */
  centerBarShape?: 'square' | 'rectangle';
  /** Real product photo used as the box preview, when available. */
  photo?: string;
  /** Where the customer's center bar sits within the photo. */
  overlay?: PhotoOverlayRect;
  /**
   * Real product photo (non-centerBar boxes): where each grid cell's
   * chocolate sits within the photo, indexed the same as `cells`/`grid`.
   */
  cellOverlays?: PhotoOverlayRect[];
  /**
   * Number of stacked layers of `grid` cells (e.g. a two-tier tin). Total
   * cell count is still `count`; each layer holds `grid.rows * grid.cols`
   * cells, arranged and edited one layer at a time.
   */
  layers?: number;
  /** Outer box dimensions, display-ready (e.g. "15 × 6.5 × 2.5 cm"). */
  boxDims?: string;
  /**
   * Products this packaging is sized for. Omitted = available for every
   * product (used by the X+1/wedding-favour boxes, whose center bar has its
   * own fixed spec independent of the chosen canvas).
   */
  compatibleProducts?: ProductKey[];
  /** Approximate empty box/tin weight in grams, used for the quote's estimated filled weight. */
  boxEmptyWeightG?: number;
}
