/**
 * Edit Offer Page
 * Multi-step form for editing an existing offer
 */

'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { useOffer, useUpdateOffer } from '@/features/offers/hooks';
import { useStoreProfile } from '@/features/store/hooks';
import { offersService } from '@/features/offers/services/offers.service';
import { validateOfferStep } from '@/features/offers/utils';
import type { OfferFormData, DiscountType } from '@/features/offers/types';
import { Step1BasicInfo } from '../../create/components/Step1BasicInfo';
import { Step2Discount } from '../../create/components/Step2Discount';
import { Step3Products } from '../../create/components/Step3Products';
import { Step4Schedule } from '../../create/components/Step4Schedule';
import { getProductIds } from '@/features/offers/utils';
import toast from 'react-hot-toast';

const STEPS = [
  { number: 1, title: 'المعلومات الأساسية', component: Step1BasicInfo },
  { number: 2, title: 'تفاصيل الخصم', component: Step2Discount },
  { number: 3, title: 'المنتجات المطبقة', component: Step3Products },
  { number: 4, title: 'الجدولة والتفعيل', component: Step4Schedule },
];

export default function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: offer, isLoading: isLoadingOffer } = useOffer(id);
  const updateOffer = useUpdateOffer();
  const { profile } = useStoreProfile();

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
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load offer data when available
  useEffect(() => {
    if (offer) {
      const productIds = getProductIds(offer.applicableProducts);
      setFormData({
        title: offer.title,
        description: offer.description || '',
        image: null, // Can't set File from URL
        discountType: offer.discountType,
        discountValue: offer.discountValue.toString(),
        minPurchaseAmount: offer.minPurchaseAmount?.toString() || '',
        maxDiscountAmount: offer.maxDiscountAmount?.toString() || '',
        applyToAllProducts: productIds.length === 0,
        selectedProducts: productIds,
        startDate: new Date(offer.startDate),
        endDate: new Date(offer.endDate),
        isActive: offer.isActive,
      });
    }
  }, [offer]);

  const handleNext = () => {
    const validation = validateOfferStep(currentStep, formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
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
      return;
    }

    if (!id) {
      toast.error('معرف العرض غير موجود');
      return;
    }

    try {
      toast.loading('جاري تحديث العرض...', { id: 'update-offer' });

      // Update offer data
      const updateData = {
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

      await updateOffer.mutateAsync({
        id,
        data: updateData,
      });

      // Upload new image if provided
      if (formData.image) {
        try {
          toast.loading('جاري رفع الصورة...', { id: 'upload-image' });
          await offersService.uploadImage(id, formData.image);
          toast.success('تم رفع الصورة بنجاح!', { id: 'upload-image' });
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          toast.error('فشل رفع الصورة. يمكنك إضافتها لاحقاً', { id: 'upload-image' });
        }
      }

      toast.success('تم تحديث العرض بنجاح! 🎉', { id: 'update-offer' });
      router.push(`/offers/${id}`);
    } catch (error) {
      console.error('Error updating offer:', error);
      toast.error('حدث خطأ أثناء تحديث العرض', { id: 'update-offer' });
    }
  };

  if (isLoadingOffer) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          تعديل العرض
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          قم بتعديل معلومات العرض الترويجي
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex justify-between mb-4">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className={`flex items-center ${
                  step.number === currentStep
                    ? 'text-primary-600 font-semibold'
                    : step.number < currentStep
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step.number === currentStep
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : step.number < currentStep
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {step.number < currentStep ? '✓' : step.number}
                </div>
                <span className="mr-2 hidden md:inline">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card>
        <div className="p-6">
          <CurrentStepComponent
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            storeId={profile?._id || ''}
          />

          {/* Actions */}
          <div className="flex justify-between mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              السابق
            </Button>

            {currentStep === STEPS.length ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={updateOffer.isPending}
              >
                {updateOffer.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNext}>
                التالي
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

