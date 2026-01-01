'use client';

/**
 * Verification Details Card Component
 * Displays detailed information about a verification request
 */

import { User, Building, FileText, Calendar, MapPin, Phone, Mail, CreditCard, Image as ImageIcon } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { VerificationRequest } from '../../types/stores.types';

interface VerificationDetailsCardProps {
  request: VerificationRequest;
}

export function VerificationDetailsCard({ request }: VerificationDetailsCardProps) {
  // Helper function to get applicant name
  const getApplicantName = () => {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'غير محدد';
      return date.toLocaleDateString('ar-SY-u-nu-latn', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'غير محدد';
    }
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

  return (
    <div className="space-y-6">
      {/* Request Status */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">حالة الطلب</h3>
            {getStatusBadge(request.status)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>تاريخ التقديم: {formatDate(request.submittedAt || request.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span>المقدم: {getApplicantName()}</span>
            </div>
            {request.reviewedAt && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>تاريخ المراجعة: {formatDate(request.reviewedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">المعلومات الشخصية</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">الاسم الكامل</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {getApplicantName()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">نوع المقدم</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.applicantType === 'store_owner' ? 'صاحب متجر' : 'سائق توصيل'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">رقم الهوية</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.personalInfo?.nationalId || 'غير محدد'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">تاريخ الميلاد</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.personalInfo?.dateOfBirth || 'غير محدد'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">المدينة</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.personalInfo?.city || 'غير محدد'}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">العنوان</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.personalInfo?.address || 'غير محدد'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Business Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">معلومات العمل</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">اسم العمل</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.businessInfo?.businessName || 'غير محدد'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">نوع العمل</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.businessInfo?.businessType || 'غير محدد'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">رقم الهاتف</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.businessInfo?.businessPhone || 'غير محدد'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">الرقم الضريبي</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.businessInfo?.taxId || 'غير محدد'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">السجل التجاري</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.businessInfo?.commercialRegister || 'غير محدد'}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">عنوان العمل</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.businessInfo?.businessAddress || 'غير محدد'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Store Images */}
      {request.businessInfo?.storeImages && request.businessInfo.storeImages.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                صور المحل التجاري ({request.businessInfo.storeImages.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {request.businessInfo.storeImages.map((imageUrl, index) => (
                <a
                  key={index}
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 hover:ring-2 hover:ring-blue-500 transition-all"
                >
                  <img
                    src={imageUrl}
                    alt={`صورة المحل ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-store.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Documents & PDFs */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              المستندات والملفات
            </h3>
          </div>

          <div className="space-y-4">
            {/* Business License PDF */}
            {request.businessInfo?.businessLicensePdf && (
              <a
                href={request.businessInfo.businessLicensePdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">رخصة العمل (PDF)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">انقر للعرض</p>
                </div>
              </a>
            )}

            {/* Tax Certificate PDF */}
            {request.businessInfo?.taxCertificatePdf && (
              <a
                href={request.businessInfo.taxCertificatePdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">الشهادة الضريبية (PDF)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">انقر للعرض</p>
                </div>
              </a>
            )}

            {/* Other Documents */}
            {request.documents && request.documents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                {request.documents.map((doc) => (
                  <a
                    key={doc._id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(doc.uploadedDate)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* No documents message */}
            {!request.businessInfo?.businessLicensePdf &&
             !request.businessInfo?.taxCertificatePdf &&
             (!request.documents || request.documents.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا توجد مستندات</p>
            )}
          </div>
        </div>
      </Card>

      {/* Admin Notes / Rejection Reason */}
      {(request.adminNotes || request.rejectionReason || request.requestedInfo) && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ملاحظات الإدارة
            </h3>
            {request.adminNotes && (
              <div className="mb-3">
                <label className="text-sm text-gray-500 dark:text-gray-400">ملاحظات</label>
                <p className="text-gray-900 dark:text-white">{request.adminNotes}</p>
              </div>
            )}
            {request.rejectionReason && (
              <div className="mb-3">
                <label className="text-sm text-red-500">سبب الرفض</label>
                <p className="text-gray-900 dark:text-white">{request.rejectionReason}</p>
              </div>
            )}
            {request.requestedInfo && (
              <div>
                <label className="text-sm text-purple-500">معلومات مطلوبة</label>
                <p className="text-gray-900 dark:text-white">{request.requestedInfo}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

