'use client';

import Image from 'next/image';
import { Store, Star, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { Store as StoreType } from '@/features/shared/types/store.types';
import { FollowButton } from './FollowButton';

export interface StoreHeaderProps {
  store: StoreType;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export function StoreHeader({ store, isFollowing = false, onFollow, onUnfollow }: StoreHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
    >
      {/* Cover Image */}
      {store.coverImage && (
        <div className="relative w-full h-48 bg-gradient-to-br from-primary/20 to-purple-500/20">
          <Image
            src={store.coverImage}
            alt={store.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Store Info */}
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 -mt-12 border-4 border-gray-900">
            {store.logo ? (
              <Image
                src={store.logo}
                alt={store.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="w-12 h-12 text-white/40" />
              </div>
            )}
          </div>

          {/* Info & Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-white truncate">
                    {store.name}
                  </h1>
                  {store.isVerified && (
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  )}
                </div>

                {/* Rating & Category */}
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold">{store.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-white/60">
                    ({store.reviewsCount} {store.reviewsCount === 1 ? 'تقييم' : 'تقييمات'})
                  </span>
                  {store.category && (
                    <>
                      <span className="text-white/40">•</span>
                      <span className="text-white/60">{store.category}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Follow Button */}
              {onFollow && onUnfollow && (
                <FollowButton
                  storeId={store._id}
                  isFollowing={isFollowing}
                  followersCount={store.followersCount}
                  onFollow={onFollow}
                  onUnfollow={onUnfollow}
                />
              )}
            </div>

            {/* Description */}
            {store.description && (
              <p className="text-white/80 mt-4">{store.description}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

