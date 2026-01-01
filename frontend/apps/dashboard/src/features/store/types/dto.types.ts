/**
 * DTO Types
 * Data Transfer Objects for API requests
 */

import type { PersonalInfo, BusinessInfo, DocumentType } from './verification.types';
import type { OrderStatus, ProductVariant } from './store-owner.types';

// ===== Verification DTOs =====

export interface SubmitVerificationDto {
  applicantType: 'store_owner' | 'courier';
  personalInfo: PersonalInfo;
  businessInfo?: BusinessInfo;
  additionalNotes?: string;
}

export interface UploadDocumentDto {
  verificationRequestId: string;
  documentType: DocumentType;
  file: File;
  description?: string;
}

// ===== Store Profile DTOs =====

export interface UpdateStoreProfileDto {
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  primaryCategory?: string;
  storeCategories?: string[];
  businessAddress?: string;
  businessPhone?: string;
}

// ===== Product DTOs =====

export interface CreateProductDto {
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  images?: string[];
  variants?: ProductVariant[];
  tags?: string[];
  status?: 'active' | 'draft' | 'inactive' | 'out_of_stock';
  unit?: string;
  unitValue?: number;
  specifications?: Record<string, any>;
}

export interface UpdateProductDto extends Partial<Omit<CreateProductDto, 'storeId'>> {}

// ===== Order DTOs =====

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

// ===== Offer DTOs =====

export interface CreateOfferDto {
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  applicableProducts?: string[];
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  isActive?: boolean;
}

// ===== Filter DTOs =====

export interface ProductFilters {
  storeId?: string;
  categoryId?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: 'name' | 'price' | 'createdAt' | '-name' | '-price' | '-createdAt';
  minPrice?: number;
  maxPrice?: number;
}

export interface OrderFilters {
  storeId?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ===== Inventory DTOs =====

export interface CreateInventoryDto {
  productId: string;
  storeId: string;
  quantity: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface UpdateInventoryDto {
  quantity?: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface AddStockDto {
  quantity: number;
  reason: string;
}

export interface RemoveStockDto {
  quantity: number;
  reason: string;
}

// ===== Coupon DTOs =====

export interface CreateCouponDto {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validFrom?: Date;
  validUntil?: Date;
  usageLimit?: number;
}

export interface UpdateCouponDto extends Partial<CreateCouponDto> {}

