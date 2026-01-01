/**
 * Home Page Types
 */

import { Product } from './product.types';
import { Category } from './category.types';

// Banner Types
export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  banners: Banner[];
  total: number;
}

// Flash Deal Types
export interface FlashDeal {
  _id: string;
  title: string;
  description?: string;
  products: Product[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlashDealsResponse {
  deals: FlashDeal[];
  total: number;
}

// Store Types (for Top Stores section)
export interface Store {
  _id: string;
  accountId: string;
  storeName: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoresResponse {
  stores: Store[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Home Data Response (combined)
export interface HomeDataResponse {
  banners: Banner[];
  featuredProducts: Product[];
  flashDeals?: FlashDeal;
  newArrivals: Product[];
  topStores: Store[];
  categories: Category[];
}

