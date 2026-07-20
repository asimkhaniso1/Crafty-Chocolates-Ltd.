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
    boxDims: '16 × 20 × 3 cm',
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
    boxDims: '11 × 11 × 5.5 cm',
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
    boxDims: '20 × 20 × 5.5 cm',
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
    boxDims: '8 × 8 × 3 cm',
  },
  {
    type: 'tin-18',
    name: 'Tin of 18',
    count: 18,
    grid: { rows: 3, cols: 3 },
    occasions: ['corporate', 'eid', 'birthday'],
    layers: 2,
    boxDims: '11 × 11 × 5.5 cm',
  },
  { type: 'individual', name: 'Individual Wrapper', count: 1, grid: null, occasions: [] },
  {
    type: 'box-2',
    name: 'Box of 2',
    count: 2,
    grid: { rows: 1, cols: 2 },
    occasions: [],
    photo: '/studio/box-2.webp',
    cellOverlays: [
      { x: 26.19, y: 37.5, w: 16.77, h: 25 },
      { x: 57.12, y: 37.5, w: 16.77, h: 25 },
    ],
    boxDims: '15 × 6.5 × 2.5 cm',
  },
  {
    type: 'duo-bars',
    name: 'Signature Duo',
    count: 2,
    grid: { rows: 1, cols: 2 },
    occasions: ['corporate', 'birthday'],
    boxDims: '12 × 9 × 3.5 cm',
  },
  { type: 'box-4', name: 'Box of 4', count: 4, grid: { rows: 2, cols: 2 }, occasions: ['birthday'], boxDims: '12 × 9 × 3.5 cm' },
  { type: 'box-6', name: 'Box of 6', count: 6, grid: { rows: 2, cols: 3 }, occasions: ['birthday'], boxDims: '12 × 9 × 3.5 cm' },
  { type: 'box-9', name: 'Box of 9', count: 9, grid: { rows: 3, cols: 3 }, occasions: ['eid'], boxDims: '11 × 11 × 5.5 cm' },
  { type: 'box-12', name: 'Box of 12', count: 12, grid: { rows: 3, cols: 4 }, occasions: ['eid', 'wedding'], boxDims: '16 × 20 × 3 cm' },
  { type: 'box-25', name: 'Box of 25', count: 25, grid: { rows: 5, cols: 5 }, occasions: ['corporate', 'wedding'], boxDims: '20 × 20 × 5.5 cm' },
  {
    type: 'box-50',
    name: 'Box of 50',
    count: 50,
    grid: { rows: 5, cols: 5 },
    occasions: ['corporate', 'wedding'],
    layers: 2,
    boxDims: '20 × 20 × 5.5 cm',
  },
];

export function getPackagingOption(type: string): PackagingOption | undefined {
  return PACKAGING_OPTIONS.find(p => p.type === type);
}
