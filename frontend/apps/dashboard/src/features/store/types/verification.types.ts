/**
 * Verification Types
 * Types for verification requests and documents
 */

export interface VerificationRequest {
  _id: string;
  accountId: string;
  applicantType: 'store_owner' | 'courier';
  profileId: string;
  status: VerificationRequestStatus;
  
  documents: VerificationDocument[];
  
  personalInfo: PersonalInfo;
  businessInfo?: BusinessInfo;
  
  additionalNotes?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export type VerificationRequestStatus = 
  | 'pending' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'info_required';

export interface VerificationDocument {
  type: DocumentType;
  url: string;
  fileName?: string;
  uploadedAt: Date;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export type DocumentType = 
  | 'national_id' 
  | 'commercial_register' 
  | 'tax_certificate' 
  | 'other';

export interface PersonalInfo {
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  address: string;
  city: string;
  phone?: string;
}

export interface BusinessInfo {
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessPhone: string;
  taxId?: string;
  commercialRegister?: string;
  primaryCategory?: string;
  storeCategories?: string[];
}

