'use client';

/**
 * Verification Requests Table Component
 * Displays verification requests list in a table format
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, FileText, User, Truck } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { Skeleton } from '@/components/common';
import type { VerificationRequest } from '../../types/stores.types';

interface VerificationRequestsTableProps {
  requests: VerificationRequest[];
  isLoading?: boolean;
}

export function VerificationRequestsTable({ requests, isLoading }: VerificationRequestsTableProps) {
  // Helper function to get applicant name
  const getApplicantName = (request: VerificationRequest) => {
    // First try to get from populated accountId
    if (typeof request.accountId === 'object' && request.accountId.fullName) {
      return request.accountId.fullName;
    }
    // Fallback to personalInfo
    if (request.personalInfo?.fullName) {
      return request.personalInfo.fullName;
    }
    return 'غير محدد';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', variant: 'warning' as const },
      under_review: { label: 'قيد المراجعة', variant: 'info' as const },
      approved: { label: 'موافق عليه', variant: 'success' as const },
      rejected: { label: 'مرفوض', variant: 'error' as const },
      info_required: { label: 'معلومات مطلوبة', variant: 'default' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getApplicantTypeBadge = (type: string) => {
    const Icon = type === 'store_owner' ? User : Truck;
    const label = type === 'store_owner' ? 'صاحب متجر' : 'سائق توصيل';
    const color = type === 'store_owner' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400';
    
    return (
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm">{label}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <div className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            لا توجد طلبات توثيق
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            لم يتم العثور على أي طلبات توثيق مطابقة للفلاتر المحددة
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                مقدم الطلب
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                النوع
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                اسم العمل
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                المستندات
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                تاريخ التقديم
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {requests.map((request, index) => (
              <motion.tr
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/admin/stores/verification/${request._id}`}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getApplicantName(request)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {request.personalInfo?.city || 'غير محدد'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">{getApplicantTypeBadge(request.applicantType)}</td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {request.businessInfo?.businessName || 'غير محدد'}
                  </p>
                </td>
                <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {request.documents?.length || 0} مستند
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(request.submittedAt)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/stores/verification/${request._id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye className="w-4 h-4" />
                    عرض التفاصيل
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

