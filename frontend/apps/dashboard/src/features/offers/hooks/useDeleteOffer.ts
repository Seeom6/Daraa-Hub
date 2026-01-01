/**
 * useDeleteOffer Hook
 * Delete offer mutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { offersService } from '../services/offers.service';
import toast from 'react-hot-toast';

export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: offersService.deleteOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('تم حذف العرض بنجاح! 🗑️');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف العرض');
    },
  });
}

