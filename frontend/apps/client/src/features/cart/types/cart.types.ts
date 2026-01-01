import type { Product } from '@/features/shared/types';

export interface CartItem {
  _id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  selectedVariant?: {
    variantId: string;
    options: Record<string, string>;
  };
  addedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  coupon?: Coupon;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemsCount: number;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
  variantId?: string;
  options?: Record<string, string>;
}

export interface UpdateCartItemInput {
  productId: string;
  quantity: number;
}

export interface ApplyCouponInput {
  code: string;
}

export interface CartResponse {
  cart: Cart;
  message?: string;
}

