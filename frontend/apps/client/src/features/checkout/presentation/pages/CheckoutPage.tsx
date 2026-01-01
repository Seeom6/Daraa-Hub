'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckoutSteps } from '@/features/checkout/components/CheckoutSteps';
import { PaymentMethods } from '@/features/checkout/components/PaymentMethods';
import { AddressCard } from '@/features/addresses/components/AddressCard';
import { CartSummary } from '@/features/cart/components/CartSummary';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAddresses } from '@/features/addresses/hooks/useAddresses';
import { useCreateOrder } from '@/features/checkout/hooks/useCheckout';
import { CheckoutStep, type CheckoutData } from '@/features/checkout/types/checkout.types';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.ADDRESS);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({});

  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const createOrder = useCreateOrder();

  const handleNext = () => {
    if (currentStep < CheckoutStep.REVIEW) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > CheckoutStep.ADDRESS) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push('/cart');
    }
  };

  const handleSubmitOrder = () => {
    if (!checkoutData.addressId || !checkoutData.paymentMethod) {
      return;
    }

    createOrder.mutate({
      addressId: checkoutData.addressId,
      paymentMethod: checkoutData.paymentMethod,
      notes: checkoutData.notes,
    });
  };

  if (cartLoading || addressesLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message="السلة فارغة" variant="card" />
      </div>
    );
  }

  const canProceed = () => {
    switch (currentStep) {
      case CheckoutStep.ADDRESS:
        return !!checkoutData.addressId;
      case CheckoutStep.SHIPPING:
        return true; // Skip for now
      case CheckoutStep.PAYMENT:
        return !!checkoutData.paymentMethod;
      case CheckoutStep.REVIEW:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          إتمام الطلب
        </h1>
      </div>

      {/* Steps */}
      <CheckoutSteps currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 1: Address */}
            {currentStep === CheckoutStep.ADDRESS && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-white mb-4">اختر عنوان التوصيل</h2>
                {addresses && addresses.length > 0 ? (
                  addresses.map((address) => (
                    <AddressCard
                      key={address._id}
                      address={address}
                      isSelected={checkoutData.addressId === address._id}
                      onSelect={() =>
                        setCheckoutData({ ...checkoutData, addressId: address._id })
                      }
                      showActions={false}
                    />
                  ))
                ) : (
                  <ErrorMessage message="لا توجد عناوين محفوظة" variant="card" />
                )}
              </motion.div>
            )}

            {/* Step 2: Shipping (Skip for now) */}
            {currentStep === CheckoutStep.SHIPPING && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-white mb-4">طريقة الشحن</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-white/80">شحن قياسي - مجاني</p>
                  <p className="text-sm text-white/60 mt-2">التوصيل خلال 3-5 أيام عمل</p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === CheckoutStep.PAYMENT && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold text-white mb-4">طريقة الدفع</h2>
                <PaymentMethods
                  selected={checkoutData.paymentMethod}
                  onSelect={(method) =>
                    setCheckoutData({ ...checkoutData, paymentMethod: method })
                  }
                />
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === CheckoutStep.REVIEW && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-white mb-4">مراجعة الطلب</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-white">جميع البيانات صحيحة</p>
                  <p className="text-sm text-white/60 mt-2">
                    {cart.itemsCount} منتج - {cart.total.toLocaleString()} ل.س
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              رجوع
            </button>

            {currentStep < CheckoutStep.REVIEW ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="mr-auto px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                التالي
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitOrder}
                disabled={createOrder.isPending || !canProceed()}
                className="mr-auto px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createOrder.isPending ? 'جاري الإنشاء...' : 'تأكيد الطلب'}
              </button>
            )}
          </div>
        </div>

        {/* Cart Summary */}
        <div>
          <CartSummary
            subtotal={cart.subtotal}
            discount={cart.discount}
            shipping={cart.shipping}
            total={cart.total}
            coupon={cart.coupon}
          />
        </div>
      </div>
    </div>
  );
}

