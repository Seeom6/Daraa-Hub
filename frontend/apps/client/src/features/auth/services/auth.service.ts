/**
 * Authentication Service
 * 
 * API calls for authentication
 */

import apiClient from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterStep1Request,
  RegisterStep1Response,
  VerifyOTPRequest,
  VerifyOTPResponse,
  CompleteProfileRequest,
  CompleteProfileResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ForgotPasswordVerifyOTPRequest,
  ForgotPasswordVerifyOTPResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
} from '../types/auth.types';

/**
 * Login
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  console.log('Login Request Data:', data);
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  console.log('Login Response:', response.data);
  return response.data;
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

/**
 * Register - Step 1: Send OTP
 */
export const registerStep1 = async (
  data: RegisterStep1Request
): Promise<RegisterStep1Response> => {
  const response = await apiClient.post<RegisterStep1Response>(
    '/auth/register/step1',
    data
  );
  return response.data;
};

/**
 * Register - Step 2: Verify OTP
 */
export const verifyOTP = async (
  data: VerifyOTPRequest
): Promise<VerifyOTPResponse> => {
  const response = await apiClient.post<VerifyOTPResponse>(
    '/auth/register/verify-otp',
    data
  );
  return response.data;
};

/**
 * Register - Step 3: Complete Profile
 */
export const completeProfile = async (
  data: CompleteProfileRequest
): Promise<CompleteProfileResponse> => {
  const response = await apiClient.post<CompleteProfileResponse>(
    '/auth/register/complete-profile',
    data
  );
  return response.data;
};

/**
 * Forgot Password - Step 1: Send OTP
 */
export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(
    '/auth/forgot-password',
    data
  );
  return response.data;
};

/**
 * Forgot Password - Step 2: Verify OTP
 */
export const forgotPasswordVerifyOTP = async (
  data: ForgotPasswordVerifyOTPRequest
): Promise<ForgotPasswordVerifyOTPResponse> => {
  const response = await apiClient.post<ForgotPasswordVerifyOTPResponse>(
    '/auth/forgot-password/verify-otp',
    data
  );
  return response.data;
};

/**
 * Forgot Password - Step 3: Reset Password
 */
export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(
    '/auth/reset-password',
    data
  );
  return response.data;
};

/**
 * Get Current User
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

/**
 * Refresh Token
 */
export const refreshToken = async (): Promise<void> => {
  await apiClient.post('/auth/refresh');
};

// Export all as default
export default {
  login,
  logout,
  registerStep1,
  verifyOTP,
  completeProfile,
  forgotPassword,
  forgotPasswordVerifyOTP,
  resetPassword,
  getCurrentUser,
  refreshToken,
};

