'use client';

/**
 * Test Components Page
 * 
 * Page for testing all UI components
 * Access at: http://localhost:3000/test-components
 */

import { useState } from 'react';
import { Phone, Mail, User, Search } from 'lucide-react';
import { Input, Textarea, Select, Checkbox, FormField } from '@/components/ui/forms';
import { Spinner, Skeleton, SkeletonCard, PageLoader, ErrorMessage } from '@/components/ui';
import toast from '@/lib/toast';

export default function TestComponentsPage() {
  const [showPageLoader, setShowPageLoader] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleToastSuccess = () => {
    toast.success('تم بنجاح! ✅');
  };

  const handleToastError = () => {
    toast.error('حدث خطأ! ❌');
  };

  const handleToastLoading = () => {
    const id = toast.loading('جاري التحميل...');
    setTimeout(() => {
      toast.dismiss(id);
      toast.success('تم الانتهاء!');
    }, 2000);
  };

  const handleToastPromise = () => {
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));
    toast.promise(promise, {
      loading: 'جاري المعالجة...',
      success: 'تمت العملية بنجاح!',
      error: 'فشلت العملية!',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">اختبار المكونات</h1>
          <p className="text-gray-600 dark:text-gray-400">
            صفحة لاختبار جميع مكونات الـ UI
          </p>
        </div>

        {/* Form Components */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Form Components</h2>
          
          <div className="space-y-6">
            <FormField>
              <Input
                label="رقم الهاتف"
                placeholder="+963 991 234 567"
                leftIcon={<Phone className="w-5 h-5" />}
              />
            </FormField>

            <FormField>
              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="example@email.com"
                leftIcon={<Mail className="w-5 h-5" />}
                error="البريد الإلكتروني غير صحيح"
              />
            </FormField>

            <FormField>
              <Textarea
                label="الوصف"
                placeholder="اكتب وصفاً هنا..."
                rows={4}
              />
            </FormField>

            <FormField>
              <Select
                label="المدينة"
                placeholder="اختر المدينة"
                options={[
                  { value: 'damascus', label: 'دمشق' },
                  { value: 'aleppo', label: 'حلب' },
                  { value: 'homs', label: 'حمص' },
                ]}
              />
            </FormField>

            <FormField>
              <Checkbox
                label="أوافق على الشروط والأحكام"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
            </FormField>
          </div>
        </section>

        {/* Loading Components */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Loading Components</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Spinners</h3>
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Skeletons</h3>
              <div className="space-y-4">
                <Skeleton height={40} />
                <Skeleton height={100} />
                <SkeletonCard />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Page Loader</h3>
              <button
                onClick={() => setShowPageLoader(true)}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                عرض Page Loader
              </button>
              {showPageLoader && (
                <PageLoader message="جاري التحميل..." />
              )}
            </div>
          </div>
        </section>

        {/* Toast Notifications */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Toast Notifications</h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleToastSuccess}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Success Toast
            </button>
            <button
              onClick={handleToastError}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Error Toast
            </button>
            <button
              onClick={handleToastLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Loading Toast
            </button>
            <button
              onClick={handleToastPromise}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Promise Toast
            </button>
          </div>
        </section>

        {/* Error Messages */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Error Messages</h2>
          
          <div className="space-y-4">
            <ErrorMessage
              message="هذا خطأ inline"
              variant="inline"
            />
            <ErrorMessage
              title="خطأ في التحميل"
              message="فشل تحميل البيانات. يرجى المحاولة مرة أخرى."
              variant="card"
              onRetry={() => alert('إعادة المحاولة')}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

