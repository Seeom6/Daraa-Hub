/**
 * Verification Module - React Query Hooks
 * Custom hooks for verification requests data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { GetVerificationRequestsParams, ReviewVerificationData } from '../types/stores.types';
import * as verificationApi from '../api/verification.api';

// ============================================================================
// Query Keys
// ============================================================================

export const verificationKeys = {
  all: ['verification'] as const,
  lists: () => [...verificationKeys.all, 'list'] as const,
  list: (params: GetVerificationRequestsParams) => [...verificationKeys.lists(), params] as const,
  details: () => [...verificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...verificationKeys.details(), id] as const,
  statistics: () => [...verificationKeys.all, 'statistics'] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all verification requests with filters and pagination
 */
export function useVerificationRequests(params?: GetVerificationRequestsParams) {
  return useQuery({
    queryKey: verificationKeys.list(params || {}),
    queryFn: () => verificationApi.getVerificationRequests(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get verification request by ID
 */
export function useVerificationRequest(requestId: string) {
  return useQuery({
    queryKey: verificationKeys.detail(requestId),
    queryFn: () => verificationApi.getVerificationRequestById(requestId),
    enabled: !!requestId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Get verification statistics
 */
export function useVerificationStatistics() {
  return useQuery({
    queryKey: verificationKeys.statistics(),
    queryFn: verificationApi.getVerificationStatistics,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Review verification request (approve/reject/request_info)
 */
export function useReviewVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: ReviewVerificationData }) =>
      verificationApi.reviewVerificationRequest(requestId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.all });
      
      const action = variables.data.action;
      if (action === 'approve') {
        toast.success('تمت الموافقة على الطلب بنجاح');
      } else if (action === 'reject') {
        toast.success('تم رفض الطلب بنجاح');
      } else if (action === 'request_info') {
        toast.success('تم إرسال طلب المعلومات بنجاح');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل مراجعة الطلب');
    },
  });
}

/**
 * Approve verification request
 */
export function useApproveVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, notes }: { requestId: string; notes?: string }) =>
      verificationApi.approveVerificationRequest(requestId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.all });
      toast.success('تمت الموافقة على الطلب بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشلت الموافقة على الطلب');
    },
  });
}

/**
 * Reject verification request
 */
export function useRejectVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      verificationApi.rejectVerificationRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.all });
      toast.success('تم رفض الطلب بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفض الطلب');
    },
  });
}

/**
 * Request more information
 */
export function useRequestMoreInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      requestedInfo,
      missingDocuments,
    }: {
      requestId: string;
      requestedInfo: string;
      missingDocuments?: string[];
    }) => verificationApi.requestMoreInformation(requestId, requestedInfo, missingDocuments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.all });
      toast.success('تم إرسال طلب المعلومات بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال طلب المعلومات');
    },
  });
}

/**
 * Export verification data
 */
export function useExportVerification() {
  return useMutation({
    mutationFn: (params?: GetVerificationRequestsParams) =>
      verificationApi.exportVerificationData(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `verification-requests-${new Date().toISOString()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('تم تصدير البيانات بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير البيانات');
    },
  });
}

