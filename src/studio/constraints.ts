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
export const MAX_MASK_PX = 512;

// Minimum order quantity per product line.
export const MOQ_DEFAULTS: Record<ProductKey, number> = {
  bite: 50,
  signature: 30,
  bar: 20,
  custom: 100,
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
