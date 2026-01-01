/**
 * API Types
 * Types for API responses
 */

import type { StoreOwnerProfile, Account, Product, Order } from './store-owner.types';
import type { VerificationRequest } from './verification.types';
import type { DashboardMetrics } from './analytics.types';

// ===== Generic API Response =====

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ===== Specific Responses =====

export interface StoreProfileResponse extends ApiResponse {
  data: {
    account: Account;
    profile: StoreOwnerProfile;
  };
}

export interface VerificationResponse extends ApiResponse {
  data: VerificationRequest;
}

export interface ProductsResponse extends PaginatedResponse {
  data: Product[];
}

export interface OrdersResponse extends PaginatedResponse {
  data: Order[];
}

export interface DashboardResponse extends ApiResponse {
  data: DashboardMetrics;
}

