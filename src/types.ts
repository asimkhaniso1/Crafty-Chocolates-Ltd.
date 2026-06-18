/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  image: string;
  gallery: string[];
  category: string;     // Ready to Ship | Custom | Homeware
  format: string;       // Bars | Boxes | Bites | Blocks | Pantry | Homeware | Other
  events: string[];     // Eid, Ramadan, Wedding, Birthday, ...
  productType: string[];
  tags: string[];
  chocolateType: string[];
  flavour: string[];
  fillings: string[];
  certifications: string[];
  pieceCount: string | number | null;
  packageWeight: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
