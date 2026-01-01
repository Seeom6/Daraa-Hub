'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ShieldOff, Download } from 'lucide-react';
import { useUsers, useSuspendUser, useUnsuspendUser, useBanUser } from '@/features/admin/hooks/useUsers';
import { UserRole, UserStatus, type User } from '@/features/admin/types/user.types';
import UsersFilters from '@/features/admin/components/users/UsersFilters';
import UsersTable from '@/features/admin/components/users/UsersTable';
import UsersPagination from '@/features/admin/components/users/UsersPagination';
import SuspendUserModal from '@/features/admin/components/users/SuspendUserModal';
import UnsuspendUserModal from '@/features/admin/components/users/UnsuspendUserModal';
import BanUserModal from '@/features/admin/components/users/BanUserModal';

export default function UsersPage() {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | 'all'>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Build API params
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: usersPerPage,
    };

    if (selectedRole !== 'all') {
      params.role = selectedRole;
    }

    // Map UI status to API filters
    if (selectedStatus === UserStatus.ACTIVE) {
      params.isActive = true;
      // Note: Backend doesn't have isSuspended filter in GET /admin/users
      // We'll filter on client side
    }

    return params;
  }, [currentPage, selectedRole, selectedStatus]);

  // Fetch users
  const { data, isLoading, error } = useUsers(apiParams);

  // Mutations
  const suspendMutation = useSuspendUser();
  const unsuspendMutation = useUnsuspendUser();
  const banMutation = useBanUser();

  // Client-side filtering for search and status
  const filteredUsers = useMemo(() => {
    if (!data?.data?.users) return [];

    let users = data.data.users;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.phone.includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    }

    // Status filter (client-side since backend doesn't support it directly)
    if (selectedStatus !== 'all') {
      users = users.filter((user) => {
        if (selectedStatus === UserStatus.ACTIVE) {
          return !user.isSuspended;
        } else if (selectedStatus === UserStatus.SUSPENDED) {
          return user.isSuspended && user.suspensionExpiresAt !== null;
        } else if (selectedStatus === UserStatus.BANNED) {
          return user.isSuspended && user.suspensionExpiresAt === null;
        }
        return true;
      });
    }

    return users;
  }, [data, searchQuery, selectedStatus]);

  // Handlers
  const handleToggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u._id));
    }
  };

  const handleSuspendClick = (user: User) => {
    setSelectedUser(user);
    setShowSuspendModal(true);
  };

  const handleUnsuspendClick = (user: User) => {
    setSelectedUser(user);
    setShowUnsuspendModal(true);
  };

  const handleBanClick = (user: User) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleSuspendConfirm = (payload: any) => {
    if (!selectedUser) return;
    suspendMutation.mutate(
      { id: selectedUser._id, payload },
      {
        onSuccess: () => {
          setShowSuspendModal(false);
          setSelectedUser(null);
        },
      }
    );
  };

  const handleUnsuspendConfirm = (payload: any) => {
    if (!selectedUser) return;
    unsuspendMutation.mutate(
      { id: selectedUser._id, payload },
      {
        onSuccess: () => {
          setShowUnsuspendModal(false);
          setSelectedUser(null);
        },
      }
    );
  };

  const handleBanConfirm = (payload: any) => {
    if (!selectedUser) return;
    banMutation.mutate(
      { id: selectedUser._id, payload },
      {
        onSuccess: () => {
          setShowBanModal(false);
          setSelectedUser(null);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            إدارة المستخدمين
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض وإدارة جميع المستخدمين في النظام
          </p>
        </div>

        {/* Filters */}
        <UsersFilters
          searchQuery={searchQuery}
          selectedRole={selectedRole}
          selectedStatus={selectedStatus}
          onSearchChange={setSearchQuery}
          onRoleChange={setSelectedRole}
          onStatusChange={setSelectedStatus}
        />

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                تم تحديد {selectedUsers.length} مستخدم
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors flex items-center gap-2">
                  <ShieldOff className="w-4 h-4" />
                  تعليق المحددين
                </button>
                <button className="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  تصدير
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل المستخدمين...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center">
            <p className="text-red-600 dark:text-red-400">
              حدث خطأ أثناء تحميل المستخدمين. يرجى المحاولة مرة أخرى.
            </p>
          </div>
        )}

        {/* Users Table */}
        {!isLoading && !error && filteredUsers.length > 0 && (
          <>
            <UsersTable
              users={filteredUsers}
              selectedUsers={selectedUsers}
              onToggleUserSelection={handleToggleUserSelection}
              onToggleSelectAll={handleToggleSelectAll}
              onSuspendClick={handleSuspendClick}
              onUnsuspendClick={handleUnsuspendClick}
              onBanClick={handleBanClick}
            />

            {/* Pagination */}
            <div className="mt-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700">
              <UsersPagination
                currentPage={currentPage}
                totalPages={data?.data?.totalPages || 1}
                totalItems={data?.data?.total || 0}
                itemsPerPage={usersPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredUsers.length === 0 && (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">لا يوجد مستخدمين</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUser && (
        <>
          <SuspendUserModal
            user={selectedUser}
            isOpen={showSuspendModal}
            onClose={() => {
              setShowSuspendModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleSuspendConfirm}
            isLoading={suspendMutation.isPending}
          />

          <UnsuspendUserModal
            user={selectedUser}
            isOpen={showUnsuspendModal}
            onClose={() => {
              setShowUnsuspendModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleUnsuspendConfirm}
            isLoading={unsuspendMutation.isPending}
          />

          <BanUserModal
            user={selectedUser}
            isOpen={showBanModal}
            onClose={() => {
              setShowBanModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleBanConfirm}
            isLoading={banMutation.isPending}
          />
        </>
      )}
    </div>
  );
}

