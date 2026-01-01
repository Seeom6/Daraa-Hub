/**
 * Offers List Page
 * Display and manage all offers for the store
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button, ConfirmDialog } from '@/components/ui';
import { OfferCard, OfferFilters } from '@/features/offers/components';
import { useOffers, useDeleteOffer } from '@/features/offers/hooks';
import type { OfferFilters as OfferFiltersType, Offer } from '@/features/offers/types';

export default function OffersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<OfferFiltersType>({
    page: 1,
    limit: 12,
  });
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  const { data, isLoading, error } = useOffers(filters);
  const deleteOffer = useDeleteOffer();

  const handleEdit = (offer: Offer) => {
    router.push(`/offers/${offer._id}/edit`);
  };

  const handleDelete = (offer: Offer) => {
    setOfferToDelete(offer);
  };

  const confirmDelete = async () => {
    if (offerToDelete) {
      await deleteOffer.mutateAsync(offerToDelete._id);
      setOfferToDelete(null);
    }
  };

  const handleView = (offer: Offer) => {
    router.push(`/offers/${offer._id}`);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            العروض الترويجية
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            إدارة العروض والخصومات الخاصة بمتجرك
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => router.push('/offers/create')}
        >
          إنشاء عرض جديد
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <OfferFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">حدث خطأ أثناء تحميل العروض</p>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">لا توجد عروض حالياً</p>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => router.push('/offers/create')}
          >
            إنشاء أول عرض
          </Button>
        </div>
      ) : (
        <>
          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data?.data.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.total > data.limit && (
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => handlePageChange((filters.page || 1) - 1)}
              >
                السابق
              </Button>

              <span className="text-gray-600 dark:text-gray-400">
                صفحة {filters.page} من {Math.ceil(data.total / data.limit)}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={(filters.page || 1) >= Math.ceil(data.total / data.limit)}
                onClick={() => handlePageChange((filters.page || 1) + 1)}
              >
                التالي
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!offerToDelete}
        onClose={() => setOfferToDelete(null)}
        onConfirm={confirmDelete}
        title="حذف العرض"
        message={`هل أنت متأكد من حذف العرض "${offerToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
        isLoading={deleteOffer.isPending}
      />
    </div>
  );
}

