/**
 * Become Vendor Page
 * Multi-step form for customers to apply to become store owners
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  CreditCard,
  User,
  Tag,
  AlertCircle,
  Calendar,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { useBecomeVendor } from '../../hooks/useBecomeVendor';
import { useStoreCategories } from '../../hooks/useStoreCategories';
import { useVendorStatus } from '../../hooks/useVendorStatus';
import {
  AnimatedBackground,
  AuthCard,
  AuthHeader,
  FormField,
  GradientButton,
  StyledInput,
} from '@/features/auth/components/ui';

type Step = 1 | 2 | 3;

/**
 * BecomeVendorPage Component
 */
export function BecomeVendorPage() {
  const [step, setStep] = useState<Step>(1);
  const {
    formData,
    updateField,
    errors,
    validateStep,
    submitApplication,
    isSubmitting
  } = useBecomeVendor();
  const { categories, isLoading: categoriesLoading } = useStoreCategories();
  const { status, loading: statusLoading, canApply, redirectBasedOnStatus } = useVendorStatus();

  // Check status and redirect if needed
  useEffect(() => {
    if (!statusLoading && !canApply()) {
      redirectBasedOnStatus();
    }
  }, [statusLoading, canApply, redirectBasedOnStatus]);

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async () => {
    if (validateStep(3)) {
      await submitApplication();
    }
  };

  // Show loading while checking status
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 p-4 relative overflow-hidden"
      dir="rtl"
    >
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all ${
                      step > s
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between max-w-md mx-auto mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span>معلومات المتجر</span>
            <span>معلومات العمل</span>
            <span>المراجعة</span>
          </div>
        </div>

        {/* Card */}
        <AuthCard>
          {/* Header */}
          <AuthHeader
            title={
              step === 1
                ? 'معلومات المتجر'
                : step === 2
                ? 'معلومات العمل'
                : 'مراجعة وإرسال'
            }
            subtitle={
              step === 1
                ? 'أخبرنا عن متجرك ونوع المنتجات التي تبيعها'
                : step === 2
                ? 'نحتاج بعض المعلومات القانونية للتحقق'
                : 'راجع معلوماتك قبل الإرسال'
            }
            emoji={step === 1 ? '🏪' : step === 2 ? '📄' : '✅'}
          />

          {/* Form */}
          <div className="px-8 pb-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <StepOne
                  formData={formData}
                  updateField={updateField}
                  errors={errors}
                  categories={categories}
                  categoriesLoading={categoriesLoading}
                  onNext={handleNext}
                />
              )}
              {step === 2 && (
                <StepTwo
                  formData={formData}
                  updateField={updateField}
                  errors={errors}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {step === 3 && (
                <StepThree
                  formData={formData}
                  updateField={updateField}
                  errors={errors}
                  onSubmit={handleSubmit}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                />
              )}
            </AnimatePresence>
          </div>
        </AuthCard>
      </motion.div>
    </div>
  );
}

/**
 * Step 1: Store Information
 */
