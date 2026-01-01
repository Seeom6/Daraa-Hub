/**
 * Application Constants
 * 
 * Centralized constants used across the application
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  CUSTOMER: 'customer',
  STORE_OWNER: 'store_owner',
  COURIER: 'courier',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Order Status
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

/**
 * Order Status Labels (Arabic)
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  returned: 'مرتجع',
};

/**
 * Order Status Colors
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-purple-500',
  shipped: 'bg-cyan-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
  returned: 'bg-gray-500',
};

/**
 * Payment Methods
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  WALLET: 'wallet',
  CARD: 'card',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

/**
 * Payment Method Labels (Arabic)
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'الدفع عند الاستلام',
  wallet: 'المحفظة',
  card: 'بطاقة ائتمان',
};

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'order_placed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_RECEIVED: 'payment_received',
  REVIEW_REPLY: 'review_reply',
  PRICE_DROP: 'price_drop',
  BACK_IN_STOCK: 'back_in_stock',
  PROMO: 'promo',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^\+963\d{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  THEME: 'sillap_theme',
  LANGUAGE: 'sillap_language',
  WISHLIST: 'sillap_wishlist',
  RECENT_SEARCHES: 'sillap_recent_searches',
} as const;

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PRODUCTS: '/products',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  PROFILE: '/profile',
  STORES: '/stores',
  WISHLIST: '/wishlist',
} as const;

/**
 * Query Keys for React Query
 */
export const QUERY_KEYS = {
  AUTH: ['auth'],
  USER: ['user'],
  PRODUCTS: ['products'],
  PRODUCT: ['product'],
  CATEGORIES: ['categories'],
  CART: ['cart'],
  ORDERS: ['orders'],
  ORDER: ['order'],
  STORES: ['stores'],
  STORE: ['store'],
  REVIEWS: ['reviews'],
  NOTIFICATIONS: ['notifications'],
  WALLET: ['wallet'],
} as const;

