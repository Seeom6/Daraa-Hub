/**
 * Analytics Types
 * Types for dashboard metrics and analytics data
 */

import type { Order, Product } from './store-owner.types';

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  revenueChange: number; // percentage
  ordersChange: number; // percentage
  productsChange: number; // percentage

  recentOrders: Order[];
  topProducts: Product[];
  salesChart: SalesChartData[];

  lowStockProducts: Product[];
  pendingOrders: number;
  newReviews: number;
}

export interface SalesChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface StoreAnalytics {
  _id: string;
  storeId: string;
  period: AnalyticsPeriod;
  date: Date;

  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  customerRetentionRate: number;
  newCustomers: number;
  returningCustomers: number;

  createdAt: Date;
  updatedAt: Date;
}

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface AnalyticsQuery {
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
  storeId?: string;
}

