import type { PaymentMethod } from '@/features/shared/types/order.types';

export enum CheckoutStep {
  ADDRESS = 1,
  SHIPPING = 2,
  PAYMENT = 3,
  REVIEW = 4,
}

export interface CheckoutData {
  addressId?: string;
  shippingMethod?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

