'use client';

import { UserPlus, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

export interface FollowButtonProps {
  storeId: string;
  isFollowing: boolean;
  followersCount: number;
  onFollow: () => void;
  onUnfollow: () => void;
}

export function FollowButton({
  isFollowing,
  followersCount,
  onFollow,
  onUnfollow,
}: FollowButtonProps) {
  const handleClick = () => {
    if (isFollowing) {
      onUnfollow();
    } else {
      onFollow();
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
        isFollowing
          ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
          : 'bg-primary text-white hover:bg-primary/90'
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-5 h-5" />
          <span>متابَع</span>
        </>
      ) : (
        <>
          <UserPlus className="w-5 h-5" />
          <span>متابعة</span>
        </>
      )}
      <span className="text-sm opacity-80">
        ({followersCount >= 1000 ? `${(followersCount / 1000).toFixed(1)}K` : followersCount})
      </span>
    </motion.button>
  );
}

