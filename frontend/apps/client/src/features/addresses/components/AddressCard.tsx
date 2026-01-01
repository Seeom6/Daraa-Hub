'use client';

import { MapPin, Phone, User, Edit, Trash2, Check } from 'lucide-react';
import { motion } from 'motion/react';
import type { Address } from '@/features/shared/types/address.types';

export interface AddressCardProps {
  address: Address;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isDeleting?: boolean;
  showActions?: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  onSelect,
  isSelected,
  isDeleting,
  showActions = true,
}: AddressCardProps) {
  const fullAddress = [
    address.street,
    address.building && `بناء ${address.building}`,
    address.floor && `طابق ${address.floor}`,
    address.apartment && `شقة ${address.apartment}`,
    address.area,
    address.governorate,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-sm border rounded-xl p-4 transition-all ${
        isSelected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-white/10 hover:border-white/20'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect}
    >
      {/* Default Badge */}
      {address.isDefault && (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full mb-3">
          <Check className="w-3 h-3" />
          العنوان الافتراضي
        </div>
      )}

      {/* Name & Phone */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-white">
          <User className="w-4 h-4 text-white/60" />
          <span className="font-medium">{address.fullName}</span>
        </div>

        <div className="flex items-center gap-2 text-white/80">
          <Phone className="w-4 h-4 text-white/60" />
          <span className="text-sm">{address.phone}</span>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 text-white/80 mb-4">
        <MapPin className="w-4 h-4 text-white/60 mt-1 flex-shrink-0" />
        <p className="text-sm">{fullAddress}</p>
      </div>

      {/* Landmark */}
      {address.nearestLandmark && (
        <p className="text-xs text-white/60 mb-4">
          قرب: {address.nearestLandmark}
        </p>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
          {!address.isDefault && onSetDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault();
              }}
              className="text-xs text-primary hover:underline"
            >
              تعيين كافتراضي
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="mr-auto p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
              title="تعديل"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