function StepOne({ formData, updateField, errors, categories, categoriesLoading, onNext }: any) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-5">
        {/* Store Name */}
        <FormField label="اسم المتجر" required error={errors.storeName} delay={0.1}>
          <StyledInput
            type="text"
            value={formData.storeName}
            onChange={(e) => updateField('storeName', e.target.value)}
            placeholder="مثال: متجر الإلكترونيات الحديثة"
            rightIcon={<Store className="w-5 h-5" />}
          />
        </FormField>

        {/* Store Description */}
        <FormField label="وصف المتجر" required error={errors.storeDescription} delay={0.2}>
          <textarea
            value={formData.storeDescription}
            onChange={(e) => updateField('storeDescription', e.target.value)}
            placeholder="اكتب وصفاً مختصراً عن متجرك والمنتجات التي تبيعها..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
          />
        </FormField>

        {/* Primary Category */}
        <FormField label="التصنيف الرئيسي" required error={errors.primaryCategory} delay={0.3}>
          <div className="relative">
            <select
              value={formData.primaryCategory}
              onChange={(e) => updateField('primaryCategory', e.target.value)}
              disabled={categoriesLoading}
              className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none"
            >
              <option value="">اختر التصنيف الرئيسي</option>
              {categories?.map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <Tag className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </FormField>

        {/* Additional Categories */}
        <FormField label="تصنيفات إضافية (اختياري)" error={errors.storeCategories} delay={0.4}>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
            {categories?.map((cat: any) => (
              <label
                key={cat._id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.storeCategories.includes(cat._id)}
                  onChange={(e) => {
                    const newCategories = e.target.checked
                      ? [...formData.storeCategories, cat._id]
                      : formData.storeCategories.filter((id: string) => id !== cat._id);
                    updateField('storeCategories', newCategories);
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {cat.icon} {cat.name}
                </span>
              </label>
            ))}
          </div>
        </FormField>

        {/* Next Button */}
        <GradientButton
          type="submit"
          icon={<ArrowRight className="w-5 h-5" />}
          delay={0.5}
        >
          التالي
        </GradientButton>
      </form>
    </motion.div>
  );
}

/**
 * Step 2: Business Information
 */
function StepTwo({ formData, updateField, errors, onNext, onBack }: any) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-5">
        {/* Business License */}
        <FormField label="رقم السجل التجاري (اختياري)" error={errors.businessLicense} delay={0.1}>
          <StyledInput
            type="text"
            value={formData.businessLicense}
            onChange={(e) => updateField('businessLicense', e.target.value)}
            placeholder="مثال: CR123456789"
            rightIcon={<FileText className="w-5 h-5" />}
          />
        </FormField>

        {/* Tax ID */}
        <FormField label="الرقم الضريبي (اختياري)" error={errors.taxId} delay={0.2}>
          <StyledInput
            type="text"
            value={formData.taxId}
            onChange={(e) => updateField('taxId', e.target.value)}
            placeholder="مثال: TAX123456"
            rightIcon={<CreditCard className="w-5 h-5" />}
          />
        </FormField>

        {/* National ID */}
        <FormField label="رقم الهوية الوطنية" required error={errors.nationalId} delay={0.3}>
          <StyledInput
            type="text"
            value={formData.nationalId}
            onChange={(e) => updateField('nationalId', e.target.value)}
            placeholder="مثال: 12345678901"
            rightIcon={<User className="w-5 h-5" />}
          />
        </FormField>

        {/* Date of Birth */}
        <FormField label="تاريخ الميلاد" required error={errors.dateOfBirth} delay={0.35}>
          <StyledInput
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            rightIcon={<Calendar className="w-5 h-5" />}
          />
        </FormField>

        {/* Business Address */}
        <FormField label="عنوان العمل" required error={errors.businessAddress} delay={0.4}>
          <StyledInput
            type="text"
            value={formData.businessAddress}
            onChange={(e) => updateField('businessAddress', e.target.value)}
            placeholder="مثال: دمشق، شارع الحمرا، بناء رقم 10"
            rightIcon={<MapPin className="w-5 h-5" />}
          />
        </FormField>

        {/* Business Phone */}
        <FormField label="رقم هاتف العمل" required error={errors.businessPhone} delay={0.5}>
          <StyledInput
            type="tel"
            value={formData.businessPhone}
            onChange={(e) => updateField('businessPhone', e.target.value)}
            placeholder="+963112345678"
            dir="ltr"
            rightIcon={<Phone className="w-5 h-5" />}
          />
        </FormField>

        {/* Store Images */}
        <FormField label="صور المحل التجاري (3 صور على الأقل)" required error={errors.storeImages} delay={0.6}>
          <div className="space-y-3">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">اضغط لرفع الصور</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP (حد أقصى 5MB لكل صورة)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    updateField('storeImages', [...formData.storeImages, ...files]);
                  }}
                />
              </label>
            </div>

            {/* Preview Images */}
            {formData.storeImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {formData.storeImages.map((file: File, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = formData.storeImages.filter((_: File, i: number) => i !== index);
                        updateField('storeImages', newImages);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400">
              تم رفع {formData.storeImages.length} من 3 صور كحد أدنى
            </p>
          </div>
        </FormField>

        {/* Business License PDF */}
        <FormField label="رخصة العمل (PDF - اختياري)" error={errors.businessLicensePdf} delay={0.7}>
          <div className="space-y-2">
            <label className="flex items-center justify-center w-full h-20 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.businessLicensePdf ? formData.businessLicensePdf.name : 'اضغط لرفع رخصة العمل (PDF)'}
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) updateField('businessLicensePdf', file);
                }}
              />
            </label>
            {formData.businessLicensePdf && (
              <button
                type="button"
                onClick={() => updateField('businessLicensePdf', undefined)}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                إزالة الملف
              </button>
            )}
          </div>
        </FormField>

        {/* Tax Certificate PDF */}
        <FormField label="الشهادة الضريبية (PDF - اختياري)" error={errors.taxCertificatePdf} delay={0.8}>
          <div className="space-y-2">
            <label className="flex items-center justify-center w-full h-20 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.taxCertificatePdf ? formData.taxCertificatePdf.name : 'اضغط لرفع الشهادة الضريبية (PDF)'}
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) updateField('taxCertificatePdf', file);
                }}
              />
            </label>
            {formData.taxCertificatePdf && (
              <button
                type="button"
                onClick={() => updateField('taxCertificatePdf', undefined)}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                إزالة الملف
              </button>
            )}
          </div>
        </FormField>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            السابق
          </button>
          <GradientButton
            type="submit"
            icon={<ArrowRight className="w-5 h-5" />}
            className="flex-1"
          >
            التالي
          </GradientButton>
        </div>
      </form>
    </motion.div>
  );
}

