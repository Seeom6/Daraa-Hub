/**
 * Verification Module - API Service
 * Handles all API calls for verification requests management
 */

import axios from 'axios';
import type {
  GetVerificationRequestsParams,
  GetVerificationRequestsResponse,
  GetVerificationRequestResponse,
  ReviewVerificationData,
  ReviewVerificationResponse,
} from '../types/stores.types';

// API Client with JWT cookie handling
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Verification API
// ============================================================================

/**
 * Get all verification requests with filters and pagination
 */
export async function getVerificationRequests(
  params?: GetVerificationRequestsParams
): Promise<GetVerificationRequestsResponse> {
  try {
    const response = await apiClient.get<GetVerificationRequestsResponse>(
      '/verification/requests',
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching verification requests:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch verification requests');
  }
}

/**
 * Get verification request by ID
 */
export async function getVerificationRequestById(
  requestId: string
): Promise<GetVerificationRequestResponse> {
  try {
    const response = await apiClient.get<GetVerificationRequestResponse>(
      `/verification/requests/${requestId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching verification request:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch verification request');
  }
}

/**
 * Review verification request (approve/reject/request_info)
 */
export async function reviewVerificationRequest(
  requestId: string,
  data: ReviewVerificationData
): Promise<ReviewVerificationResponse> {
  try {
    const response = await apiClient.patch<ReviewVerificationResponse>(
      `/verification/requests/${requestId}/review`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error reviewing verification request:', error);
    throw new Error(error.response?.data?.message || 'Failed to review verification request');
  }
}

/**
 * Approve verification request
 */
export async function approveVerificationRequest(
  requestId: string,
  notes?: string
): Promise<ReviewVerificationResponse> {
  return reviewVerificationRequest(requestId, {
    action: 'approve',
    notes,
  });
}

/**
 * Reject verification request
 */
export async function rejectVerificationRequest(
  requestId: string,
  reason: string
): Promise<ReviewVerificationResponse> {
  return reviewVerificationRequest(requestId, {
    action: 'reject',
    rejectionReason: reason,
  });
}

/**
 * Request more information
 */
export async function requestMoreInformation(
  requestId: string,
  requestedInfo: string,
  missingDocuments?: string[]
): Promise<ReviewVerificationResponse> {
  return reviewVerificationRequest(requestId, {
    action: 'request_info',
    infoRequired: requestedInfo,
  });
}

/**
 * Get verification statistics
 */
export async function getVerificationStatistics(): Promise<any> {
  try {
    const response = await apiClient.get('/verification/statistics');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching verification statistics:', error);
    // Fallback data
    return {
      success: true,
      data: {
        pending: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        info_required: 0,
        total: 0,
      },
    };
  }
}

/**
 * Export verification requests data
 */
export async function exportVerificationData(
  params?: GetVerificationRequestsParams
): Promise<Blob> {
  try {
    const response = await apiClient.get('/verification/requests/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting verification data:', error);
    throw new Error(error.response?.data?.message || 'Failed to export verification data');
  }
}

