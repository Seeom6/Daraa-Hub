/**
 * Product Types
 * All TypeScript interfaces and types for products feature
 */

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  categoryAr?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  images: string[];
  status: ProductStatus;
  inventory: ProductInventory;
  sales: number;
  views: number;
  variants?: ProductVariant[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductInventory {
  quantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
}

export interface ProductVariant {
  name: string;
  options: string[];
  price?: number;
}

export type ProductStatus = 'active' | 'draft' | 'out_of_stock' | 'archived';

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  barcode: string;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  trackQuantity?: boolean;
  quantity?: string;
  lowStockThreshold?: string;
}

export interface ProductFilters {
  searchQuery: string;
  status: string;
  category: string;
}

export interface ProductStats {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface ProductStep {
  id: number;
  name: string;
  icon: any;
}

