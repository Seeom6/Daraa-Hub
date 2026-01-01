/**
 * Offers Module - TypeScript Types
 * All type definitions for the offers system
 */

// ============================================================================
// Enums
// ============================================================================

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum OfferStatus {
  ACTIVE = 'active',
  UPCOMING = 'upcoming',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

// ============================================================================
// Populated Types
// ============================================================================

/**
 * Store info (populated from storeId)
 */
export interface PopulatedStore {
  _id: string;
  storeName: string;
  storeDescription?: string;
}

/**
 * Product info (populated from applicableProducts)
 */
export interface PopulatedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  mainImage?: string;
}

// ============================================================================
// Main Offer Interface
// ============================================================================

/**
 * Offer interface
 * Note: storeId and applicableProducts can be populated or just IDs
 */
export interface Offer {
  _id: string;
  storeId: string | PopulatedStore;
  title: string;
  description?: string;
  image?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  applicableProducts: (string | PopulatedProduct)[];
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  viewCount: number;
  usageCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================================================
// DTOs
// ============================================================================

export interface CreateOfferDto {
  title: string;
  description?: string;
  image?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  applicableProducts?: string[];
  startDate: Date | string;
  endDate: Date | string;
  isActive?: boolean;
}

export interface UpdateOfferDto extends Partial<CreateOfferDto> {}

export interface OfferFilters {
  search?: string;
  discountType?: DiscountType;
  isActive?: boolean;
  currentOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Analytics
// ============================================================================

export interface OfferAnalytics {
  viewCount: number;
  usageCount: number;
  conversionRate: number;
}

// ============================================================================
// Form Data
// ============================================================================

export interface OfferFormData {
  // Step 1: Basic Info
  title: string;
  description: string;
  image: File | null;

  // Step 2: Discount
  discountType: DiscountType;
  discountValue: string;
  minPurchaseAmount: string;
  maxDiscountAmount: string;

  // Step 3: Products
  applyToAllProducts: boolean;
  selectedProducts: string[];

  // Step 4: Schedule
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// ============================================================================
// Helper Types
// ============================================================================

export type OfferWithPopulatedStore = Omit<Offer, 'storeId'> & {
  storeId: PopulatedStore;
};

export type OfferWithPopulatedProducts = Omit<Offer, 'applicableProducts'> & {
  applicableProducts: PopulatedProduct[];
};

export type OfferFullyPopulated = Omit<Offer, 'storeId' | 'applicableProducts'> & {
  storeId: PopulatedStore;
  applicableProducts: PopulatedProduct[];
};

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

