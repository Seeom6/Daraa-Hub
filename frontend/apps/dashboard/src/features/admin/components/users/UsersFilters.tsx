'use client';

import { Search, Filter, Calendar, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole, UserStatus } from '../../types/user.types';

interface UsersFiltersProps {
  searchQuery: string;
  selectedRole: UserRole | 'all';
  selectedStatus: UserStatus | 'all';
  onSearchChange: (value: string) => void;
  onRoleChange: (value: UserRole | 'all') => void;
  onStatusChange: (value: UserStatus | 'all') => void;
}

export default function UsersFilters({
  searchQuery,
  selectedRole,
  selectedStatus,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: UsersFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6 mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث بالاسم، الهاتف، أو البريد..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole | 'all')}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white focus:outline-none transition-all appearance-none"
          >
            <option value="all">جميع الأدوار</option>
            <option value={UserRole.CUSTOMER}>عميل</option>
            <option value={UserRole.STORE_OWNER}>صاحب متجر</option>
            <option value={UserRole.COURIER}>سائق</option>
            <option value={UserRole.ADMIN}>مدير</option>
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as UserStatus | 'all')}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white focus:outline-none transition-all appearance-none"
          >
            <option value="all">جميع الحالات</option>
            <option value={UserStatus.ACTIVE}>نشط</option>
            <option value={UserStatus.SUSPENDED}>معلق</option>
            <option value={UserStatus.BANNED}>محظور</option>
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Date Range - Placeholder */}
        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="تحديد الفترة الزمنية..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
            readOnly
          />
        </div>
      </div>
    </motion.div>
  );
}

