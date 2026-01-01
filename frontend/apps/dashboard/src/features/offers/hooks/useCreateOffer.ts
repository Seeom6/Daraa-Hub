/**
 * useCreateOffer Hook
 * Create new offer mutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { offersService } from '../services/offers.service';
import toast from 'react-hot-toast';

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => offersService.createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('تم إنشاء العرض بنجاح! 🎉');
    },
    onError: (error: any) => {
      console.error('Error creating offer:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء العرض');
    },
  });
}

