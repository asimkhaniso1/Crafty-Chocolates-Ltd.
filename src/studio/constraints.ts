/**
 * Numeric constraints for the Chocolate Design Studio.
 * Confidentiality: never mention the mold fabrication method or material,
 * or sheet-size names, anywhere in public copy. Size limits stay numeric.
 */
import type { ProductKey } from './types';

// Maximum in-house mold size, in millimetres.
export const MAX_MOLD_MM = { w: 280, h: 190 };

// Maximum accepted upload size for logo/artwork files, in bytes (5MB).
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Maximum dimension (px) for the generated logo mask, on the longest side.
// Raised from 512 so the mark stays crisp when the preview scales it up on
// large previews/print sheets; the mask is still always scaled DOWN into
// on-screen SVG image elements, never up.
export const MAX_MASK_PX = 1024;

// If a mask rendered at MAX_MASK_PX produces a data URL heavier than this,
// fall back to progressively smaller sizes (see MASK_FALLBACK_SIZES) to stay
// well under MAX_DESIGN_JSON_BYTES. Only complex, high-detail artwork should
// ever trip this.
export const MASK_DATA_URL_SOFT_LIMIT_BYTES = 180_000;

// Fallback sizes tried in order, largest first, once MASK_DATA_URL_SOFT_LIMIT_BYTES
// is exceeded at MAX_MASK_PX.
export const MASK_FALLBACK_SIZES = [768, 512];

// Minimum order quantity per product line. The studio is built around bulk
// custom orders, so every line clamps at the same floor.
export const MOQ_DEFAULTS: Record<ProductKey, number> = {
  bite: 50,
  signature: 50,
  bar: 50,
  slim: 50,
  custom: 50,
};

// Maximum serialized size of a saved Design JSON blob, in bytes.
// A design may carry two images (mark mask + printed-wrapper artwork).
export const MAX_DESIGN_JSON_BYTES = 300_000;

// Center bar caption (embossed beneath the mark), in characters.
export const BAR_CAPTION_MAX = 40;

// Printed wrapper message, in characters.
export const WRAPPER_MESSAGE_MAX = 60;

// Mark scale range shared by the Step 3 slider and the center-bar slider.
export const MARK_SCALE_MIN = 0.5;
export const MARK_SCALE_MAX = 1.4;

// Printed wrapper image scale range (Step 6 "Image size" slider).
export const WRAPPER_SCALE_MIN = 0.5;
export const WRAPPER_SCALE_MAX = 1.5;
