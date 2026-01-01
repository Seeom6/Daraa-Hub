/**
 * Authentication Types
 * 
 * TypeScript types and interfaces for authentication
 */

// ========================================
// User Types
// ========================================

export type UserRole = 'customer' | 'store_owner' | 'courier' | 'admin';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// Login Types
// ========================================

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    role: string;
  };
}

// ========================================
// Register Types (3-Step Process)
// ========================================

// Step 1: Send OTP
export interface RegisterStep1Request {
  fullName: string;
  phoneNumber: string;
  countryCode: string;
}

export interface RegisterStep1Response {
  message: string;
  expiresIn: number; // seconds
}

// Step 2: Verify OTP
export interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
}

// Step 3: Complete Profile
export interface CompleteProfileRequest {
  phoneNumber: string;
  email?: string;
  password: string;
}

export interface CompleteProfileResponse {
  success: boolean;
  message: string;
  data: {
    role: string;
  };
}

// ========================================
// Forgot Password Types
// ========================================

export interface ForgotPasswordRequest {
  phoneNumber: string;
}

export interface ForgotPasswordResponse {
  message: string;
  expiresIn: number;
}

export interface ForgotPasswordVerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface ForgotPasswordVerifyOTPResponse {
  message: string;
}

export interface ResetPasswordRequest {
  phoneNumber: string;
  otp: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// ========================================
// OTP Types
// ========================================

export interface OTPState {
  phone: string;
  expiresAt: number; // timestamp
  canResend: boolean;
  resendIn: number; // seconds
}

// ========================================
// Auth Context Types
// ========================================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: CompleteProfileRequest) => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

// ========================================
// Form State Types
// ========================================

export interface LoginFormData {
  phone: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  phone: string;
  otp: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormData {
  phone: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

