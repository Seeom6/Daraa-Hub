'use client';

import { Star } from 'lucide-react';
import { motion } from 'motion/react';

export interface RatingBreakdownProps {
  ratings: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalReviews: number;
  averageRating: number;
}

export function RatingBreakdown({ ratings, totalReviews, averageRating }: RatingBreakdownProps) {
  const ratingLevels = [5, 4, 3, 2, 1] as const;

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      {/* Average Rating */}
      <div className="text-center mb-6 pb-6 border-b border-white/10">
        <div className="text-5xl font-bold text-white mb-2">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= Math.round(averageRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-white/40'
              }`}
            />
          ))}
        </div>
        <p className="text-white/60 text-sm">
          {totalReviews} {totalReviews === 1 ? 'تقييم' : 'تقييمات'}
        </p>
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-3">
        {ratingLevels.map((level, index) => {
          const count = ratings[level];
          const percentage = getPercentage(count);

          return (
            <motion.div
              key={level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              {/* Star Level */}
              <div className="flex items-center gap-1 w-12">
                <span className="text-white/80 text-sm">{level}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>

              {/* Progress Bar */}
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  className="h-full bg-yellow-400 rounded-full"
                />
              </div>

              {/* Percentage */}
              <div className="w-12 text-right">
                <span className="text-white/60 text-sm">{percentage.toFixed(0)}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

