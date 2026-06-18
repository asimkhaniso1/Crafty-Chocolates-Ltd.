import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';
import type { Product } from '../types';

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number | string;
  currency: string;
  image: string;
  gallery: string[];
  category: string;
  format: string;
  events: string[];
  product_type: string[];
  tags: string[];
  chocolate_type: string[];
  flavour: string[];
  fillings: string[];
  certifications: string[];
  piece_count: string | null;
  package_weight: string | null;
  is_published: boolean;
  sort_order: number;
}

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    sku: r.sku,
    name: r.name,
    price: Number(r.price),
    currency: r.currency,
    description: r.description,
    image: r.image,
    gallery: r.gallery ?? [],
    category: r.category,
    format: r.format,
    events: r.events ?? [],
    productType: r.product_type ?? [],
    tags: r.tags ?? [],
    chocolateType: r.chocolate_type ?? [],
    flavour: r.flavour ?? [],
    fillings: r.fillings ?? [],
    certifications: r.certifications ?? [],
    pieceCount: r.piece_count,
    packageWeight: r.package_weight,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else if (data) {
        setProducts(data.map(rowToProduct));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}

// Derived metadata so filters update with live data
export function deriveFacets(products: Product[]) {
  const formats = Array.from(new Set(products.map(p => p.format)));
  const events = Array.from(new Set(products.flatMap(p => p.events))).sort();
  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  return { formats, events, categories };
}
