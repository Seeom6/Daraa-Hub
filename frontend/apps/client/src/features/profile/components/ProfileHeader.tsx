/**
 * ProfileHeader Component
 * Displays user profile header with avatar, name, and tier badge
 */

'use client';

import { memo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Edit, ArrowLeft, Store, Sparkles, Clock, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getMyVerificationStatus } from '@/features/vendor/services/vendor.service';
import type { ProfileData, TierInfo } from '../types';
import type { VerificationStatus } from '@/features/vendor/types/vendor.types';

interface ProfileHeaderProps {
  profile?: ProfileData;
  currentTier?: TierInfo;
  currentDiscount?: number;
  onBack?: () => void;
  onBecomeVendor?: () => void;
}

export const ProfileHeader = memo(function ProfileHeader({
  profile,
  currentTier,
  currentDiscount,
  onBack,
  onBecomeVendor,
}: ProfileHeaderProps) {
  const { account } = profile;
  const TierIcon = currentTier.icon;
  const [vendorStatus, setVendorStatus] = useState<VerificationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    loadVendorStatus();
  }, []);

  const loadVendorStatus = async () => {
    try {
      const status = await getMyVerificationStatus();
      setVendorStatus(status);
    } catch (error) {
      console.error('Error loading vendor status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 pt-16 pb-24 sm:pb-32">
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="mb-6 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للمتجر
          </Button>
        )}

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-white/30 rounded-full blur-lg" />
            <Avatar className="relative w-24 h-24 sm:w-32 sm:h-32 border-4 border-white/50 shadow-2xl">
              <AvatarImage src={''} alt={account.fullName} />
              <AvatarFallback className="text-2xl sm:text-3xl">
                {account.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-white text-blue-600 hover:bg-white shadow-lg"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </motion.div>

          <div className="flex-1 text-center sm:text-right">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-2xl sm:text-3xl lg:text-4xl mb-2"
            >
              {account.fullName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/90 text-sm sm:text-base mb-1"
            >
              {account.email || account.phone}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 text-sm"
            >
              {account.phone}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start"
            >
              <Badge className={`bg-gradient-to-r ${currentTier.color} text-white border-white/30 backdrop-blur-sm shadow-lg`}>
                <TierIcon className="w-4 h-4 ml-1" />
                {currentTier.name}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                خصم {currentDiscount}%
              </Badge>
            </motion.div>
          </div>

          {/* Create Store Button / Status */}
          {onBecomeVendor && !loadingStatus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              {!vendorStatus ? (
                // No application - Show "إضافة متجري"
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-white/90 shadow-2xl gap-2 relative overflow-hidden group"
                  onClick={onBecomeVendor}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Store className="w-5 h-5" />
                  <span className="relative">إضافة متجري</span>
                  <Sparkles className="w-4 h-4 relative" />
                </Button>
              ) : vendorStatus.status === 'approved' ? (
                // Approved - Show "لوحة التحكم"
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-white/90 shadow-2xl gap-2 relative overflow-hidden group"
                  onClick={() => {
                    // Get store ID (which is the same as account ID for store owners)
                    const storeId = account._id || account.id;
                    // Redirect to dashboard with storeId
                    // The dashboard will use the existing cookies for authentication
                    window.location.href = `http://localhost:3002/dashboard?storeId=${storeId}`;
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="relative">لوحة التحكم</span>
                </Button>
              ) : vendorStatus.status === 'rejected' ? (
                // Rejected - Show "إعادة التقديم"
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-white/90 shadow-2xl gap-2 relative overflow-hidden group"
                  onClick={onBecomeVendor}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Store className="w-5 h-5" />
                  <span className="relative">إعادة التقديم</span>
                </Button>
              ) : (
                // Pending/Under Review/Info Required - Show "حالة الطلب"
                <Button
                  size="lg"
                  className="bg-white text-yellow-600 hover:bg-white/90 shadow-2xl gap-2 relative overflow-hidden group"
                  onClick={() => window.location.href = '/store-under-review'}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Clock className="w-5 h-5" />
                  <span className="relative">حالة الطلب</span>
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});

