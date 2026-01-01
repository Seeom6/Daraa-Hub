import type { Product } from './product.types';
import type { Address } from './address.types';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum PaymentMethod {
  COD = 'cod', // Cash on Delivery
  WALLET = 'wallet',
  CREDIT_CARD = 'credit_card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface OrderItem {
  _id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  selectedVariant?: {
    variantId: string;
    options: Record<string, string>;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  accountId: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  addressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

