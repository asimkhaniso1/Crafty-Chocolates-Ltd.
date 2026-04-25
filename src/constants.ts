import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Signature Sea Salt Truffle',
    price: 4.50,
    description: 'Our award-winning 70% dark chocolate truffle topped with hand-harvested sea salt.',
    image: 'product_truffles',
    category: 'Classic'
  },
  {
    id: '2',
    name: 'Botanical Relief Bar',
    price: 12.00,
    description: 'A dark chocolate bar featuring intricate custom-molded floral motifs.',
    image: 'product_dark_bar',
    category: 'Bespoke'
  },
  {
    id: '3',
    name: 'Custom Corporate Mold',
    price: 85.00,
    description: 'A unique experience: we create a custom mold for your brand or event. Includes first 5 bars.',
    image: 'custom_mold_process',
    category: 'Bespoke'
  },
  {
    id: '4',
    name: 'Gilded Autumn Pumpkin',
    price: 18.00,
    description: 'A seasonal masterpiece: white chocolate pumpkin with a spiced pumpkin ganache center, finished with edible gold leaf.',
    image: 'seasonal_pumpkin',
    category: 'Seasonal'
  }
];
