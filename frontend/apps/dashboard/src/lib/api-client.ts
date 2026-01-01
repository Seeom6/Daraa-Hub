/**
 * API Client
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any custom headers here if needed
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    // Handle errors
    const message = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ ما';

    // Handle specific status codes
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      toast.error('انتهت جلستك. الرجاء تسجيل الدخول مرة أخرى');
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    } else if (error.response?.status === 403) {
      // Forbidden
      toast.error('ليس لديك صلاحية للوصول إلى هذا المورد');
    } else if (error.response?.status === 404) {
      // Not found
      toast.error('المورد المطلوب غير موجود');
    } else if (error.response?.status === 500) {
      // Server error
      toast.error('خطأ في الخادم. الرجاء المحاولة لاحقاً');
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      toast.error('انتهت مهلة الطلب. الرجاء المحاولة مرة أخرى');
    } else if (!error.response) {
      // Network error
      toast.error('خطأ في الاتصال بالشبكة');
    } else {
      // Other errors
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Helper function to handle file uploads
export const uploadFile = async (file: File, endpoint: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.url;
};

// Helper function to handle multiple file uploads
export const uploadFiles = async (files: File[], endpoint: string): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.urls;
};

export default apiClient;

