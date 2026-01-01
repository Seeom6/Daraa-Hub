/**
 * Category Types
 * Based on backend Category schema
 */

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string; // Icon name or URL
  image?: string; // Category image URL
  parentCategory?: string;
  level: number; // 0 for root, 1 for subcategory, etc.
  order: number; // Display order
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  productCount: number; // Denormalized count
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  subcategories?: Category[];
}

// API Response Types
export interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export interface CategoryWithProducts extends Category {
  products?: any[]; // Will be typed with Product later
  totalProducts?: number;
}

// Category Filters
export interface CategoryFilters {
  parentCategory?: string;
  level?: number;
  isActive?: boolean;
  search?: string;
}

