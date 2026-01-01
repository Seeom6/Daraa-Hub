/**
 * Profile Types
 * TypeScript types for profile feature
 */

import { UserRole } from '@daraa/types';

/**
 * Loyalty Tier
 */
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * Order Status
 */
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'picked_up' 
  | 'delivering' 
  | 'delivered' 
  | 'cancelled';

/**
 * Payment Method
 */
export type PaymentMethod = 'cash' | 'card' | 'wallet';

/**
 * Payment Status
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Profile Data
 * Complete user profile with account and customer profile
 */
export interface ProfileData {
  account: {
    _id: string;
    fullName: string;
    phone: string;
    email?: string;
    role: UserRole;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  profile: {
    _id: string;
    accountId: string;
    loyaltyPoints: number;
    tier: LoyaltyTier;
    addresses: string[];
    orders: string[];
    wishlist: string[];
    createdAt: Date;
    updatedAt: Date;
  } | null;
  securityProfile?: {
    phoneVerified: boolean;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
  };
}

/**
 * Order Item
 */
export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

/**
 * Delivery Address
 */
export interface DeliveryAddress {
  fullName: string;
  phoneNumber: string;
  fullAddress: string;
  city: string;
  district?: string;
  notes?: string;
}

/**
 * Order
 */
export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  storeId: string | { _id: string; businessName: string };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryAddress: DeliveryAddress;
  customerNotes?: string;
  pointsEarned: number;
  pointsUsed: number;
  walletAmountPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Profile Stats
 */
export interface ProfileStats {
  totalOrders?: number;
  loyaltyPoints?: number;
  wishlistCount?: number;
  currentTier?: LoyaltyTier;
  currentDiscount?: number;
}

/**
 * Tier Info
 */
export interface TierInfo {
  name: string;
  icon: any; // Lucide icon component
  color: string;
  min: number;
  max: number;
  discount: string;
  benefits: string;
}

/**
 * Next Tier Info
 */
export interface NextTierInfo {
  tier: LoyaltyTier;
  pointsNeeded: number;
}

