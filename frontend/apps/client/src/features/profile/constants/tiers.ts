/**
 * Tier Constants
 * Configuration for loyalty tiers
 */

import { Award, Star, Trophy, Crown } from 'lucide-react';
import type { LoyaltyTier, TierInfo } from '../types';

/**
 * Tier Configuration
 * Defines all loyalty tiers and their benefits
 */
export const TIERS: Record<LoyaltyTier, TierInfo> = {
  bronze: {
    name: 'برونزي',
    icon: Award,
    color: 'from-amber-700 to-amber-500',
    min: 0,
    max: 999,
    discount: '0%',
    benefits: 'المستوى الافتراضي للعملاء الجدد',
  },
  silver: {
    name: 'فضي',
    icon: Star,
    color: 'from-gray-400 to-gray-300',
    min: 1000,
    max: 4999,
    discount: '5%',
    benefits: 'خصم 5% على جميع المشتريات',
  },
  gold: {
    name: 'ذهبي',
    icon: Trophy,
    color: 'from-yellow-500 to-yellow-300',
    min: 5000,
    max: 9999,
    discount: '10%',
    benefits: 'خصم 10% + شحن مجاني',
  },
  platinum: {
    name: 'بلاتيني',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    min: 10000,
    max: Infinity,
    discount: '15%',
    benefits: 'خصم 15% + شحن مجاني + دعم VIP',
  },
};

/**
 * Points Earning Rules
 */
export const POINTS_EARNING = {
  PER_CURRENCY: 1, // 1 point per 1 SYP spent
  REVIEW: 50, // 50 points for writing a review
  REFERRAL: 100, // 100 points for referring a friend
} as const;

/**
 * Points Redemption Rate
 */
export const POINTS_REDEMPTION_RATE = 100; // 100 points = 1 SYP

