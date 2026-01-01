/**
 * Offers Calculations Utilities
 * Helper functions for offer calculations and formatting
 */

import type { Offer, PopulatedStore, PopulatedProduct, OfferStatus } from '../types';

/**
 * Calculate discount amount for a given price
 */
export function calculateDiscount(
  price: number,
  offer: Offer
): {
  discountAmount: number;
  finalPrice: number;
  savedAmount: number;
} {
  let discountAmount = 0;

  if (offer.discountType === 'percentage') {
    discountAmount = (price * offer.discountValue) / 100;

    // Apply max discount cap if exists
    if (offer.maxDiscountAmount && discountAmount > offer.maxDiscountAmount) {
      discountAmount = offer.maxDiscountAmount;
    }
  } else if (offer.discountType === 'fixed') {
    discountAmount = offer.discountValue;

    // Discount cannot exceed price
    if (discountAmount > price) {
      discountAmount = price;
    }
  }

  const finalPrice = price - discountAmount;

  return {
    discountAmount,
    finalPrice,
    savedAmount: discountAmount,
  };
}

/**
 * Check if offer is currently active
 */
export function isOfferActive(offer: Offer): boolean {
  if (!offer.isActive) return false;

  const now = new Date();
  const startDate = new Date(offer.startDate);
  const endDate = new Date(offer.endDate);

  return now >= startDate && now <= endDate;
}

/**
 * Get offer status
 */
export function getOfferStatus(offer: Offer): OfferStatus {
  if (!offer.isActive) return 'disabled';

  const now = new Date();
  const startDate = new Date(offer.startDate);
  const endDate = new Date(offer.endDate);

  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'expired';
  return 'active';
}

/**
 * Format discount display
 */
export function formatDiscount(offer: Offer): string {
  if (offer.discountType === 'percentage') {
    return `${offer.discountValue}%`;
  } else {
    return `${offer.discountValue.toLocaleString('ar-SY')} ل.س`;
  }
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(viewCount: number, usageCount: number): number {
  if (viewCount === 0) return 0;
  return (usageCount / viewCount) * 100;
}

/**
 * Check if storeId is populated
 */
export function isStorePopulated(
  storeId: string | PopulatedStore
): storeId is PopulatedStore {
  return typeof storeId === 'object' && storeId !== null;
}

/**
 * Check if product is populated
 */
export function isProductPopulated(
  product: string | PopulatedProduct
): product is PopulatedProduct {
  return typeof product === 'object' && product !== null;
}

/**
 * Get store ID (whether populated or not)
 */
export function getStoreId(storeId: string | PopulatedStore): string {
  return isStorePopulated(storeId) ? storeId._id : storeId;
}

/**
 * Get store name (if populated)
 */
export function getStoreName(storeId: string | PopulatedStore): string | null {
  return isStorePopulated(storeId) ? storeId.storeName : null;
}

/**
 * Get product IDs (whether populated or not)
 */
export function getProductIds(
  products: (string | PopulatedProduct)[]
): string[] {
  return products.map((p) => (isProductPopulated(p) ? p._id : p));
}

/**
 * Format date range
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${start.toLocaleDateString('ar-SY')} - ${end.toLocaleDateString('ar-SY')}`;
}

/**
 * Get days remaining
 */
export function getDaysRemaining(endDate: Date | string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

