'use client';

import Link from 'next/link';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useOrder } from '@/features/checkout/hooks/useCheckout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export interface OrderSuccessPageProps {
  orderId: string;
}

export function OrderSuccessPage({ orderId }: OrderSuccessPageProps) {
  const { data: order, isLoading, error } = useOrder(orderId);

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

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">تم إنشاء الطلب بنجاح!</h1>
          <p className="text-white/60">
            رقم الطلب: <span className="text-primary font-medium">{order.orderNumber}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6 space-y-4">
          {/* Items Count */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Package className="w-5 h-5 text-primary" />
            <div>
              <p className="text-white font-medium">المنتجات</p>
              <p className="text-sm text-white/60">{order.items.length} منتج</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="flex items-start gap-3 pb-4 border-b border-white/10">
            <MapPin className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-white font-medium mb-1">عنوان التوصيل</p>
              <p className="text-sm text-white/60">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-white/60">{order.shippingAddress.phone}</p>
              <p className="text-sm text-white/60">
                {order.shippingAddress.street}, {order.shippingAddress.area},{' '}
                {order.shippingAddress.governorate}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <CreditCard className="w-5 h-5 text-primary" />
            <div>
              <p className="text-white font-medium">طريقة الدفع</p>
              <p className="text-sm text-white/60">
                {order.paymentMethod === 'cod'
                  ? 'الدفع عند الاستلام'
                  : order.paymentMethod === 'wallet'
                  ? 'المحفظة الإلكترونية'
                  : 'بطاقة الائتمان'}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-white">المجموع الكلي</span>
            <span className="text-2xl font-bold text-primary">
              {order.total.toLocaleString()} ل.س
            </span>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-400 text-center">
            سيتم التواصل معك قريباً لتأكيد الطلب وتحديد موعد التوصيل
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/orders/${order._id}`}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-xl text-center hover:bg-primary/90 transition-colors"
          >
            عرض تفاصيل الطلب
          </Link>

          <Link
            href="/products"
            className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            متابعة التسوق
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

