/**
 * useOffer Hook
 * Fetch single offer by ID
 */

import { useQuery } from '@tanstack/react-query';
import { offersService } from '../services/offers.service';

export function useOffer(id: string) {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: () => offersService.getOffer(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

