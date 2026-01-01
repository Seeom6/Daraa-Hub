/**
 * Offer Card Component
 * Displays offer information in a card format
 */

'use client';

import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Eye, ShoppingCart, Edit, Trash2, MoreVertical } from 'lucide-react';
import {
  formatDiscount,
  getOfferStatus,
  getProductIds,
  formatDateRange,
} from '../utils/calculations';
import type { Offer } from '../types';

export interface OfferCardProps {
  offer: Offer;
  onEdit?: (offer: Offer) => void;
  onDelete?: (offer: Offer) => void;
  onView?: (offer: Offer) => void;
}

export function OfferCard({ offer, onEdit, onDelete, onView }: OfferCardProps) {
  const status = getOfferStatus(offer);

  const statusConfig = {
    active: { label: 'نشط', variant: 'success' as const },
    upcoming: { label: 'قادم', variant: 'info' as const },
    expired: { label: 'منتهي', variant: 'default' as const },
    disabled: { label: 'معطّل', variant: 'error' as const },
  };

  // Get product count (works with both populated and non-populated)
  const productCount = getProductIds(offer.applicableProducts).length;

  return (
    <Card hover padding="none" className="overflow-hidden">
      {/* Image */}
      {offer.image && (
        <div className="relative h-48 w-full">
          <img
            src={offer.image}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="text-lg font-semibold line-clamp-2 flex-1 cursor-pointer hover:text-primary-600 transition-colors"
            onClick={() => onView?.(offer)}
          >
            {offer.title}
          </h3>
          <Badge variant={statusConfig[status].variant} size="sm">
            {statusConfig[status].label}
          </Badge>
        </div>

        {/* Description */}
        {offer.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {offer.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">💰 الخصم:</span>
            <span className="text-primary-600 dark:text-primary-400 font-semibold">
              {formatDiscount(offer)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">📅 الفترة:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {formatDateRange(offer.startDate, offer.endDate)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">📦 المنتجات:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {productCount === 0 ? 'جميع المنتجات' : `${productCount} منتج`}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500">مشاهدات</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {offer.viewCount.toLocaleString('ar-SY')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500">استخدامات</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {offer.usageCount.toLocaleString('ar-SY')}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit?.(offer)}
            leftIcon={<Edit className="w-4 h-4" />}
            className="flex-1"
          >
            تعديل
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete?.(offer)}
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="flex-1"
          >
            حذف
          </Button>
        </div>
      </div>
    </Card>
  );
}

