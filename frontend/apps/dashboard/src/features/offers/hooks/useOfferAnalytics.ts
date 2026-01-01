/**
 * useOfferAnalytics Hook
 * Fetch offer analytics
 */

import { useQuery } from '@tanstack/react-query';
import { offersService } from '../services/offers.service';

export function useOfferAnalytics(id: string) {
  return useQuery({
    queryKey: ['offer', id, 'analytics'],
    queryFn: () => offersService.getOfferAnalytics(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

