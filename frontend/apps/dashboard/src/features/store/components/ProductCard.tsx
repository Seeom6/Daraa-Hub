/**
 * ProductCard Component
 * Display product information in a card
 */

import { Card, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Product } from '../types';

export interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleActive?: (product: Product) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductCardProps) {
  return (
    <Card hover padding="none" className="overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-slate-800">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">لا توجد صورة</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={(product as any).isActive ? 'success' : 'error'}>
            {(product as any).isActive ? 'نشط' : 'غير نشط'}
          </Badge>
        </div>
        
        {/* Stock Badge */}
        {(product as any).stock !== undefined && (product as any).stock < 10 && (
          <div className="absolute top-3 left-3">
            <Badge variant="warning">
              مخزون منخفض ({(product as any).stock})
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(product.price)}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-sm text-gray-500 line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            )}
          </div>
          
          <div className="text-left">
            <p className="text-xs text-gray-500 dark:text-gray-500">المخزون</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {(product as any).stock || 0}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(product)}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {(product as any).isActive ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  إخفاء
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  تفعيل
                </>
              )}
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="flex-1 px-3 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              تعديل
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(product)}
              className="px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

