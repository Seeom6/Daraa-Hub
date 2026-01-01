/**
 * useVerification Hook
 * React Query hook for verification management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { storeOwnerService } from '../services';
import type { SubmitVerificationDto, DocumentType } from '../types';

export function useVerification() {
  const queryClient = useQueryClient();

  // Get verification request
  const {
    data: verificationRequest,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['verification-request'],
    queryFn: () => storeOwnerService.getVerificationStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Submit verification
  const submitMutation = useMutation({
    mutationFn: (data: SubmitVerificationDto) => storeOwnerService.submitVerification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-request'] });
      queryClient.invalidateQueries({ queryKey: ['store-profile'] });
      toast.success('تم إرسال طلب التحقق بنجاح');
    },
    onError: () => {
      toast.error('فشل إرسال طلب التحقق');
    },
  });

  // TODO: Add uploadDocument method to storeOwnerService when backend endpoint is ready
  // Upload document
  // const uploadDocumentMutation = useMutation({
  //   mutationFn: ({
  //     verificationRequestId,
  //     documentType,
  //     file,
  //     description,
  //   }: {
  //     verificationRequestId: string;
  //     documentType: DocumentType;
  //     file: File;
  //     description?: string;
  //   }) => storeOwnerService.uploadDocument(verificationRequestId, documentType, file, description),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['verification-request'] });
  //     toast.success('تم رفع المستند بنجاح');
  //   },
  //   onError: () => {
  //     toast.error('فشل رفع المستند');
  //   },
  // });

  return {
    verificationRequest,
    isLoading,
    error,
    refetch,
    submitVerification: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    // TODO: Uncomment when backend endpoint is ready
    // uploadDocument: uploadDocumentMutation.mutate,
    // isUploadingDocument: uploadDocumentMutation.isPending,
  };
}

