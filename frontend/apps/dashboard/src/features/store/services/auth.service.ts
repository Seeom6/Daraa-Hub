/**
 * Authentication Service
 * API service for authentication and authorization
 */

import apiClient from '@/lib/api-client';
import type { ApiResponse } from '../types';

export interface LoginDto {
  phoneNumber: string;
  password: string;
}

export interface AuthUser {
  _id: string;
  phone: string;
  email?: string;
  fullName?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  profileId?: string;
}

export interface LoginResponse {
  user: AuthUser;
  message: string;
}

class AuthService {
  private readonly baseUrl = '/auth';

  /**
   * Login
   * Tokens are stored in HTTP-only cookies automatically
   */
  async login(data: LoginDto): Promise<AuthUser> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/login`,
      data
    );
    return response.data.data!.user;
  }

  /**
   * Logout
   * Clears HTTP-only cookies
   */
  async logout(): Promise<void> {
    await apiClient.post(`${this.baseUrl}/logout`);
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthUser> {
    const response = await apiClient.get<ApiResponse<AuthUser>>(`${this.baseUrl}/me`);
    return response.data.data!;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    await apiClient.post(`${this.baseUrl}/refresh`);
  }
}

export const authService = new AuthService();

