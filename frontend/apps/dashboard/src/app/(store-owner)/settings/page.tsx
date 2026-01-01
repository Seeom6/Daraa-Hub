/**
 * Settings Page
 * Store settings and configuration
 */

'use client';

import { useForm } from 'react-hook-form';
import { Card, Button } from '@/components/ui';
import { FormSection } from '@/components/form';
import { LoadingState } from '@/components/common';
import { useSettings } from '@/features/store/hooks';
import { Save } from 'lucide-react';
import type { StoreSettingsFormData } from '@/features/store/types';

export default function SettingsPage() {
  const { isLoading: settingsLoading, updateSettings } = useSettings();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreSettingsFormData>({
    defaultValues: {
      businessHours: [],
      defaultShippingFee: 0,
      freeShippingThreshold: 0,
      allowCashOnDelivery: true,
      minOrderAmount: 0,
      orderCancellationPeriod: 24,
      returnPeriod: 7,
      allowReturns: true,
      notifyOnNewOrder: true,
      notifyOnLowStock: true,
      notifyOnReview: true,
    },
  });

  const onSubmit = async (data: StoreSettingsFormData) => {
    updateSettings(data);
  };

  if (settingsLoading) {
    return <LoadingState message="جاري تحميل الإعدادات..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          إعدادات المتجر
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إدارة معلومات وإعدادات متجرك
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Notifications */}
        <Card>
          <FormSection
            title="الإشعارات"
            description="إعدادات الإشعارات والتنبيهات"
          >
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('notifyOnNewOrder')}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-900 dark:text-white">
                  إشعار عند استلام طلب جديد
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('notifyOnLowStock')}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-900 dark:text-white">
                  إشعار عند انخفاض المخزون
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('notifyOnReview')}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-900 dark:text-white">
                  إشعار عند استلام تقييم جديد
                </span>
              </label>
            </div>
          </FormSection>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="submit"
            leftIcon={<Save className="w-5 h-5" />}
          >
            حفظ التغييرات
          </Button>
        </div>
      </form>
    </div>
  );
}

