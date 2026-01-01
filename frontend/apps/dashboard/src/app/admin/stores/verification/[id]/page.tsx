'use client';

/**
 * Verification Request Details Page
 * Detailed view of a single verification request with review actions
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/common';
import {
  VerificationDetailsCard,
  ApproveVerificationModal,
  RejectVerificationModal,
  RequestInfoModal,
} from '@/features/admin/components/stores';
import {
  useVerificationRequest,
  useReviewVerification,
} from '@/features/admin/hooks/useVerification';

export default function VerificationRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.id as string;

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRequestInfoModalOpen, setIsRequestInfoModalOpen] = useState(false);

  // Queries
  const { data: requestData, isLoading, error, refetch } = useVerificationRequest(requestId);

  // Helper function to get applicant name
  const getApplicantName = (request: any) => {
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

  // Mutations
  const reviewVerification = useReviewVerification();

  const handleApprove = (notes?: string) => {
    reviewVerification.mutate(
      {
        requestId,
        data: { action: 'approve', notes },
      },
      {
        onSuccess: () => {
          setIsApproveModalOpen(false);
          router.push('/admin/stores/verification');
        },
      }
    );
  };

  const handleReject = (reason: string) => {
    reviewVerification.mutate(
      {
        requestId,
        data: { action: 'reject', rejectionReason: reason },
      },
      {
        onSuccess: () => {
          setIsRejectModalOpen(false);
          router.push('/admin/stores/verification');
        },
      }
    );
  };

  const handleRequestInfo = (requestedInfo: string, missingDocuments?: string[]) => {
    reviewVerification.mutate(
      {
        requestId,
        data: { action: 'request_info', infoRequired: requestedInfo },
      },
      {
        onSuccess: () => {
          setIsRequestInfoModalOpen(false);
          refetch();
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !requestData?.data) {
    return <ErrorState message="فشل تحميل تفاصيل الطلب" onRetry={refetch} />;
  }

  const request = requestData.data;
  const canReview = ['pending', 'under_review', 'info_required'].includes(request.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                تفاصيل طلب التوثيق
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                مقدم من: {getApplicantName(request)}
              </p>
            </div>

            {canReview && (
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => setIsApproveModalOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  الموافقة
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsRequestInfoModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  طلب معلومات
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  رفض
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <VerificationDetailsCard request={request} />
        </motion.div>
      </div>

      {/* Modals */}
      <ApproveVerificationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
        isLoading={reviewVerification.isPending}
        applicantName={getApplicantName(request)}
      />

      <RejectVerificationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        isLoading={reviewVerification.isPending}
        applicantName={getApplicantName(request)}
      />

      <RequestInfoModal
        isOpen={isRequestInfoModalOpen}
        onClose={() => setIsRequestInfoModalOpen(false)}
        onConfirm={handleRequestInfo}
        isLoading={reviewVerification.isPending}
        applicantName={request.personalInfo?.fullName}
      />
    </div>
  );
}

