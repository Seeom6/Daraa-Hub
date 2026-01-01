'use client';

/**
 * Verification Stats Cards Component
 * Displays statistics cards for verification requests overview
 */

import { motion } from 'framer-motion';
import { Clock, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import { Skeleton } from '@/components/common';

interface VerificationStatsCardsProps {
  statistics?: {
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
    info_required: number;
    total: number;
  };
  isLoading?: boolean;
}

export function VerificationStatsCards({ statistics, isLoading }: VerificationStatsCardsProps) {
  const stats = [
    {
      title: 'قيد الانتظار',
      value: statistics?.pending || 0,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'قيد المراجعة',
      value: statistics?.under_review || 0,
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'تمت الموافقة',
      value: statistics?.approved || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'مرفوضة',
      value: statistics?.rejected || 0,
      icon: XCircle,
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'معلومات مطلوبة',
      value: statistics?.info_required || 0,
      icon: AlertCircle,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-xl ${stat.bgColor} mb-3`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
              </div>
              
              {/* Gradient Background */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
              />
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

