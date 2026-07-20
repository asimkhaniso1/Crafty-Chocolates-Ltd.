import type { PackagingOption } from '../types';

/**
 * The X+1 signature boxes lead the list: N individually arrangeable ring
 * pieces around one large embossed message bar (8.5 × 8.5 × 0.5 cm, 60g).
 * Each ring piece can carry its own content/chocolate, same as a standard
 * box; the center bar carries the customer's featured mark separately.
 *
 * `grid` on X+1 options describes the ring layout for both the per-cell
 * arrange grid and the drawn preview fallback.
 */
export const PACKAGING_OPTIONS: PackagingOption[] = [
  {
    type: '4+1',
    name: '4+1 Box',
    count: 4,
    grid: { rows: 2, cols: 2 },
    occasions: ['birthday', 'corporate'],
    centerBar: true,
    centerBarShape: 'rectangle',
    photo: '/studio/box-4p1.webp',
    overlay: { x: 24.2, y: 38.1, w: 52, h: 22.9 },
  },
  {
    type: '9+1',
    name: '9+1 Box',
    count: 9,
    grid: { rows: 3, cols: 3 },
    occasions: ['wedding', 'eid', 'birthday'],
    centerBar: true,
    centerBarShape: 'square',
    photo: '/studio/box-9p1.webp',
    overlay: { x: 38, y: 38.4, w: 23.8, h: 23.8 },
  },
  {
    type: '16+1',
    name: '16+1 Box',
    count: 16,
    grid: { rows: 4, cols: 4 },
    occasions: ['corporate', 'wedding', 'eid'],
    centerBar: true,
    centerBarShape: 'square',
    photo: '/studio/box-16p1.webp',
    overlay: { x: 35.8, y: 35.9, w: 28.8, h: 27.4 },
  },
  {
    type: 'wedding-favor',
    name: 'Wedding Favour Box',
    count: 1,
    grid: null,
    occasions: ['wedding'],
    centerBar: true,
    centerBarShape: 'square',
    photo: '/studio/box-wedding.webp',
    overlay: { x: 38, y: 43.1, w: 26, h: 27.1 },
  },
  {
    type: 'tin-18',
    name: 'Tin of 18',
    count: 18,
    grid: { rows: 3, cols: 3 },
    occasions: ['corporate', 'eid', 'birthday'],
    layers: 2,
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