/**
 * Step 3: Review and Submit
 */
function StepThree({ formData, updateField, errors, onSubmit, onBack, isSubmitting }: any) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        {/* Review Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-purple-900/20 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="w-5 h-5" />
            معلومات المتجر
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">اسم المتجر:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formData.storeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">الوصف:</span>
              <span className="font-semibold text-gray-900 dark:text-white max-w-xs text-left">
                {formData.storeDescription.substring(0, 50)}...
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pt-4">
            <Building2 className="w-5 h-5" />
            معلومات العمل
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">السجل التجاري:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formData.businessLicense}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">الرقم الضريبي:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formData.taxId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">رقم الهوية:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formData.nationalId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">تاريخ الميلاد:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formData.dateOfBirth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">هاتف العمل:</span>
              <span className="font-semibold text-gray-900 dark:text-white" dir="ltr">{formData.businessPhone}</span>
            </div>
          </div>
        </div>

        {/* Commission Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
              معلومات مهمة عن العمولة
            </p>
            <p className="text-yellow-800 dark:text-yellow-300">
              سيتم خصم عمولة بنسبة <strong>10%</strong> من كل عملية بيع. هذه العمولة تشمل جميع خدمات المنصة والدعم الفني.
            </p>
          </div>
        </div>

        {/* Terms Agreement */}
        <FormField error={errors.agreeToTerms} delay={0.1}>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => updateField('agreeToTerms', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              أوافق على{' '}
              <a href="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                الشروط والأحكام
              </a>
              {' '}و{' '}
              <a href="/privacy" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                سياسة الخصوصية
              </a>
              {' '}الخاصة بالبائعين
            </span>
          </label>
        </FormField>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            السابق
          </button>
          <GradientButton
            type="submit"
            icon={<CheckCircle className="w-5 h-5" />}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </GradientButton>
        </div>
      </form>
    </motion.div>
  );
}

