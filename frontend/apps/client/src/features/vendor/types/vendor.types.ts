/**
 * Vendor Types
 * Types for vendor/store owner registration
 */

export interface StoreCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  level: number;
  isActive: boolean;
}

export interface BecomeVendorFormData {
  // Store Information
  storeName: string;
  storeDescription: string;
  primaryCategory: string;
  storeCategories: string[];

  // Business Information
  businessLicense: string;
  taxId: string;
  nationalId: string;
  businessAddress: string;
  businessPhone: string;
  dateOfBirth: string;

  // Documents & Images
  storeImages: File[]; // صور المحل التجاري (3 على الأقل)
  businessLicensePdf?: File; // رخصة العمل PDF
  taxCertificatePdf?: File; // الشهادة الضريبية PDF

  // Agreement
  agreeToTerms: boolean;
}

export interface BecomeVendorRequest {
  applicantType: 'store_owner';
  personalInfo: {
    fullName: string;
    nationalId: string;
    dateOfBirth: string;
    address: string;
    city: string;
  };
  businessInfo: {
    businessName: string;
    businessType: string;
    businessAddress: string;
    businessPhone: string;
    taxId?: string;
    commercialRegister?: string;
    primaryCategory?: string;
    storeCategories?: string[];
    storeImages?: string[]; // URLs بعد الرفع
    businessLicensePdf?: string; // URL بعد الرفع
    taxCertificatePdf?: string; // URL بعد الرفع
  };
  additionalNotes?: string;
}

export interface BecomeVendorResponse {
  success: boolean;
  message: string;
  data?: {
    verificationRequestId: string;
    status: string;
  };
}

export interface StoreCategoriesResponse {
  success: boolean;
  data: StoreCategory[];
  count: number;
}

export interface VerificationStatus {
  _id: string;
  accountId: string;
  applicantType: 'store_owner' | 'courier';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'info_required';
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  requiredInfo?: string;
  adminNotes?: string;
  resubmissionCount: number;
  createdAt: string;
  updatedAt: string;
}

