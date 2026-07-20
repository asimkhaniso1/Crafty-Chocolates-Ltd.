/**
 * Shared contract for the Chocolate Design Studio.
 * Downstream agents (steps, preview, pricing) build on these types.
 */

export type ProductKey = 'bite' | 'signature' | 'bar' | 'custom';
export type ChocolateType = 'milk' | 'dark' | 'white' | 'mixed';
export type EmbossStyle = 'emboss' | 'deboss' | 'gold' | 'silver';
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

export interface DesignExtras {
  ribbon?: string;
  foil?: 'silver' | 'gold';
  boxColour?: string;
  sleevePrint?: boolean;
  insideMessage?: string;
  greetingCard?: boolean;
  qrUrl?: string;
  waxSeal?: boolean;
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
}

export type StudioStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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

export interface PackagingOption {
  type: string;
  name: string;
  count: number;
  grid: { rows: number; cols: number } | null;
  premium: boolean;
  occasions: string[];
}
