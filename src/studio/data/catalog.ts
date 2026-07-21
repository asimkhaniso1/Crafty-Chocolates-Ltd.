/**
 * Step 1 ("Choose your creation") catalog — every sellable SKU as one flat
 * gallery. THE BOX IS THE PRODUCT: picking a card is the only product
 * decision the shopper makes. Each entry fully determines the underlying
 * canvas (`product`) and packaging (`packagingType`) together, so the studio
 * never has to ask for them separately.
 *
 * `photo`/`boxDims` are pulled from the packaging data itself (single
 * source of truth for real product specs); `contentsLine` and `occasions`
 * are editorial, written for this gallery.
 */
import type { ProductKey } from '../types';
import { getPackagingOption } from './packagingOptions';

export type CatalogSection = 'signature' | 'classic' | 'loose';

export interface CatalogItem {
  key: string;
  name: string;
  photo?: string;
  /** Short line describing what's inside, in real sizes/counts. */
  contentsLine: string;
  occasions: string[];
  product: ProductKey;
  /** Omitted only for the custom-shape card, which routes to the brief step instead. */
  packagingType?: string;
  boxDims?: string;
  section: CatalogSection;
}

interface RawCatalogEntry {
  key: string;
  name: string;
  /** Gallery lifestyle shot for this card; falls back to the packaging option's compositing photo. */
  photo?: string;
  contentsLine: string;
  occasions: string[];
  product: ProductKey;
  packagingType?: string;
  section: CatalogSection;
}

const RAW_ITEMS: RawCatalogEntry[] = [
  {
    key: '4+1-box',
    name: '4+1 Box',
    photo: '/studio/card-4p1.webp',
    contentsLine: '4 bites arranged around your 120 × 60 mm message bar.',
    occasions: ['birthday', 'corporate'],
    product: 'bite',
    packagingType: '4+1',
    section: 'signature',
  },
  {
    key: '9+1-tin',
    name: '9+1 Tin',
    photo: '/studio/card-9p1.webp',
    contentsLine: '9 bites + square bar on top, in a two-tier tin.',
    occasions: ['wedding', 'eid', 'birthday'],
    product: 'bite',
    packagingType: '9+1',
    section: 'signature',
  },
  {
    key: '16+1-box',
    name: '16+1 Box',
    photo: '/studio/card-16p1.webp',
    contentsLine: '16 bites + your 85 × 85 mm message bar.',
    occasions: ['corporate', 'wedding', 'eid'],
    product: 'bite',
    packagingType: '16+1',
    section: 'signature',
  },
  {
    key: 'wedding-favor-box',
    name: 'Wedding Favour Box',
    photo: '/studio/card-wedding.webp',
    contentsLine: 'One 60 × 60 mm favour bar, individually boxed at 8 × 8 cm.',
    occasions: ['wedding'],
    product: 'signature',
    packagingType: 'wedding-favor',
    section: 'signature',
  },
  {
    key: 'tin-of-18',
    name: 'Tin of 18',
    contentsLine: '18 bites, stacked two tiers deep in an 11 × 11 cm tin.',
    occasions: ['corporate', 'eid', 'birthday'],
    product: 'bite',
    packagingType: 'tin-18',
    section: 'classic',
  },
  {
    key: 'box-of-3',
    name: '3-Piece Logo Box',
    photo: '/studio/card-3.webp',
    contentsLine: '3 bites in a row, in a gold window tray.',
    occasions: ['corporate', 'birthday'],
    product: 'bite',
    packagingType: 'box-3',
    section: 'classic',
  },
  {
    key: 'box-of-6',
    name: 'Box of 6',
    contentsLine: '6 bites in a 12 × 9 cm box.',
    occasions: ['birthday'],
    product: 'bite',
    packagingType: 'box-6',
    section: 'classic',
  },
  {
    key: 'box-of-9',
    name: 'Box of 9',
    contentsLine: '9 bites, three rows of three, in an 11 × 11 cm box.',
    occasions: ['eid'],
    product: 'bite',
    packagingType: 'box-9',
    section: 'classic',
  },
  {
    key: 'box-of-12',
    name: 'Box of 12',
    photo: '/studio/card-12.webp',
    contentsLine: '12 bites, laid flat in a 16 × 20 cm box.',
    occasions: ['eid', 'wedding'],
    product: 'bite',
    packagingType: 'box-12',
    section: 'classic',
  },
  {
    key: 'tin-of-15',
    name: 'Tin of 15',
    photo: '/studio/card-tin15.webp',
    contentsLine: '15 bites, five across and three deep, in a rectangular purple tin.',
    occasions: ['eid', 'corporate', 'birthday'],
    product: 'bite',
    packagingType: 'box-15',
    section: 'classic',
  },
  {
    key: 'box-of-25',
    name: 'Box of 25',
    photo: '/studio/card-25.webp',
    contentsLine: '25 bites, five rows of five, in a 20 × 20 cm tin.',
    occasions: ['corporate', 'wedding'],
    product: 'bite',
    packagingType: 'box-25',
    section: 'classic',
  },
  {
    key: 'box-of-50',
    name: 'Box of 50',
    photo: '/studio/card-25.webp',
    contentsLine: '50 bites, stacked two tiers deep, in a 20 × 20 cm tin.',
    occasions: ['corporate', 'wedding'],
    product: 'bite',
    packagingType: 'box-50',
    section: 'classic',
  },
  {
    key: 'foil-bites-loose',
    name: 'Foil-Wrapped Bites (loose)',
    contentsLine: 'Foil-wrapped bites, packed loose — ready for your own presentation.',
    occasions: ['corporate', 'birthday'],
    product: 'bite',
    packagingType: 'individual',
    section: 'loose',
  },
  {
    key: 'signature-loose',
    name: 'Crafty Signature (loose)',
    contentsLine: 'One 45 × 45 mm Signature piece, foil-wrapped and packed loose.',
    occasions: ['wedding', 'birthday'],
    product: 'signature',
    packagingType: 'individual',
    section: 'loose',
  },
  {
    key: 'crafty-bar',
    name: 'Crafty Bar',
    contentsLine: 'One 120 × 60 mm bar, foil-wrapped.',
    occasions: ['corporate'],
    product: 'bar',
    packagingType: 'individual',
    section: 'loose',
  },
  {
    key: 'crafty-slim',
    name: 'Crafty Slim',
    contentsLine: 'One 90 × 30 mm slim bar, foil-wrapped.',
    occasions: ['corporate'],
    product: 'slim',
    packagingType: 'individual',
    section: 'loose',
  },
  {
    key: 'custom-shape',
    name: 'Custom Shape',
    contentsLine: 'Bespoke shape and size, designed with our studio team.',
    occasions: [],
    product: 'custom',
    section: 'loose',
  },
];

export const CATALOG_ITEMS: CatalogItem[] = RAW_ITEMS.map(item => {
  const option = item.packagingType ? getPackagingOption(item.packagingType) : undefined;
  return {
    key: item.key,
    name: item.name,
    photo: item.photo ?? option?.photo,
    contentsLine: item.contentsLine,
    occasions: item.occasions,
    product: item.product,
    packagingType: item.packagingType,
    boxDims: option?.boxDims,
    section: item.section,
  };
});

export function getCatalogItem(key: string): CatalogItem | undefined {
  return CATALOG_ITEMS.find(i => i.key === key);
}
