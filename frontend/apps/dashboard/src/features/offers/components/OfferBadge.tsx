/**
 * Offer Badge Component
 * Badge to display on products with offers
 */

'use client';

import { Badge } from '@/components/ui';
import { formatDiscount } from '../utils/calculations';
import type { Offer } from '../types';

export interface OfferBadgeProps {
  offer: Offer;
  className?: string;
}

export function OfferBadge({ offer, className }: OfferBadgeProps) {
  return (
    <Badge variant="error" className={className}>
      🔥 خصم {formatDiscount(offer)}
    </Badge>
  );
}

