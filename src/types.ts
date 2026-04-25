/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: 'Classic' | 'Bespoke' | 'Seasonal';
}

export interface CartItem {
  product: Product;
  quantity: number;
}
