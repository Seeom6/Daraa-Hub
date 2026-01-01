/**
 * Offer Details Page
 * View offer details and analytics
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Button, Badge } from '@/components/ui';
import { Edit, Trash2, Eye, ShoppingCart, Calendar, Package } from 'lucide-react';
import { useOffer, useDeleteOffer } from '@/features/offers/hooks';
import { OfferStats } from '@/features/offers/components';
import {
  formatDiscount,
  getOfferStatus,
  getProductIds,
  formatDateRange,
} from '@/features/offers/utils';

export default function OfferDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: offer, isLoading, error } = useOffer(id);
  const deleteOffer = useDeleteOffer();

  const handleEdit = () => {
    router.push(`/offers/${id}/edit`);
  };

  const handleDelete = async () => {
    if (confirm(`هل أنت متأكد من حذف العرض "${offer?.title}"؟`)) {
      await deleteOffer.mutateAsync(id);
      router.push('/offers');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600">حدث خطأ أثناء تحميل العرض</p>
        </div>
      </div>
    );
  }

  const status = getOfferStatus(offer);
  const statusConfig = {
    active: { label: 'نشط', variant: 'success' as const },
    upcoming: { label: 'قادم', variant: 'info' as const },
    expired: { label: 'منتهي', variant: 'default' as const },
    disabled: { label: 'معطّل', variant: 'error' as const },
  };

  const productCount = getProductIds(offer.applicableProducts).length;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {offer.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            تفاصيل العرض الترويجي
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            leftIcon={<Edit className="w-5 h-5" />}
            onClick={handleEdit}
          >
            تعديل
          </Button>

          <Button
            variant="danger"
            leftIcon={<Trash2 className="w-5 h-5" />}
            onClick={handleDelete}
          >
            حذف
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <OfferStats
          analytics={{
            viewCount: offer.viewCount,
            usageCount: offer.usageCount,
            conversionRate:
              offer.viewCount > 0 ? (offer.usageCount / offer.viewCount) * 100 : 0,
          }}
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="معلومات العرض" />
            <CardBody>
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    الحالة:
                  </span>
                  <Badge variant={statusConfig[status].variant}>
                    {statusConfig[status].label}
                  </Badge>
                </div>

                {/* Description */}
                {offer.description && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      الوصف:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {offer.description}
                    </p>
                  </div>
                )}

                {/* Image */}
                {offer.image && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      صورة البانر:
                    </span>
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Discount Info */}
          <Card>
            <CardHeader title="تفاصيل الخصم" />
            <CardBody>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">نوع الخصم:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {offer.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">قيمة الخصم:</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {formatDiscount(offer)}
                  </span>
                </div>

                {offer.minPurchaseAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">الحد الأدنى:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {offer.minPurchaseAmount.toLocaleString('ar-SY')} ل.س
                    </span>
                  </div>
                )}

                {offer.maxDiscountAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">الحد الأقصى:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {offer.maxDiscountAmount.toLocaleString('ar-SY')} ل.س
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Schedule Info */}
          <Card>
            <CardHeader title="الجدولة" />
            <CardBody>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">الفترة:</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDateRange(offer.startDate, offer.endDate)}
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Products Info */}
          <Card>
            <CardHeader title="المنتجات" />
            <CardBody>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {productCount === 0 ? 'جميع المنتجات' : `${productCount} منتج`}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {productCount === 0
                      ? 'يطبق على جميع منتجات المتجر'
                      : 'منتجات محددة'}
                  </div>
                </div>
              </div>

              {/* Show product list if specific products */}
              {productCount > 0 && Array.isArray(offer.applicableProducts) && (
                <div className="mt-4 space-y-2">
                  {offer.applicableProducts.map((product: any, index: number) => (
                    <div
                      key={typeof product === 'string' ? product : product._id || index}
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg"
                    >
                      {typeof product === 'object' && product.mainImage && (
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {typeof product === 'object' ? product.name : 'منتج'}
                        </div>
                        {typeof product === 'object' && product.price && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {product.price.toLocaleString('ar-SY')} ل.س
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

