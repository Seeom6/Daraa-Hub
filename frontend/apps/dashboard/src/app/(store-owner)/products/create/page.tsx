/**
 * Create Product Page
 * Multi-step form for creating new products
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Package,
  Image as ImageIcon,
  DollarSign,
  Layers,
  Plus,
} from 'lucide-react';
import { StepProgress } from './components/StepProgress';
import { StepNavigation } from './components/StepNavigation';
import { SuccessMessage } from './components/SuccessMessage';
import { Step1BasicInfo } from './components/Step1BasicInfo';
import { Step2Pricing } from './components/Step2Pricing';
import { Step3Images } from './components/Step3Images';
import { Step4VariantsTags } from './components/Step4VariantsTags';
import type { ProductFormData, ProductStep } from '@/features/products/types';
import { validateProductStep } from '@/features/products/utils';
import { productsService, storeOwnerService } from '@/features/store/services';
import type { CreateProductDto } from '@/features/store/types';
import { categoryService, type Category, productService } from '@daraa/api';
import { useAuthStore } from '@/features/store/stores/auth.store';

const STEPS: ProductStep[] = [
  { id: 1, name: 'المعلومات الأساسية', icon: Package },
  { id: 2, name: 'التسعير والمخزون', icon: DollarSign },
  { id: 3, name: 'الصور والوسائط', icon: ImageIcon },
  { id: 4, name: 'المتغيرات والوسوم', icon: Layers },
];

export default function CreateProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeId, setStoreId] = useState<string>(''); // Will be fetched from store profile
  const [categories, setCategories] = useState<Category[]>([]); // Categories from API
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Store actual image files

  // Form states
  const [currentTag, setCurrentTag] = useState('');
  const [currentVariantName, setCurrentVariantName] = useState('');
  const [currentVariantOption, setCurrentVariantOption] = useState('');
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    barcode: '',
    images: [],
    variants: [],
    tags: [],
  });

  // Fetch store profile to get storeId and check verification status
  useEffect(() => {
    const fetchStoreProfile = async () => {
      try {
        const profile = await storeOwnerService.getProfile();

        // Check if profile exists
        if (!profile || !profile._id) {
          toast.error('لم يتم العثور على معرف المتجر. الرجاء إنشاء ملف المتجر أولاً', {
            duration: 5000,
          });
          setTimeout(() => {
            router.push('/settings/profile');
          }, 2000);
          return;
        }

        // Check verification status
        if (profile.verificationStatus === 'pending') {
          toast.error('متجرك قيد المراجعة. يرجى انتظار الموافقة قبل إضافة المنتجات', {
            duration: 6000,
          });
          setTimeout(() => {
            router.push('/store-under-review');
          }, 2000);
          return;
        }

        if (profile.verificationStatus === 'rejected') {
          toast.error('تم رفض طلب التحقق من متجرك. يرجى مراجعة الملاحظات وإعادة التقديم', {
            duration: 6000,
          });
          setTimeout(() => {
            router.push('/settings/verification');
          }, 2000);
          return;
        }

        if (profile.verificationStatus === 'suspended') {
          toast.error('متجرك معلق حالياً. يرجى التواصل مع الدعم الفني', {
            duration: 6000,
          });
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          return;
        }

        // Check if store is active
        if (!profile.isStoreActive) {
          toast.error('متجرك غير نشط حالياً. يرجى تفعيل المتجر أولاً', {
            duration: 5000,
          });
          setTimeout(() => {
            router.push('/settings/profile');
          }, 2000);
          return;
        }

        // All checks passed - store is approved and active
        if (profile.verificationStatus === 'approved') {
          setStoreId(profile._id);

          // Update storeId in Zustand store
          const { setStoreId: setGlobalStoreId } = useAuthStore.getState();
          setGlobalStoreId(profile._id);
        } else {
          toast.error('حالة المتجر غير صحيحة. يرجى التواصل مع الدعم الفني');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error fetching store profile:', error);

        // Check if it's a 404 error (profile not found)
        if (error.response?.status === 404) {
          toast.error('لم يتم العثور على ملف المتجر. الرجاء إنشاء ملف المتجر أولاً', {
            duration: 5000,
          });
          // Redirect to profile setup page after 2 seconds
          setTimeout(() => {
            router.push('/settings/profile');
          }, 2000);
        } else if (error.response?.status === 401) {
          toast.error('يجب تسجيل الدخول أولاً');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } else {
          toast.error('فشل تحميل معلومات المتجر. الرجاء المحاولة مرة أخرى');
        }
      }
    };

    fetchStoreProfile();
  }, [router]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const cats = await categoryService.getActiveCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('فشل تحميل الفئات');
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    const validation = validateProductStep(currentStep, formData);
    if (validation.isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      setErrors({});
    } else {
      setErrors(validation.errors);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validate all steps
    const step1Validation = validateProductStep(1, formData);
    const step2Validation = validateProductStep(2, formData);

    if (!step1Validation.isValid || !step2Validation.isValid) {
      setCurrentStep(1);
      setErrors({ ...step1Validation.errors, ...step2Validation.errors });
      return;
    }

    // Check if we have storeId
    if (!storeId) {
      toast.error('لم يتم العثور على معرف المتجر. الرجاء تحديث ملف المتجر أولاً');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate slug from name
      // For Arabic names, use timestamp-based slug
      // For English names, use name-based slug
      let slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]+/g, '') // Keep Arabic characters (\u0600-\u06FF)
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      // If slug is empty (all Arabic removed by regex) or too short, use timestamp-based slug
      if (!slug || slug.length < 2) {
        slug = `product-${Date.now()}`;
      }

      // Prepare product data according to backend API (without images initially)
      const productData: CreateProductDto = {
        storeId: storeId,
        categoryId: formData.category, // This should be a valid category ID
        name: formData.name,
        slug: slug,
        description: formData.description,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        // Don't send images in initial creation - will upload separately
        // images: formData.images.length > 0 ? formData.images : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        status: 'active',
      };

      // Call API to create product
      const createdProduct = await productsService.createProduct(productData);

      // Upload images if any
      if (imageFiles.length > 0 && createdProduct._id) {
        try {
          toast.loading('جاري رفع الصور...', { id: 'upload-images' });
          await productService.uploadImages(createdProduct._id, imageFiles);

          // Clean up blob URLs to prevent memory leaks
          formData.images.forEach((blobUrl) => {
            if (blobUrl.startsWith('blob:')) {
              URL.revokeObjectURL(blobUrl);
            }
          });

          toast.success('تم رفع الصور بنجاح!', { id: 'upload-images' });
        } catch (imageError) {
          console.error('Error uploading images:', imageError);
          toast.error('فشل رفع الصور. يمكنك إضافتها لاحقاً', { id: 'upload-images' });
        }
      }

      // Show success message
      toast.success('تم إنشاء المنتج بنجاح!');
      setShowSuccess(true);

      // Invalidate products query to refetch data
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      // Redirect to products page after 1.5 seconds
      setTimeout(() => {
        router.push('/products');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating product:', error);

      // Error is already handled by axios interceptor (toast shown)
      // But we can add specific handling here if needed
      const errorMessage = error.response?.data?.message || 'فشل إنشاء المنتج. الرجاء المحاولة مرة أخرى';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            categories={categories}
            loadingCategories={loadingCategories}
          />
        );
      case 2:
        return (
          <Step2Pricing formData={formData} handleInputChange={handleInputChange} errors={errors} />
        );
      case 3:
        return (
          <Step3Images
            formData={formData}
            setFormData={setFormData}
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
          />
        );
      case 4:
        return (
          <Step4VariantsTags
            formData={formData}
            setFormData={setFormData}
            currentTag={currentTag}
            setCurrentTag={setCurrentTag}
            currentVariantName={currentVariantName}
            setCurrentVariantName={setCurrentVariantName}
            currentVariantOption={currentVariantOption}
            setCurrentVariantOption={setCurrentVariantOption}
            editingVariantIndex={editingVariantIndex}
            setEditingVariantIndex={setEditingVariantIndex}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Success Message */}
      <SuccessMessage show={showSuccess} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى المنتجات
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                إضافة منتج جديد
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                الخطوة {currentStep} من {STEPS.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <StepProgress steps={STEPS} currentStep={currentStep} />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

