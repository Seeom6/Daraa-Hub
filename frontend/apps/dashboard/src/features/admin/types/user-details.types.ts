/**
 * User Details Types
 * Extended types for user details page
 */

import { User } from './user.types';

// ============================================================================
// User Statistics
// ============================================================================

export interface UserStatistics {
  totalOrders?: number;
  totalSpent?: number;
  totalReviews?: number;
  averageRating?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  pendingOrders?: number;
}

// ============================================================================
// User Activity
// ============================================================================

export interface UserActivity {
  _id: string;
  userId: string;
  type: ActivityType;
  action: string;
  details?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date | string;
  createdAt: Date | string;
}

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  ORDER_CREATED = 'order_created',
  ORDER_CANCELLED = 'order_cancelled',
  REVIEW_ADDED = 'review_added',
  PROFILE_UPDATED = 'profile_updated',
  PASSWORD_CHANGED = 'password_changed',
  ADDRESS_ADDED = 'address_added',
  ADDRESS_UPDATED = 'address_updated',
  WISHLIST_ADDED = 'wishlist_added',
  CART_UPDATED = 'cart_updated',
}

// ============================================================================
// User Orders
// ============================================================================

export interface UserOrder {
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
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'cash_on_delivery',
  WALLET = 'wallet',
  CREDIT_CARD = 'credit_card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

// ============================================================================
// Extended User Details
// ============================================================================

export interface UserDetails extends User {
  statistics?: UserStatistics;
  recentActivity?: UserActivity[];
  recentOrders?: UserOrder[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface GetUserDetailsResponse {
  success: boolean;
  data: User;
}

export interface GetUserStatisticsResponse {
  success: boolean;
  data: UserStatistics;
}

export interface GetUserActivityResponse {
  success: boolean;
  data: UserActivity[];
}

export interface GetUserOrdersResponse {
  success: boolean;
  data: {
    orders: UserOrder[];
    total: number;
    page: number;
    totalPages: number;
  };
}

