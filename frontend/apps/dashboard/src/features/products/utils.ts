/**
 * Product Utilities
 * Helper functions for products feature
 */

import { AlertTriangle } from 'lucide-react';
import type { Product, ProductStatus } from './types';

/**
 * Format price in Syrian Pounds
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SYP',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Get status badge component for product
 */
export const getStatusBadge = (product: Product) => {
  // Check for low stock if inventory exists
  if (
    product.inventory &&
    product.inventory.quantity <= (product.inventory.lowStockThreshold || 10)
  ) {
    return {
      label: 'مخزون منخفض',
      className: 'px-2 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium flex items-center gap-1',
      icon: AlertTriangle,
      showIcon: true,
    };
  }

  const statusConfig: Record<ProductStatus, { label: string; className: string }> = {
    active: {
      label: 'نشط',
      className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    },
    draft: {
      label: 'مسودة',
      className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
    },
    out_of_stock: {
      label: 'نفذ من المخزون',
      className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    },
    archived: {
      label: 'مؤرشف',
      className: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-500',
    },
  };

  const config = statusConfig[product.status];
  return {
    label: config.label,
    className: `px-2 py-1 rounded-lg text-xs font-medium ${config.className}`,
    showIcon: false,
  };
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (price: number, compareAtPrice: number): number => {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

/**
 * Filter products based on search and filters
 */
export const filterProducts = (
  products: Product[],
  searchQuery: string,
  filterStatus: string,
  filterCategory: string
): Product[] => {
  return products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'low_stock' &&
        product.inventory &&
        product.inventory.quantity <= (product.inventory.lowStockThreshold || 10)) ||
      product.status === filterStatus;

    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });
};

/**
 * Calculate product statistics
 */
export const calculateProductStats = (products: Product[]) => {
  return {
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    lowStock: products.filter(
      (p) => p.inventory && p.inventory.quantity <= (p.inventory.lowStockThreshold || 10)
    ).length,
    outOfStock: products.filter((p) => p.inventory && p.inventory.quantity === 0).length,
  };
};

/**
 * Validate product form step
 */
export const validateProductStep = (
  step: number,
  formData: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!formData.name?.trim()) errors.name = 'اسم المنتج مطلوب';
    if (!formData.description?.trim()) errors.description = 'الوصف مطلوب';
    if (!formData.category) errors.category = 'الفئة مطلوبة';
  }

  if (step === 2) {
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'السعر مطلوب ويجب أن يكون أكبر من صفر';
    }
    if (
      formData.compareAtPrice &&
      parseFloat(formData.compareAtPrice) <= parseFloat(formData.price)
    ) {
      errors.compareAtPrice = 'السعر قبل الخصم يجب أن يكون أكبر من السعر الحالي';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

