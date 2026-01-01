/**
 * useUpdateOffer Hook
 * Update offer mutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { offersService } from '../services/offers.service';
import toast from 'react-hot-toast';
import type { UpdateOfferDto } from '../types';

interface UpdateOfferParams {
  id: string;
  data: UpdateOfferDto;
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateOfferParams) => offersService.updateOffer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offer', variables.id] });
      toast.success('تم تحديث العرض بنجاح! ✅');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تحديث العرض');
    },
  });
}

