/**
 * Form Types
 * Types for form data
 */

import type { BusinessHours } from './settings.types';

// ===== Store Setup Form =====

export interface StoreSetupFormData {
  // Step 1: Store Information
  storeName: string;
  storeDescription: string;
  storeLogo?: File;
  storeBanner?: File;
  primaryCategory: string;
  storeCategories: string[];

  // Step 2: Business Information
  businessName: string;
  businessType: string;
  businessAddress: string;
  city: string;
  businessPhone: string;
  taxId?: string;
  commercialRegister?: string;

  // Step 3: Personal Information
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  address: string;

  // Step 3: Documents
  nationalIdDocument?: File;
  commercialRegisterDocument?: File;
  taxCertificateDocument?: File;

  additionalNotes?: string;
}

// ===== Product Form =====

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  images: File[];
  variants: ProductVariantFormData[];
  tags: string[];
  isActive: boolean;
}

export interface ProductVariantFormData {
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributes: { key: string; value: string }[];
}

// ===== Settings Form =====

export interface StoreSettingsFormData {
  // Business Hours
  businessHours: BusinessHours[];

  // Shipping
  defaultShippingFee: number;
  freeShippingThreshold: number;

  // Payment
  allowCashOnDelivery: boolean;

  // Orders
  minOrderAmount: number;
  orderCancellationPeriod: number;

  // Returns
  returnPeriod: number;
  allowReturns: boolean;
  returnPolicy?: string;

  // Notifications
  notifyOnNewOrder: boolean;
  notifyOnLowStock: boolean;
  notifyOnReview: boolean;

  // Social Media
  facebookUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
}

