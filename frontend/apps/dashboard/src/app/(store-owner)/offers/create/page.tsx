/**
 * Create Offer Page
 * Multi-step form for creating a new offer with beautiful design
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Package, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCreateOffer } from '@/features/offers/hooks';
import { useStoreProfile } from '@/features/store/hooks';
import { offersService } from '@/features/offers/services/offers.service';
import { validateOfferStep } from '@/features/offers/utils';
import type { OfferFormData, DiscountType } from '@/features/offers/types';
import toast from 'react-hot-toast';
import { Step1BasicInfo } from './components/Step1BasicInfo';
import { Step2Discount } from './components/Step2Discount';
import { Step3Products } from './components/Step3Products';
import { Step4Schedule } from './components/Step4Schedule';

const STEPS = [
  { number: 1, title: 'المعلومات الأساسية', icon: Tag },
  { number: 2, title: 'تفاصيل الخصم', icon: Tag },
  { number: 3, title: 'المنتجات المطبقة', icon: Package },
  { number: 4, title: 'الجدولة والتفعيل', icon: Calendar },
];

export default function CreateOfferPage() {
  const router = useRouter();
  const createOffer = useCreateOffer();
  const { profile, isLoading: isLoadingProfile } = useStoreProfile();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OfferFormData>({
    title: '',
    description: '',
    image: null,
    discountType: 'percentage' as DiscountType,
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    applyToAllProducts: true,
    selectedProducts: [],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if store profile is loaded
  useEffect(() => {
    if (!isLoadingProfile && !profile) {
      toast.error('لم يتم العثور على ملف المتجر');
      router.push('/dashboard');
    }
  }, [isLoadingProfile, profile, router]);

  const handleNext = () => {
    const validation = validateOfferStep(currentStep, formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      // Show first error as toast
      const firstError = Object.values(validation.errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const validation = validateOfferStep(currentStep, formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    try {
      toast.loading('جاري إنشاء العرض...', { id: 'create-offer' });

      // Create offer without image first
      const offerData = {
        title: formData.title,
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minPurchaseAmount: formData.minPurchaseAmount
          ? parseFloat(formData.minPurchaseAmount)
          : undefined,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : undefined,
        applicableProducts: formData.applyToAllProducts
          ? []
          : formData.selectedProducts,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      };

      const createdOffer = await createOffer.mutateAsync(offerData);

      // Upload image if provided
      if (formData.image && createdOffer._id) {
        try {
          toast.loading('جاري رفع الصورة...', { id: 'upload-image' });
          await offersService.uploadImage(createdOffer._id, formData.image);
          toast.success('تم رفع الصورة بنجاح!', { id: 'upload-image' });
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          toast.error('فشل رفع الصورة. يمكنك إضافتها لاحقاً', { id: 'upload-image' });
        }
      }

      toast.success('تم إنشاء العرض بنجاح! 🎉', { id: 'create-offer' });
      setTimeout(() => router.push('/offers'), 1500);
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('حدث خطأ أثناء إنشاء العرض', { id: 'create-offer' });
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 px-6 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/offers')}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                إنشاء عرض جديد
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                املأ المعلومات التالية لإنشاء عرض ترويجي جديد
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-8">

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6 mb-8"
        >
          <div className="flex justify-between mb-6">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;

              return (
                <div
                  key={step.number}
                  className="flex-1 flex flex-col items-center"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                    isCompleted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                  </div>
                  <span className={`text-xs text-center font-medium ${
                    isCurrent
                      ? 'text-orange-600 dark:text-orange-400'
                      : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-8"
        >
          {/* Render Current Step */}
          {currentStep === 1 && (
            <Step1BasicInfo
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <Step2Discount
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          )}
          {currentStep === 3 && profile && (
            <Step3Products
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              storeId={profile._id}
            />
          )}
          {currentStep === 4 && (
            <Step4Schedule
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </Button>

            {currentStep === STEPS.length ? (
              <Button
                onClick={handleSubmit}
                disabled={createOffer.isPending}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-pink-600 text-white hover:from-orange-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createOffer.isPending ? (
                  <>جاري الإنشاء...</>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    إنشاء العرض
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-pink-600 text-white hover:from-orange-700 hover:to-pink-700 transition-all"
              >
                التالي
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

