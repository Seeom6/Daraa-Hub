/**
 * Order Details Page
 * View and manage a single order
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, Button } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/common';
import { OrderStatusBadge } from '@/features/store/components';
import { useOrder, useOrders } from '@/features/store/hooks';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ArrowRight, Check, X, Truck } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading, error } = useOrder(id);
  // TODO: Uncomment when backend endpoints are ready
  // const { acceptOrder, cancelOrder, markAsShipped, markAsDelivered } = useOrders();

  if (isLoading) {
    return <LoadingState message="جاري تحميل الطلب..." />;
  }

  if (error || !order) {
    return (
      <ErrorState
        message="فشل تحميل الطلب"
        onRetry={() => router.back()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            leftIcon={<ArrowRight className="w-5 h-5" />}
          >
            رجوع
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              طلب #{order.orderNumber}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {/* TODO: Uncomment when backend endpoints are ready */}
      {/* Actions */}
      {/* {order.status === 'pending' && (
        <div className="flex gap-3">
          <Button
            variant="success"
            leftIcon={<Check className="w-5 h-5" />}
            onClick={() => acceptOrder(order._id)}
          >
            قبول الطلب
          </Button>
          <Button
            variant="danger"
            leftIcon={<X className="w-5 h-5" />}
            onClick={() => cancelOrder({ id: order._id, reason: 'تم الإلغاء من قبل المتجر' })}
          >
            رفض الطلب
          </Button>
        </div>
      )} */}

      {/* TODO: Fix OrderStatus types to match backend */}
      {/* {order.status === 'confirmed' && (
        <Button
          leftIcon={<Truck className="w-5 h-5" />}
          onClick={() => markAsShipped({ id: order._id })}
        >
          تحديد كـ &quot;قيد الشحن&quot;
        </Button>
      )}

      {order.status === 'delivering' && (
        <Button
          variant="success"
          leftIcon={<Check className="w-5 h-5" />}
          onClick={() => markAsDelivered(order._id)}
        >
          تحديد كـ &quot;تم التوصيل&quot;
        </Button>
      )} */}

      {/* Customer Info */}
      <Card>
        <CardHeader title="معلومات العميل" />
        <div className="space-y-2">
          <p className="text-gray-900 dark:text-white">
            <span className="font-medium">الاسم:</span> {order.customer?.fullName || 'غير متوفر'}
          </p>
          <p className="text-gray-900 dark:text-white">
            <span className="font-medium">الهاتف:</span> {order.customer?.phone || 'غير متوفر'}
          </p>
          <p className="text-gray-900 dark:text-white">
            <span className="font-medium">العنوان:</span> {order.deliveryAddress?.fullAddress || 'غير متوفر'}
          </p>
        </div>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader title="المنتجات" />
        <div className="space-y-3">
          {order.items?.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-4">
                {item.product?.images?.[0] && (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.product?.name || 'منتج'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    الكمية: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader title="ملخص الطلب" />
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>المجموع الفرعي:</span>
            <span>{formatCurrency(order.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>الشحن:</span>
            <span>{formatCurrency(order.shippingFee || 0)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>الخصم:</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-700">
            <span>الإجمالي:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

