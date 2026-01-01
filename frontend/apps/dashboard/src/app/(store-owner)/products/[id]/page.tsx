/**
 * Product Details Page
 * View product details with edit and delete options
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  Package,
  Edit,
  Trash2,
  DollarSign,
  Barcode,
  Tag,
  Calendar,
  Loader2,
} from 'lucide-react';
import { productService } from '@daraa/api';
import { productsService } from '@/features/store/services';
import { DeleteModal } from './components/DeleteModal';
import { ProductGallery } from './components/ProductGallery';
import { ProductInfo } from './components/ProductInfo';
import { ProductStats } from './components/ProductStats';
import { ProductPricing } from './components/ProductPricing';
import { ProductVariants } from './components/ProductVariants';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productId = params.id as string;
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch product data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productService.getById(productId),
    enabled: !!productId,
  });

  // Handle delete
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await productsService.deleteProduct(productId);
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast.success('تم حذف المنتج بنجاح');
      router.push('/products');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'فشل حذف المنتج');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price) + ' ل.س';
  };

  // Calculate discount
  const discount = product?.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  // Loading state
  if (isLoading) {
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
  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            لم يتم العثور على المنتج
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ? 'حدث خطأ أثناء تحميل المنتج' : 'المنتج المطلوب غير موجود أو تم حذفه'}
          </p>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {(error as any)?.message || 'خطأ غير معروف'}
            </p>
          )}
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
      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        productName={product.name}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى المنتجات
        </Link>

        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                تفاصيل المنتج
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {product.sku && `SKU: ${product.sku}`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/products/${productId}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">تعديل</span>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">حذف</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
          </motion.div>

          {/* Variants */}
          {product.tags && product.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-pink-500" />
                الوسوم
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800 text-gray-900 dark:text-white text-sm font-medium"
                  >
                    # {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <ProductPricing
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            discount={discount}
            formatPrice={formatPrice}
          />

          {/* Product Info */}
          <ProductInfo
            sku={product.sku}
            barcode={product.barcode}
            createdAt={product.createdAt}
            updatedAt={product.updatedAt}
          />
        </div>
      </div>
    </>
  );
}

