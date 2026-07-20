import type { PackagingOption } from '../types';

/**
 * The X+1 signature boxes lead the list: N assorted molded pieces arranged in
 * a ring around one large embossed message bar (8.5 × 8.5 × 0.5 cm, 60g).
 * The surrounding pieces come from the assorted collection and are not
 * individually customizable — only the center bar carries the customer's mark.
 *
 * `grid` on X+1 options describes the surrounding-piece layout for the drawn
 * preview fallback only; no per-cell assignments are created for them.
 */
export const PACKAGING_OPTIONS: PackagingOption[] = [
  {
    type: '4+1',
    name: '4+1 Box',
    count: 4,
    grid: { rows: 2, cols: 2 },
    occasions: ['birthday', 'corporate'],
    centerBar: true,
    photo: '/products/ai_golden_4plus1.png',
    overlay: { x: 27.5, y: 38.3, w: 49, h: 25.3 },
  },
  {
    type: '9+1',
    name: '9+1 Box',
    count: 9,
    grid: { rows: 3, cols: 3 },
    occasions: ['wedding', 'eid', 'birthday'],
    centerBar: true,
  },
  {
    type: '16+1',
    name: '16+1 Box',
    count: 16,
    grid: { rows: 4, cols: 4 },
    occasions: ['corporate', 'wedding', 'eid'],
    centerBar: true,
    photo: '/products/chrismas-01.jpg',
    overlay: { x: 39.6, y: 32.3, w: 23.5, h: 37.4 },
  },
  { type: 'individual', name: 'Individual Wrapper', count: 1, grid: null, occasions: [] },
  { type: 'box-2', name: 'Box of 2', count: 2, grid: { rows: 1, cols: 2 }, occasions: [] },
  { type: 'box-4', name: 'Box of 4', count: 4, grid: { rows: 2, cols: 2 }, occasions: ['birthday'] },
  { type: 'box-6', name: 'Box of 6', count: 6, grid: { rows: 2, cols: 3 }, occasions: ['birthday'] },
  { type: 'box-9', name: 'Box of 9', count: 9, grid: { rows: 3, cols: 3 }, occasions: ['eid'] },
  { type: 'box-12', name: 'Box of 12', count: 12, grid: { rows: 3, cols: 4 }, occasions: ['eid', 'wedding'] },
  { type: 'box-16', name: 'Box of 16', count: 16, grid: { rows: 4, cols: 4 }, occasions: ['corporate'] },
  { type: 'box-24', name: 'Box of 24', count: 24, grid: { rows: 4, cols: 6 }, occasions: ['corporate', 'wedding'] },
  { type: 'box-36', name: 'Box of 36', count: 36, grid: { rows: 6, cols: 6 }, occasions: ['corporate', 'wedding'] },
];

export function getPackagingOption(type: string): PackagingOption | undefined {
  return PACKAGING_OPTIONS.find(p => p.type === type);
}
