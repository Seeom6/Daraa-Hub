/**
 * Store Owner Types
 * Core types for Store Owner Profile and related entities
 */

export interface StoreOwnerProfile {
  _id: string;
  accountId: string;
  
  // Store Information
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  primaryCategory?: StoreCategory;
  storeCategories: StoreCategory[];
  
  // Verification
  verificationStatus: VerificationStatus;
  verificationSubmittedAt?: Date;
  verificationReviewedAt?: Date;
  verificationReviewedBy?: string;
  verificationRejectionReason?: string;
  
  // Business Documents
  businessLicense?: string;
  taxId?: string;
  nationalId?: string;
  businessAddress?: string;
  businessPhone?: string;
  
  // Statistics
  rating: number;
  totalReviews: number;
  totalSales: number;
  totalRevenue: number;
  
  // Store Status
  isStoreActive: boolean;
  isStoreSuspended: boolean;
  storeSuspendedAt?: Date;
  storeSuspensionReason?: string;
  
  // Commission
  commissionRate: number;
  
  // Subscription
  currentPlanId?: string;
  subscriptionExpiresAt?: Date;
  hasActiveSubscription: boolean;
  dailyProductLimit: number;
  maxImagesPerProduct: number;
  maxVariantsPerProduct: number;
  
  // Relations
  products: string[];
  orders: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export type VerificationStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'suspended';

export interface StoreCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategory?: string;
  level: number;
  order: number;
  isActive: boolean;
  storeCount: number;
  totalProducts: number;
  totalOrders: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  _id: string;
  phone: string;
  email?: string;
  fullName?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  images: string[];
  variants?: ProductVariant[];
  tags: string[];
  status: 'active' | 'draft' | 'inactive' | 'out_of_stock';
  unit?: string;
  unitValue?: number;
  hasVariants: boolean;
  isFeatured: boolean;
  specifications?: Record<string, any>;
  inventory?: {
    quantity: number;
    lowStockThreshold?: number;
  };
  rating?: number;
  totalReviews?: number;
  totalSales?: number;
  sales?: number; // For backward compatibility
  views?: number; // For backward compatibility
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    fullName: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: any;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

