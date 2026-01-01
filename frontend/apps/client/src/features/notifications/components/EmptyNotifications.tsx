'use client';

import { Bell } from 'lucide-react';
import { motion } from 'motion/react';

export function EmptyNotifications() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
        <Bell className="w-12 h-12 text-white/40" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">لا توجد إشعارات</h3>
      <p className="text-white/60">ليس لديك أي إشعارات في الوقت الحالي</p>
    </motion.div>
  );
}

