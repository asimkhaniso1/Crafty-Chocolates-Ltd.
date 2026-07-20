import type { PackagingOption } from '../types';

export const PACKAGING_OPTIONS: PackagingOption[] = [
  { type: 'individual', name: 'Individual Wrapper', count: 1, grid: null, premium: false, occasions: [] },
  { type: 'box-2', name: 'Box of 2', count: 2, grid: { rows: 1, cols: 2 }, premium: false, occasions: [] },
  { type: 'box-4', name: 'Box of 4', count: 4, grid: { rows: 2, cols: 2 }, premium: false, occasions: ['birthday'] },
  { type: 'box-6', name: 'Box of 6', count: 6, grid: { rows: 2, cols: 3 }, premium: false, occasions: ['birthday'] },
  { type: 'box-9', name: 'Box of 9', count: 9, grid: { rows: 3, cols: 3 }, premium: false, occasions: ['eid'] },
  { type: 'box-12', name: 'Box of 12', count: 12, grid: { rows: 3, cols: 4 }, premium: false, occasions: ['eid', 'wedding'] },
  { type: 'box-16', name: 'Box of 16', count: 16, grid: { rows: 4, cols: 4 }, premium: false, occasions: ['corporate'] },
  { type: 'box-24', name: 'Box of 24', count: 24, grid: { rows: 4, cols: 6 }, premium: false, occasions: ['corporate', 'wedding'] },
  { type: 'box-36', name: 'Box of 36', count: 36, grid: { rows: 6, cols: 6 }, premium: false, occasions: ['corporate', 'wedding'] },
  { type: 'luxury-magnetic', name: 'Luxury Magnetic Box', count: 9, grid: { rows: 3, cols: 3 }, premium: true, occasions: ['wedding', 'corporate'] },
  { type: 'drawer', name: 'Drawer Box', count: 12, grid: { rows: 3, cols: 4 }, premium: true, occasions: ['eid', 'birthday'] },
  { type: 'window', name: 'Window Box', count: 6, grid: { rows: 2, cols: 3 }, premium: true, occasions: ['birthday', 'eid'] },
  { type: 'corporate', name: 'Corporate Set', count: 16, grid: { rows: 4, cols: 4 }, premium: true, occasions: ['corporate'] },
  { type: 'wedding', name: 'Wedding Favour Box', count: 4, grid: { rows: 2, cols: 2 }, premium: true, occasions: ['wedding'] },
];

export function getPackagingOption(type: string): PackagingOption | undefined {
  return PACKAGING_OPTIONS.find(p => p.type === type);
}
