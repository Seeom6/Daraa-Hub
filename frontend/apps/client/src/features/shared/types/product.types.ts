/**
 * Product Types
 * Based on backend Product schema
 */

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum ProductUnit {
  PIECE = 'piece', // قطعة
  KG = 'kg', // كيلوغرام
  GRAM = 'gram', // غرام
  METER = 'meter', // متر
  LITER = 'liter', // لتر
  BOX = 'box', // صندوق
  PACK = 'pack', // علبة
}

export interface Product {
  _id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number; // Original price for discounts
  pointsPrice?: number; // Price in loyalty points
  costPrice?: number;
  unit: ProductUnit;
  unitValue: number;
  images: string[];
  mainImage?: string;
  tags: string[];
  specifications: Record<string, string>;
  hasVariants: boolean;
  status: ProductStatus;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  store?: {
    _id: string;
    storeName: string;
    storeLogo?: string;
    rating?: number;
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  inventory?: {
    stock: number;
    lowStockThreshold: number;
  };
  variants?: ProductVariant[];
}

export interface ProductVariant {
  _id: string;
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  pointsPrice?: number;
  costPrice?: number;
  images: string[];
  options: Record<string, string>;
  isActive: boolean;
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  categoryId?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  isFeatured?: boolean;
  status?: ProductStatus;
  search?: string;
  tags?: string[];
  sortBy?: 'price' | 'rating' | 'soldCount' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Cart Item Type
export interface CartItem {
  productId: string;
  variantId?: string;
  storeId: string;
  quantity: number;
  price: number;
  pointsPrice?: number;
  selectedOptions?: Record<string, string>;
  
  // Populated fields
  product?: Product;
  variant?: ProductVariant;
}

// Wishlist Item Type
export interface WishlistItem {
  productId: string;
  addedAt: string;
  product?: Product;
}

