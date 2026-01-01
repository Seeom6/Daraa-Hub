'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ReviewCard } from '@/features/reviews/components';
import { useMyReviews, useDeleteReview } from '@/features/reviews/hooks/useReviews';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function MyReviewsPage() {
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const { data, isLoading, error } = useMyReviews();
  const deleteReview = useDeleteReview();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message="حدث خطأ أثناء تحميل التقييمات" variant="card" />
      </div>
    );
  }

  const reviews = data?.reviews || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Star className="w-8 h-8" />
          تقييماتي
        </h1>
        <p className="text-white/60">
          {data?.total || 0} {data?.total === 1 ? 'تقييم' : 'تقييمات'}
        </p>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
          <Star className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">لا توجد تقييمات</h3>
          <p className="text-white/60">لم تقم بكتابة أي تقييمات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                showProduct={true}
                showActions={true}
                onEdit={() => setEditingReviewId(review._id)}
                onDelete={() => {
                  if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
                    deleteReview.mutate(review._id);
                  }
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

