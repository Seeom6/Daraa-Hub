'use client';

import Image from 'next/image';
import { ThumbsUp, Flag, Edit, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { StarRating } from './StarRating';
import type { Review } from '@/features/shared/types/review.types';

export interface ReviewCardProps {
  review: Review;
  showProduct?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onHelpful?: () => void;
  onReport?: () => void;
}

export function ReviewCard({
  review,
  showProduct = false,
  showActions = false,
  onEdit,
  onDelete,
  onHelpful,
  onReport,
}: ReviewCardProps) {
  const reviewDate = new Date(review.createdAt).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
            {review.userAvatar ? (
              <Image src={review.userAvatar} alt={review.userName} width={48} height={48} />
            ) : (
              <span className="text-white text-lg font-bold">
                {review.userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-white font-medium">{review.userName}</h4>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-white/60 text-sm">{reviewDate}</p>
          </div>
        </div>

        {/* Rating */}
        <StarRating value={review.rating} readonly size="sm" />
      </div>

      {/* Comment */}
      <p className="text-white/80 mb-4 leading-relaxed">{review.comment}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {review.images.map((image, index) => (
            <div
              key={index}
              className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-white/10"
            >
              <Image src={image} alt={`Review image ${index + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-4">
          {/* Helpful Button */}
          {onHelpful && (
            <button
              onClick={onHelpful}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">مفيد</span>
            </button>
          )}

          {/* Report Button */}
          {onReport && (
            <button
              onClick={onReport}
              className="flex items-center gap-2 text-white/60 hover:text-red-400 transition-colors"
            >
              <Flag className="w-4 h-4" />
              <span className="text-sm">إبلاغ</span>
            </button>
          )}
        </div>

        {/* Edit/Delete Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-white/60 hover:text-blue-400 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-white/60 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

