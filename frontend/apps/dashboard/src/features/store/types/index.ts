/**
 * Types Index
 * Exports all types for easy importing
 */

// Store Owner Types
export type {
  StoreOwnerProfile,
  VerificationStatus,
  StoreCategory,
  Account,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  OrderStatus,
} from './store-owner.types';

// Verification Types
export type {
  VerificationRequest,
  VerificationRequestStatus,
  VerificationDocument,
  DocumentType,
  PersonalInfo,
  BusinessInfo,
} from './verification.types';

// Settings Types
export type {
  StoreSettings,
  BusinessHours,
  ShippingZone,
  StorePaymentMethod,
  SubscriptionPlan,
  PlanType,
  PlanFeatures,
} from './settings.types';

// Analytics Types
export type {
  DashboardMetrics,
  SalesChartData,
  StoreAnalytics,
  AnalyticsPeriod,
  AnalyticsQuery,
} from './analytics.types';

// DTO Types
export type {
  SubmitVerificationDto,
  UploadDocumentDto,
  UpdateStoreProfileDto,
  CreateProductDto,
  UpdateProductDto,
  UpdateOrderStatusDto,
  CreateOfferDto,
  ProductFilters,
  OrderFilters,
} from './dto.types';

// API Types
export type {
  ApiResponse,
  PaginatedResponse,
  StoreProfileResponse,
  VerificationResponse,
  ProductsResponse,
  OrdersResponse,
  DashboardResponse,
} from './api.types';

// Form Types
export type {
  StoreSetupFormData,
  ProductFormData,
  ProductVariantFormData,
  StoreSettingsFormData,
} from './form.types';

// Validation Schemas
export {
  storeInfoSchema,
  businessInfoSchema,
  personalInfoSchema,
  productSchema,
  settingsSchema,
} from './validation.schemas';

