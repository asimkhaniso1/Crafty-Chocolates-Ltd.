/**
 * Migrates a Design that may have been saved before the product-reality
 * refactor (retired chocolate types, retired finishes, retired premium
 * packaging) into a shape the current studio understands.
 *
 * Used both when loading a shared/saved design (LOAD_DESIGN) and when
 * hydrating from localStorage on first mount.
 */
import type { CellAssignment, ChocolateType, Design, PrintedWrapper } from '../types';
import { getPackagingOption } from '../data/packagingOptions';
import {
  BAR_CAPTION_MAX,
  MARK_SCALE_MAX,
  MARK_SCALE_MIN,
  WRAPPER_MESSAGE_MAX,
} from '../constraints';

const CHOCOLATE_MIGRATIONS: Record<string, ChocolateType> = {
  white: 'milk',
  mixed: 'semidark',
};

function sanitizeChocolate(value: unknown): ChocolateType {
  const key = typeof value === 'string' ? value : '';
  if (key === 'milk' || key === 'dark' || key === 'semidark') return key;
  return CHOCOLATE_MIGRATIONS[key] ?? 'milk';
}

function sanitizeCell(cell: CellAssignment): CellAssignment {
  return { ...cell, chocolate: sanitizeChocolate(cell.chocolate) };
}

function sanitizeBarCaption(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value.slice(0, BAR_CAPTION_MAX);
}

function sanitizeCenterBarScale(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.min(MARK_SCALE_MAX, Math.max(MARK_SCALE_MIN, value));
}

function sanitizePrintedWrapper(value: unknown): PrintedWrapper | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Partial<PrintedWrapper>;
  if (raw.enabled !== true) return undefined;
  const wrapper: PrintedWrapper = { enabled: true };
  if (typeof raw.imageDataUrl === 'string' && raw.imageDataUrl.startsWith('data:image/')) {
    wrapper.imageDataUrl = raw.imageDataUrl;
  }
  if (typeof raw.message === 'string' && raw.message.trim()) {
    wrapper.message = raw.message.slice(0, WRAPPER_MESSAGE_MAX);
  }
  return wrapper;
}

export function sanitizeDesign(design: Design): Design {
  const chocolate = sanitizeChocolate(design.chocolate);
  const cells = (design.cells ?? []).map(sanitizeCell);

  // X+1 packagings ('4+1', '9+1', '16+1') are in PACKAGING_OPTIONS, so they
  // pass through here unchanged; only retired types are cleared.
  const option = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  const packagingStillExists = !design.packaging || Boolean(option);

  // X+1 boxes have per-cell ring assignments too, same as standard boxes;
  // clamp the count to the option's cell count either way.
  const clampedCells =
    packagingStillExists && option
      ? cells.filter(c => c.index < option.count)
      : packagingStillExists
        ? cells
        : [];

  return {
    ...design,
    chocolate,
    // Any legacy emboss/deboss/gold/silver value collapses to the only
    // finish the studio offers.
    emboss: 'emboss',
    cells: clampedCells,
    packaging: packagingStillExists ? design.packaging : null,
    barCaption: sanitizeBarCaption(design.barCaption),
    centerBarScale: sanitizeCenterBarScale(design.centerBarScale),
    extras: {
      ...design.extras,
      printedWrapper: sanitizePrintedWrapper(design.extras?.printedWrapper),
    },
  };
}
