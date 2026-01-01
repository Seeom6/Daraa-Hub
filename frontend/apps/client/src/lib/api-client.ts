/**
 * API Client Configuration
 *
 * Axios instance configured for Daraa Backend API
 * - Base URL: http://localhost:3001/api
 * - Authentication: JWT in HTTP-only cookies
 * - Automatic token refresh
 * - Error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Create Axios instance with default configuration
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request Interceptor
 * - Add custom headers if needed
 * - Log requests in development
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log requests in development (only in browser)
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handle successful responses
 * - Handle errors (401, 403, 500, etc.)
 * - Automatic token refresh on 401
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development (only in browser)
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log errors in development (only in browser)
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await apiClient.post('/auth/refresh');

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403 && typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('[Access Denied] You do not have permission to access this resource');
    }

    // Handle 500 Server Error
    if (error.response?.status === 500 && typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('[Server Error] Something went wrong on the server');
    }

    // Handle Network Error (Backend not available)
    if (error.code === 'ERR_NETWORK' && typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('[Network Error] Backend server is not available. Please start the backend server.');
    }

    return Promise.reject(error);
  }
);

/**
 * API Error Response Type
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * API Success Response Type
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Paginated Response Type
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Helper function to handle API errors
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiErrorResponse;
    return apiError?.error?.message || error.message || 'حدث خطأ ما';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'حدث خطأ غير متوقع';
};

export default apiClient;

