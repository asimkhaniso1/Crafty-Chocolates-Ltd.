import type { StudioProduct } from '../types';
import { PRODUCT_CARD_COPY } from '../copy';

export const STUDIO_PRODUCTS: StudioProduct[] = [
  {
    key: 'bite',
    name: 'Crafty Bite',
    tagline: PRODUCT_CARD_COPY.bite.blurb,
    weightG: 10,
    dims: '30 × 30 mm',
    shape: 'square',
  },
  {
    key: 'signature',
    name: 'Crafty Signature',
    tagline: PRODUCT_CARD_COPY.signature.blurb,
    weightG: 25,
    dims: '45 × 45 mm',
    shape: 'square',
    thicknessMm: 5,
  },
  {
    key: 'bar',
    name: 'Crafty Bar',
    tagline: PRODUCT_CARD_COPY.bar.blurb,
    weightG: 50,
    dims: '100 × 50 mm',
    shape: 'rectangle',
    thicknessMm: 5,
  },
  {
    key: 'custom',
    name: 'Crafty Custom',
    tagline: PRODUCT_CARD_COPY.custom.blurb,
    weightG: 0,
    dims: 'Bespoke',
    shape: 'custom',
  },
];

export function getStudioProduct(key: string): StudioProduct | undefined {
  return STUDIO_PRODUCTS.find(p => p.key === key);
}
