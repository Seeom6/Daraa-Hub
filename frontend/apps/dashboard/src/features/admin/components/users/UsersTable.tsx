'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Eye, ShieldOff, ShieldCheck, Ban, CheckSquare } from 'lucide-react';
import type { User } from '../../types/user.types';
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  USER_ROLE_COLORS,
  USER_STATUS_COLORS,
  UserStatus,
} from '../../types/user.types';

interface UsersTableProps {
  users: User[];
  selectedUsers: string[];
  onToggleUserSelection: (userId: string) => void;
  onToggleSelectAll: () => void;
  onSuspendClick: (user: User) => void;
  onUnsuspendClick: (user: User) => void;
  onBanClick: (user: User) => void;
}

export default function UsersTable({
  users,
  selectedUsers,
  onToggleUserSelection,
  onToggleSelectAll,
  onSuspendClick,
  onUnsuspendClick,
  onBanClick,
}: UsersTableProps) {
  const router = useRouter();

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-4 text-right">
                <button
                  onClick={onToggleSelectAll}
                  className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-blue-500 transition-colors"
                >
                  {isAllSelected && <CheckSquare className="w-5 h-5 text-blue-600" />}
                </button>
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                المستخدم
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                الهاتف
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                البريد الإلكتروني
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                الدور
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                الحالة
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                تاريخ الانضمام
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {users.map((user) => {
              const isSelected = selectedUsers.includes(user._id);
              const userStatus = user.isSuspended
                ? user.suspensionExpiresAt === null
                  ? UserStatus.BANNED
                  : UserStatus.SUSPENDED
                : UserStatus.ACTIVE;

              return (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.action-button')) return;
                    router.push(`/admin/users/${user._id}`);
                  }}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleUserSelection(user._id)}
                      className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-blue-500 transition-colors"
                    >
                      {isSelected && <CheckSquare className="w-5 h-5 text-blue-600" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.fullName || 'غير محدد'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.email || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${USER_ROLE_COLORS[user.role]}`}>
                      {USER_ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${USER_STATUS_COLORS[userStatus]}`}>
                      {USER_STATUS_LABELS[userStatus]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 action-button">
                      <button
                        onClick={() => router.push(`/admin/users/${user._id}`)}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {userStatus === UserStatus.ACTIVE && (
                        <button
                          onClick={() => onSuspendClick(user)}
                          className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                          title="تعليق"
                        >
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      )}
                      {userStatus === UserStatus.SUSPENDED && (
                        <button
                          onClick={() => onUnsuspendClick(user)}
                          className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          title="إلغاء التعليق"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                      {userStatus !== UserStatus.BANNED && (
                        <button
                          onClick={() => onBanClick(user)}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="حظر"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

