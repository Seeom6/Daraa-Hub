'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, CreditCard, Package, XCircle } from 'lucide-react';
import { OrderStatus, OrderTimeline } from '@/features/orders/components';
import { useOrder, useCancelOrder } from '@/features/orders/hooks/useOrders';
import { OrderStatus as OrderStatusEnum } from '@/features/shared/types/order.types';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useState } from 'react';

export interface OrderDetailPageProps {
  orderId: string;
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const { data: order, isLoading, error } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message="حدث خطأ أثناء تحميل الطلب" variant="card" />
      </div>
    );
  }

  const canCancel = [OrderStatusEnum.PENDING, OrderStatusEnum.CONFIRMED].includes(order.status);

  const handleCancelOrder = () => {
    cancelOrder.mutate({ id: order._id });
    setShowCancelModal(false);
  };

  // Create timeline events from order
  const timelineEvents = [
    {
      status: OrderStatusEnum.PENDING,
      date: order.createdAt,
      description: 'تم إنشاء الطلب',
    },
  ];

  if (order.status !== OrderStatusEnum.PENDING) {
    timelineEvents.push({
      status: order.status,
      date: order.updatedAt,
      description: `الطلب ${order.status === OrderStatusEnum.CANCELLED ? 'ملغي' : 'محدث'}`,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowRight className="w-5 h-5" />
          العودة إلى الطلبات
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              طلب #{order.orderNumber}
            </h1>
            <p className="text-white/60">
              {new Date(order.createdAt).toLocaleDateString('ar-SY', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <OrderStatus status={order.status} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <OrderTimeline events={timelineEvents} currentStatus={order.status} />

          {/* Products */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              المنتجات ({order.items.length})
            </h3>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                    <Image
                      src={item.product.mainImage || item.product.images[0] || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{item.product.name}</h4>
                    <p className="text-sm text-white/60">الكمية: {item.quantity}</p>
                    <p className="text-sm text-primary font-medium mt-1">
                      {item.price.toLocaleString()} ل.س
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-white font-bold">
                      {(item.price * item.quantity).toLocaleString()} ل.س
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel Button */}
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={cancelOrder.isPending}
              className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              إلغاء الطلب
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Address */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              عنوان التوصيل
            </h3>
            <p className="text-white/80 text-sm mb-1">{order.shippingAddress.fullName}</p>
            <p className="text-white/60 text-sm mb-1">{order.shippingAddress.phone}</p>
            <p className="text-white/60 text-sm">
              {order.shippingAddress.street}, {order.shippingAddress.area},{' '}
              {order.shippingAddress.governorate}
            </p>
          </div>

          {/* Payment */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              الدفع
            </h3>
            <p className="text-white/80 text-sm">
              {order.paymentMethod === 'cod'
                ? 'الدفع عند الاستلام'
                : order.paymentMethod === 'wallet'
                ? 'المحفظة الإلكترونية'
                : 'بطاقة الائتمان'}
            </p>
          </div>

          {/* Summary */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">ملخص الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/80">
                <span>المجموع الفرعي</span>
                <span>{order.subtotal.toLocaleString()} ل.س</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>الخصم</span>
                  <span>-{order.discount.toLocaleString()} ل.س</span>
                </div>
              )}
              <div className="flex justify-between text-white/80">
                <span>الشحن</span>
                <span>{order.shipping === 0 ? 'مجاني' : `${order.shipping.toLocaleString()} ل.س`}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-lg">
                <span>المجموع الكلي</span>
                <span className="text-primary">{order.total.toLocaleString()} ل.س</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">تأكيد الإلغاء</h3>
            <p className="text-white/60 mb-6">هل أنت متأكد من إلغاء هذا الطلب؟</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelOrder.isPending}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {cancelOrder.isPending ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

