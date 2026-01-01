/**
 * Stores Module - TypeScript Types & Interfaces
 * Comprehensive type definitions for stores, verification, and categories
 */

// ============================================================================
// Store Types
// ============================================================================

export type StoreStatus = 'active' | 'inactive' | 'suspended';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'info_required';

export interface StoreAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface StoreOwner {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
}

export interface StoreCategory {
  _id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
  parentCategory?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  _id: string;
  accountId: string;
  storeName: string;
  storeDescription?: string;
  primaryCategory: string;
  storeCategories: string[];
  businessPhone: string;
  businessAddress: StoreAddress;
  status: StoreStatus;
  verificationStatus: VerificationStatus;
  rating: number;
  totalReviews: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: StoreOwner;
}

export interface StoreStatistics {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  suspendedStores: number;
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  averageRating: number;
}

// ============================================================================
// Verification Types
// ============================================================================

export type VerificationRequestStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'info_required';
export type ApplicantType = 'store_owner' | 'courier';
export type ReviewAction = 'approve' | 'reject' | 'request_info';

export interface PersonalInfo {
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  address: string;
  city: string;
}

export interface BusinessInfo {
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessPhone: string;
  taxId: string;
  commercialRegister: string;
  storeImages?: string[];
  businessLicensePdf?: string;
  taxCertificatePdf?: string;
}

export interface VerificationDocument {
  _id: string;
  name: string;
  type: 'business_license' | 'tax_id' | 'national_id' | 'other';
  url: string;
  uploadedDate: string;
}

export interface VerificationRequest {
  _id: string;
  accountId: string | {
    _id: string;
    fullName: string;
    phone: string;
    email?: string;
  };
  applicantType: ApplicantType;
  status: VerificationRequestStatus;
  personalInfo?: PersonalInfo;
  businessInfo?: BusinessInfo;
  documents: VerificationDocument[];
  adminNotes?: string;
  rejectionReason?: string;
  requestedInfo?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string | {
    _id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VerificationStatistics {
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  info_required: number;
  total: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface GetStoresParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StoreStatus | 'all';
  verificationStatus?: VerificationStatus | 'all';
  category?: string;
  sortBy?: 'createdAt' | 'rating' | 'revenue' | 'totalOrders';
  sortOrder?: 'asc' | 'desc';
}

export interface GetStoresResponse {
  success: boolean;
  data: Store[]; // Backend returns array directly in data field
  count: number;
  total: number;
  page: number;
  totalPages: number;
}

export interface GetStoreResponse {
  success: boolean;
  data: Store;
}

export interface GetVerificationRequestsParams {
  page?: number;
  limit?: number;
  status?: VerificationRequestStatus | 'all';
  applicantType?: ApplicantType | 'all';
  search?: string;
}

export interface GetVerificationRequestsResponse {
  success: boolean;
  data: {
    requests: VerificationRequest[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface GetVerificationRequestResponse {
  success: boolean;
  data: VerificationRequest;
}

export interface ReviewVerificationData {
  action: ReviewAction;
  notes?: string;
  rejectionReason?: string;
  infoRequired?: string;
}

export interface ReviewVerificationResponse {
  success: boolean;
  message: string;
  data: VerificationRequest;
}

export interface GetStoreCategoriesResponse {
  success: boolean;
  data: StoreCategory[];
  count: number;
}

export interface CreateStoreCategoryData {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
  parentCategory?: string;
}

export interface UpdateStoreCategoryData {
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
  isActive?: boolean;
}

