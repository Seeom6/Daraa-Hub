/**
 * Tier Helper Functions
 * Utility functions for loyalty tier calculations
 */

import type { LoyaltyTier, NextTierInfo } from '../types';

/**
 * Get tier from loyalty points
 */
export const getTierFromPoints = (points: number): LoyaltyTier => {
  if (points >= 10000) return 'platinum';
  if (points >= 5000) return 'gold';
  if (points >= 1000) return 'silver';
  return 'bronze';
};

/**
 * Get discount percentage from loyalty points
 */
export const getDiscountFromPoints = (points: number): number => {
  if (points >= 10000) return 15;
  if (points >= 5000) return 10;
  if (points >= 1000) return 5;
  return 0;
};

/**
 * Get next tier information
 */
export const getNextTierInfo = (points: number): NextTierInfo | null => {
  if (points >= 10000) return null; // Already at max tier
  if (points >= 5000) return { tier: 'platinum', pointsNeeded: 10000 - points };
  if (points >= 1000) return { tier: 'gold', pointsNeeded: 5000 - points };
  return { tier: 'silver', pointsNeeded: 1000 - points };
};

/**
 * Calculate progress to next tier (0-100)
 */
export const calculateTierProgress = (points: number): number => {
  const currentTier = getTierFromPoints(points);
  const nextTier = getNextTierInfo(points);

  if (!nextTier) return 100; // Already at max tier

  const tierRanges: Record<LoyaltyTier, { min: number; max: number }> = {
    bronze: { min: 0, max: 999 },
    silver: { min: 1000, max: 4999 },
    gold: { min: 5000, max: 9999 },
    platinum: { min: 10000, max: Infinity },
  };

  const currentRange = tierRanges[currentTier];
  const range = currentRange.max - currentRange.min + 1;
  const current = points - currentRange.min;

  return Math.min(100, (current / range) * 100);
};

/**
 * Format points as currency (100 points = 1 SYP)
 */
export const pointsToCurrency = (points: number): number => {
  return points / 100;
};

/**
 * Format currency to points (1 SYP = 100 points)
 */
export const currencyToPoints = (amount: number): number => {
  return amount * 100;
};

