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
    assortedRing: true,
    photo: '/studio/box-4p1.webp',
    overlay: { x: 28.4, y: 47.2, w: 42.9, h: 18.8 },
    boxDims: '16 × 20 × 3 cm',
    boxEmptyWeightG: 100,
  },
  {
    type: '9+1',
    name: '9+1 Box',
    count: 9,
    grid: { rows: 3, cols: 3 },
    occasions: ['wedding', 'eid', 'birthday'],
    centerBar: true,
    centerBarShape: 'square',
    assortedRing: true,
    photo: '/studio/box-9p1.webp',
    overlay: { x: 34.5, y: 32.5, w: 31.8, h: 31.5 },
    boxDims: '11 × 11 × 5.5 cm',
    boxEmptyWeightG: 105,
  },
  {
    type: '16+1',
    name: '16+1 Box',
    count: 16,
    grid: { rows: 4, cols: 4 },
    occasions: ['corporate', 'wedding', 'eid'],
    centerBar: true,
    centerBarShape: 'square',
    assortedRing: true,
    photo: '/studio/box-16p1.webp',
    overlay: { x: 35.8, y: 35.9, w: 28.8, h: 27.4 },
    boxDims: '20 × 20 × 5.5 cm',
    boxEmptyWeightG: 145,
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
    boxEmptyWeightG: 70,
  },
  {
    type: 'tin-18',
    name: 'Tin of 18',
    count: 18,
    grid: { rows: 3, cols: 3 },
    occasions: ['corporate', 'eid', 'birthday'],
    layers: 2,
    boxDims: '11 × 11 × 5.5 cm',
    compatibleProducts: ['bite'],
    boxEmptyWeightG: 105,
  },
  {
    type: 'individual',
    name: 'Individual Wrapper',
    count: 1,
    grid: null,
    occasions: [],
    compatibleProducts: ['bite', 'signature', 'bar', 'slim'],
  },
  {
    type: 'box-6',
    name: 'Box of 6',
    count: 6,
    grid: { rows: 2, cols: 3 },
    occasions: ['birthday'],
    boxDims: '12 × 9 × 3.5 cm',
    compatibleProducts: ['bite'],
    boxEmptyWeightG: 80,
  },
  {
    type: 'box-9',
    name: 'Box of 9',
    count: 9,
    grid: { rows: 3, cols: 3 },
    occasions: ['eid'],
    boxDims: '11 × 11 × 5.5 cm',
    compatibleProducts: ['bite'],
    boxEmptyWeightG: 105,
  },
  {
    type: 'box-12',
    name: 'Box of 12',
    count: 12,
    grid: { rows: 3, cols: 4 },
    occasions: ['eid', 'wedding'],
    boxDims: '16 × 20 × 3 cm',
    compatibleProducts: ['bite'],
    boxEmptyWeightG: 100,
  },
  {
    type: 'box-3',
    name: '3-Piece Logo Box',
    count: 3,
    grid: { rows: 1, cols: 3 },
    occasions: ['corporate', 'birthday'],
    photo: '/studio/box-3.webp',
    cellOverlays: [
      { x: 15.0, y: 45.5, w: 16.5, h: 15.5 },
      { x: 39.0, y: 45.5, w: 16.5, h: 15.5 },
      { x: 62.5, y: 45.5, w: 16.5, h: 15.5 },
    ],
    // Small gold window tray. Dimensions/weight are estimates pending a spec sheet.
    boxDims: '15 × 6 × 2.5 cm',
    compatibleProducts: ['bite'],
    boxEmptyWeightG: 45,
  },
  {
    type: 'box-15',
    name: 'Tin of 15',
    count: 15,
    grid: { rows: 3, cols: 5 },
    occasions: ['eid', 'corporate', 'birthday'],
    // Rectangular purple tin. Dimensions/weight are estimates pending an
    // owner spec sheet.
    boxDims: '18 × 11 × 4 cm',
    compatibleProducts: ['bite'],
    boxEmptyWeightG: 95,
  },
  {
    type: 'box-25',
    name: 'Box of 25',
    count: 25,
    grid: { rows: 5, cols: 5 },
    occasions: ['corporate', 'wedding'],
    boxDims: '20 × 20 × 5.5 cm',
    compatibleProducts: ['bite'],
    boxEmptyWeightG: 145,
  },
  {
    type: 'box-50',
    name: 'Box of 50',
    count: 50,
    grid: { rows: 5, cols: 5 },
    occasions: ['corporate', 'wedding'],
    layers: 2,
    boxDims: '20 × 20 × 5.5 cm',
    compatibleProducts: ['bite'],
    boxEmptyWeightG: 145,
  },
];

export function getPackagingOption(type: string): PackagingOption | undefined {
  return PACKAGING_OPTIONS.find(p => p.type === type);
}
