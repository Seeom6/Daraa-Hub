/**
 * User Types & Interfaces
 * Based on Backend API Documentation
 */

// ============================================================================
// Enums
// ============================================================================

export enum UserRole {
  CUSTOMER = 'customer',
  STORE_OWNER = 'store_owner',
  COURIER = 'courier',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

// ============================================================================
// Base User Interface (from Account Schema)
// ============================================================================

export interface User {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  suspendedAt?: Date | string;
  suspendedBy?: string;
  suspensionReason?: string;
  suspensionExpiresAt?: Date | string | null;
  roleProfileId?: string;
  roleProfileRef?: 'CustomerProfile' | 'StoreOwnerProfile' | 'CourierProfile' | 'AdminProfile';
  lastLoginAt?: Date | string;
  lastLoginIp?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface GetUsersParams {
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface SearchUsersParams {
  q: string;
}

export interface SearchUsersResponse {
  success: boolean;
  data: User[];
}

export interface GetUserResponse {
  success: boolean;
  data: User;
}

export interface SuspendUserRequest {
  reason: string;
  durationDays?: number;
  notifyUser?: boolean;
}

export interface SuspendUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UnsuspendUserRequest {
  reason: string;
  notifyUser?: boolean;
}

export interface UnsuspendUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface BanUserRequest {
  reason: string;
}

export interface BanUserResponse {
  success: boolean;
  message: string;
  data: User;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface UserFilters {
  searchQuery: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface UserTableState {
  selectedUsers: string[];
  currentPage: number;
  usersPerPage: number;
}

export interface UserModalState {
  showSuspendModal: boolean;
  showUnsuspendModal: boolean;
  showBanModal: boolean;
  selectedUser: User | null;
}

// ============================================================================
// Constants
// ============================================================================

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'عميل',
  [UserRole.STORE_OWNER]: 'صاحب متجر',
  [UserRole.COURIER]: 'سائق',
  [UserRole.ADMIN]: 'مدير',
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'نشط',
  [UserStatus.SUSPENDED]: 'معلق',
  [UserStatus.BANNED]: 'محظور',
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  [UserRole.STORE_OWNER]: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  [UserRole.COURIER]: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  [UserRole.ADMIN]: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  [UserStatus.SUSPENDED]: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  [UserStatus.BANNED]: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

