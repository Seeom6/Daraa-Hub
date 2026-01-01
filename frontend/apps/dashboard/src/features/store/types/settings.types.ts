/**
 * Settings Types
 * Types for store settings and configuration
 */

export interface StoreSettings {
  _id: string;
  storeId: string;
  
  // Business Hours
  businessHours: BusinessHours[];
  
  // Shipping
  shippingZones: ShippingZone[];
  defaultShippingFee: number;
  freeShippingThreshold: number;
  
  // Payment Methods
  paymentMethods: StorePaymentMethod[];
  
  // Order Settings
  minOrderAmount: number;
  maxOrderAmount: number;
  allowCashOnDelivery: boolean;
  orderCancellationPeriod: number;
  
  // Return & Refund
  returnPeriod: number;
  allowReturns: boolean;
  returnPolicy?: string;
  refundPolicy?: string;
  
  // Policies
  termsAndConditions?: string;
  privacyPolicy?: string;
  shippingPolicy?: string;
  
  // Notifications
  notifyOnNewOrder: boolean;
  notifyOnLowStock: boolean;
  notifyOnReview: boolean;
  
  // Tax
  taxRate: number;
  includeTaxInPrice: boolean;
  
  // Points & Rewards
  enablePointsSystem: boolean;
  pointsPerCurrency: number;
  pointsRedemptionRate: number;
  
  // Social Media
  facebookUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  telegramUrl?: string;
  
  // Status
  isActive: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  day: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface ShippingZone {
  name: string;
  cities: string[];
  shippingFee: number;
  freeShippingThreshold?: number;
  estimatedDays: number;
}

export interface StorePaymentMethod {
  method: 'cash_on_delivery' | 'bank_transfer' | 'online_payment';
  isEnabled: boolean;
  details?: string;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  type: PlanType;
  description?: string;
  priceUSD: number;
  priceSYP: number;
  durationDays: number;
  features: PlanFeatures;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PlanType = 'basic' | 'standard' | 'premium';

export interface PlanFeatures {
  dailyProductLimit: number;
  maxImagesPerProduct: number;
  maxVariantsPerProduct: number;
  prioritySupport: boolean;
  analyticsAccess: boolean;
  customDomain: boolean;
}

