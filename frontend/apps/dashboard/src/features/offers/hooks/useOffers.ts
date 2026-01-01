/**
 * useOffers Hook
 * Fetch offers with filters
 */

import { useQuery } from '@tanstack/react-query';
import { offersService } from '../services/offers.service';
import type { OfferFilters } from '../types';

export function useOffers(filters?: OfferFilters) {
  return useQuery({
    queryKey: ['offers', 'my', filters],
    queryFn: () => offersService.getMyOffers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

