/**
 * LoyaltySection Component
 * Displays loyalty points and tier information
 */

'use client';

import { memo, useMemo } from 'react';
import { Star, Gift, Trophy, Award, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LoyaltyTier, TierInfo, NextTierInfo } from '../types';

interface LoyaltySectionProps {
  currentPoints?: number;
  currentTier?: LoyaltyTier;
}

const tiers: Record<LoyaltyTier, TierInfo> = {
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

export const LoyaltySection = memo(function LoyaltySection({
  currentPoints = 0,
  currentTier = 'bronze',
}: LoyaltySectionProps) {
  const tierInfo = tiers[currentTier];
  const TierIcon = tierInfo.icon;

  const nextTierInfo: NextTierInfo | null = useMemo(() => {
    if (currentPoints >= 10000) return null;
    if (currentPoints >= 5000) return { tier: 'platinum', pointsNeeded: 10000 - currentPoints };
    if (currentPoints >= 1000) return { tier: 'gold', pointsNeeded: 5000 - currentPoints };
    return { tier: 'silver', pointsNeeded: 1000 - currentPoints };
  }, [currentPoints]);

  const progress = useMemo(() => {
    if (!nextTierInfo) return 100;
    const currentTierMin = tierInfo.min;
    const nextTierMin = tiers[nextTierInfo.tier].min;
    const range = nextTierMin - currentTierMin;
    const current = currentPoints - currentTierMin;
    return (current / range) * 100;
  }, [currentPoints, tierInfo, nextTierInfo]);

  return (
    <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TierIcon className="w-5 h-5 text-purple-500" />
          مزايا مستوى {tierInfo.name}
        </CardTitle>
        <CardDescription>{tierInfo.benefits}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Points */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm">نقاط الولاء</p>
                <p className="text-2xl text-amber-600 dark:text-amber-400">
                  {(currentPoints || 0).toLocaleString('ar-SY')}
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 dark:text-gray-400">القيمة النقدية</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {((currentPoints || 0) / 100).toLocaleString('ar-SY')} ل.س
              </p>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTierInfo && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>التقدم للمستوى التالي</span>
                <span>{(nextTierInfo.pointsNeeded || 0).toLocaleString('ar-SY')} نقطة متبقية</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* All Tiers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(tiers).map((tier) => {
            const Icon = tier.icon;
            const isCurrentTier = tier.name === tierInfo.name;
            const isLocked = currentPoints < tier.min;

            return (
              <div
                key={tier.name}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isCurrentTier
                    ? `bg-gradient-to-br ${tier.color} border-white/50 text-white shadow-lg`
                    : isLocked
                    ? 'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-700 opacity-50'
                    : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 hover:border-purple-500'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <Icon className={`w-8 h-8 ${isCurrentTier ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  <div>
                    <p className={`text-sm mb-1 ${isCurrentTier ? 'text-white' : ''}`}>{tier.name}</p>
                    <p className={`text-xs ${isCurrentTier ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                      {(tier.min || 0).toLocaleString('ar-SY')}+ نقطة
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

