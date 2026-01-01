/**
 * ProfilePage Component
 * Main profile page with tabs and sections
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useProfile, useOrders } from '../../hooks';
import { ProfileHeader, StatsCards, OrdersList, LoyaltySection } from '../../components';
import { TIERS } from '../../constants';
import { getTierFromPoints, getDiscountFromPoints } from '../../utils';
import type { ProfileStats } from '../../types';

export function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data with React Query
  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useProfile();
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders({ limit: 10 });

  // Calculate stats (memoized for performance) - MUST be before any early returns
  const stats: ProfileStats = useMemo(() => {
    if (!profileData?.profile) {
      return {
        totalOrders: 0,
        loyaltyPoints: 0,
        wishlistCount: 0,
        currentTier: 'bronze' as const,
        currentDiscount: 0,
      };
    }

    const currentTier = getTierFromPoints(profileData.profile.loyaltyPoints);
    return {
      totalOrders: ordersData?.meta.total || 0,
      loyaltyPoints: profileData.profile.loyaltyPoints,
      wishlistCount: profileData.profile.wishlist?.length || 0,
      currentTier,
      currentDiscount: getDiscountFromPoints(profileData.profile.loyaltyPoints),
    };
  }, [profileData, ordersData]);

  const currentTier = TIERS[stats.currentTier];

  // Callbacks (memoized for performance) - MUST be before any early returns
  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleBecomeVendor = useCallback(() => {
    router.push('/become-vendor');
  }, [router]);

  const handleOrderClick = useCallback((orderId: string) => {
    router.push(`/orders/${orderId}`);
  }, [router]);

  // Loading state
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (profileError) {
    // Check if it's an authentication error
    const isAuthError = (profileError as any)?.response?.status === 401;

    if (isAuthError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="text-center">
            <ErrorMessage message="يجب تسجيل الدخول أولاً للوصول إلى الملف الشخصي" variant="card" />
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <ErrorMessage message="حدث خطأ أثناء تحميل الملف الشخصي" variant="card" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Check if profile is null (user has account but no customer profile)
  if (!profileData.profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ملف العميل غير موجود
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              حسابك موجود ولكن لم يتم إنشاء ملف تعريف العميل بعد. يرجى التواصل مع الدعم الفني لحل هذه المشكلة.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                العودة للصفحة الرئيسية
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                إعادة المحاولة
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                معلومات الحساب:
              </p>
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300 mt-1">
                {profileData.account.phone}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {profileData.account.fullName}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Profile Header */}
      <ProfileHeader
        profile={profileData}
        currentTier={currentTier}
        currentDiscount={stats.currentDiscount}
        onBack={handleBack}
        onBecomeVendor={handleBecomeVendor}
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} tierName={currentTier.name} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex h-auto p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 shadow-lg">
            <TabsTrigger
              value="overview"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">طلباتي</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <LoyaltySection currentPoints={stats.loyaltyPoints} currentTier={stats.currentTier} />

            <div className="grid lg:grid-cols-2 gap-6">
              <OrdersList
                orders={ordersData?.data || []}
                isLoading={isOrdersLoading}
                title="آخر الطلبات"
                description="آخر 3 طلبات قمت بها"
                onOrderClick={handleOrderClick}
                compact
                maxItems={3}
              />
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <OrdersList
              orders={ordersData?.data || []}
              isLoading={isOrdersLoading}
              title="جميع الطلبات"
              description="تاريخ طلباتك الكامل"
              onOrderClick={handleOrderClick}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">الإعدادات قيد التطوير</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

