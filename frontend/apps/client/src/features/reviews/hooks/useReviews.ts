import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { reviewsService } from '../services/reviews.service';
import type { CreateReviewInput } from '@/features/shared/types/review.types';

const REVIEWS_QUERY_KEY = ['reviews'];

/**
 * Get product reviews
 */
export function useProductReviews(
  productId: string,
  filters?: { page?: number; limit?: number; sort?: string }
) {
  return useQuery({
    queryKey: [...REVIEWS_QUERY_KEY, 'product', productId, filters],
    queryFn: () => reviewsService.getProductReviews(productId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Get store reviews
 */
export function useStoreReviews(
  storeId: string,
  filters?: { page?: number; limit?: number; sort?: string }
) {
  return useQuery({
    queryKey: [...REVIEWS_QUERY_KEY, 'store', storeId, filters],
    queryFn: () => reviewsService.getStoreReviews(storeId, filters),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Get my reviews
 */
export function useMyReviews(filters?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...REVIEWS_QUERY_KEY, 'my', filters],
    queryFn: () => reviewsService.getMyReviews(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Create review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewInput) => reviewsService.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
      toast.success('تم إضافة التقييم بنجاح');
    },
    onError: () => {
      toast.error('فشلت إضافة التقييم');
    },
  });
}

/**
 * Update review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReviewInput> }) =>
      reviewsService.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
      toast.success('تم تحديث التقييم بنجاح');
    },
    onError: () => {
      toast.error('فشل تحديث التقييم');
    },
  });
}

/**
 * Delete review
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
      toast.success('تم حذف التقييم بنجاح');
    },
    onError: () => {
      toast.error('فشل حذف التقييم');
    },
  });
}

/**
 * Mark review as helpful
 */
export function useMarkHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsService.markHelpful(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
      toast.success('شكراً لتقييمك');
    },
    onError: () => {
      toast.error('فشلت العملية');
    },
  });
}

/**
 * Report review
 */
export function useReportReview() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reviewsService.reportReview(id, reason),
    onSuccess: () => {
      toast.success('تم إرسال البلاغ بنجاح');
    },
    onError: () => {
      toast.error('فشل إرسال البلاغ');
    },
  });
}

