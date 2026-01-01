/**
 * Edit Product Page
 * Multi-step form for editing existing products
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Package,
  Loader2,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { StepProgress } from '../../create/components/StepProgress';
import { StepNavigation } from '../../create/components/StepNavigation';
import { SuccessMessage } from '../../create/components/SuccessMessage';
import { Step1BasicInfo } from '../../create/components/Step1BasicInfo';
import { Step2Pricing } from '../../create/components/Step2Pricing';
import { Step3Images } from '../../create/components/Step3Images';
import { Step4VariantsTags } from '../../create/components/Step4VariantsTags';
import type { ProductFormData, ProductStep } from '@/features/products/types';
import { validateProductStep } from '@/features/products/utils';
import { productsService, storeOwnerService } from '@/features/store/services';
import type { UpdateProductDto } from '@/features/store/types';
import { categoryService, type Category, productService } from '@daraa/api';

const STEPS: ProductStep[] = [
  { id: 1, name: 'المعلومات الأساسية', icon: Package },
  { id: 2, name: 'التسعير والمخزون', icon: Package },
  { id: 3, name: 'الصور والوسائط', icon: Package },
  { id: 4, name: 'المتغيرات والوسوم', icon: Package },
];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeId, setStoreId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Form states for Step 4
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
    trackQuantity: false,
    quantity: '',
    lowStockThreshold: '',
  });

  // Fetch product data
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productService.getById(productId),
    enabled: !!productId,
  });

  // Fetch store profile and check verification status
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
          toast.error('متجرك قيد المراجعة. يرجى انتظار الموافقة قبل تعديل المنتجات', {
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
        } else {
          toast.error('حالة المتجر غير صحيحة. يرجى التواصل مع الدعم الفني');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error fetching store profile:', error);

        if (error.response?.status === 404) {
          toast.error('لم يتم العثور على ملف المتجر. الرجاء إنشاء ملف المتجر أولاً', {
            duration: 5000,
          });
          setTimeout(() => {
            router.push('/settings/profile');
          }, 2000);
        } else if (error.response?.status === 401) {
          toast.error('يجب تسجيل الدخول أولاً');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } else {
          toast.error('فشل تحميل بيانات المتجر');
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
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        toast.error('فشل تحميل الفئات');
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Load product data into form
  useEffect(() => {
    if (product) {
      // Extract categoryId - it might be a populated object or a string
      let categoryId = '';
      if (typeof product.categoryId === 'string') {
        categoryId = product.categoryId;
      } else if (product.categoryId && typeof product.categoryId === 'object' && '_id' in product.categoryId) {
        categoryId = (product.categoryId as any)._id;
      }

      console.log('🔍 Product categoryId:', product.categoryId);
      console.log('✅ Extracted categoryId:', categoryId);

      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: categoryId,
        price: product.price?.toString() || '',
        compareAtPrice: product.compareAtPrice?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        images: product.images || [],
        variants: [],
        tags: product.tags || [],
        trackQuantity: product.trackQuantity || false,
        quantity: product.quantity?.toString() || '',
        lowStockThreshold: product.lowStockThreshold?.toString() || '',
      });
    }
  }, [product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

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
    try {
      setIsSubmitting(true);

      // Validate all steps
      const step1Validation = validateProductStep(1, formData);
      const step2Validation = validateProductStep(2, formData);

      if (!step1Validation.isValid || !step2Validation.isValid) {
        setErrors({ ...step1Validation.errors, ...step2Validation.errors });
        setCurrentStep(1);
        toast.error('يرجى تصحيح الأخطاء في النموذج');
        return;
      }

      // Prepare update data
      const updateData: UpdateProductDto = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.category,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      console.log('📤 Update data:', updateData);
      console.log('📤 categoryId:', updateData.categoryId, 'Type:', typeof updateData.categoryId);

      // Update product
      await productsService.updateProduct(productId, updateData);

      // Upload new images if any
      if (imageFiles.length > 0) {
        try {
          toast.loading('جاري رفع الصور...', { id: 'upload-images' });
          await productService.uploadImages(productId, imageFiles);

          // Clean up blob URLs
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
      toast.success('تم تحديث المنتج بنجاح!');
      setShowSuccess(true);

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['product', productId] });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push(`/products/${productId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'فشل تحديث المنتج');
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
          <Step2Pricing
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
          />
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

  // Loading state
  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل بيانات المنتج...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            لم يتم العثور على المنتج
          </h2>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة إلى المنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success Message */}
      <SuccessMessage show={showSuccess} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          href={`/products/${productId}`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى تفاصيل المنتج
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                تعديل المنتج
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

