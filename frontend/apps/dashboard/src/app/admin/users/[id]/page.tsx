'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  useUserDetails,
  useUserStatistics,
  useUserActivity,
  useUserOrders,
  useSendUserNotification,
  useSuspendUser,
  useUnsuspendUser,
  useBanUser,
} from '@/features/admin/hooks/useUserDetails';
import {
  UserDetailsHeader,
  UserInfoCard,
  UserStatisticsCards,
  UserActivityTab,
  UserOrdersTab,
  SendNotificationModal,
} from '@/features/admin/components/user-details';
import { SuspendUserModal, UnsuspendUserModal, BanUserModal } from '@/features/admin/components/users';

type TabType = 'overview' | 'activity' | 'orders';

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params.id as string;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Queries
  const { data: userResponse, isLoading: isLoadingUser } = useUserDetails(userId);
  const { data: statsResponse, isLoading: isLoadingStats } = useUserStatistics(userId);
  const { data: activityResponse, isLoading: isLoadingActivity } = useUserActivity(userId);
  const { data: ordersResponse, isLoading: isLoadingOrders } = useUserOrders(userId, 1);

  // Mutations
  const suspendMutation = useSuspendUser();
  const unsuspendMutation = useUnsuspendUser();
  const banMutation = useBanUser();
  const sendNotificationMutation = useSendUserNotification(userId);

  // Data
  const user = userResponse?.data;
  const statistics = statsResponse?.data;
  const activities = activityResponse?.data || [];
  const orders = ordersResponse?.data?.orders || [];

  // Handlers
  const handleSuspend = (data: { reason: string; durationDays?: number; notifyUser?: boolean }) => {
    suspendMutation.mutate(
      { id: userId, payload: data },
      {
        onSuccess: () => {
          setShowSuspendModal(false);
        },
      }
    );
  };

  const handleUnsuspend = (data: { reason: string; notifyUser?: boolean }) => {
    unsuspendMutation.mutate(
      { id: userId, payload: data },
      {
        onSuccess: () => {
          setShowUnsuspendModal(false);
        },
      }
    );
  };

  const handleBan = (data: { reason: string }) => {
    banMutation.mutate(
      { id: userId, payload: data },
      {
        onSuccess: () => {
          setShowBanModal(false);
        },
      }
    );
  };

  const handleSendNotification = (data: { title: string; message: string; type?: string }) => {
    sendNotificationMutation.mutate(data, {
      onSuccess: () => {
        setShowNotificationModal(false);
      },
    });
  };

  // Loading State
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">فشل تحميل بيانات المستخدم</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
      {/* Header */}
      <UserDetailsHeader
        user={user}
        onSuspend={() => setShowSuspendModal(true)}
        onUnsuspend={() => setShowUnsuspendModal(true)}
        onBan={() => setShowBanModal(true)}
        onSendNotification={() => setShowNotificationModal(true)}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <UserInfoCard user={user} />

        {/* Statistics Cards */}
        {statistics && (
          <UserStatisticsCards statistics={statistics} isLoading={isLoadingStats} />
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Tabs Header */}
          <div className="border-b border-gray-200 dark:border-slate-700">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                نظرة عامة
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'activity'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                سجل النشاط
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                الطلبات
              </button>
            </div>
          </div>

          {/* Tabs Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    المعلومات الشخصية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الاسم الكامل</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.fullName || 'غير محدد'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">رقم الهاتف</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.phone}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">البريد الإلكتروني</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.email || 'غير محدد'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الدور</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <UserActivityTab activities={activities} isLoading={isLoadingActivity} />
            )}

            {activeTab === 'orders' && (
              <UserOrdersTab orders={orders} isLoading={isLoadingOrders} />
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <SuspendUserModal
        user={user}
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={handleSuspend}
        isLoading={suspendMutation.isPending}
      />

      <UnsuspendUserModal
        user={user}
        isOpen={showUnsuspendModal}
        onClose={() => setShowUnsuspendModal(false)}
        onConfirm={handleUnsuspend}
        isLoading={unsuspendMutation.isPending}
      />

      <BanUserModal
        user={user}
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleBan}
        isLoading={banMutation.isPending}
      />

      <SendNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSend={handleSendNotification}
        isLoading={sendNotificationMutation.isPending}
      />
    </div>
  );
}
