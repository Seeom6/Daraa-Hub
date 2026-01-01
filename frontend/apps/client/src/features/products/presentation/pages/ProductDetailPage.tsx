'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, ShoppingCart, Heart, Share2, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductGallery, QuantitySelector } from '@/features/products/components';
import { useProduct, useRelatedProducts } from '@/features/products/hooks/useProducts';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ProductCard } from '@/components/ui/ProductCard';
import { toast } from 'react-hot-toast';

export interface ProductDetailPageProps {
  slug: string;
}

export function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const { data: product, isLoading, error } = useProduct(slug);
  const { data: relatedData } = useRelatedProducts(product?._id || '', 4);

  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message="المنتج غير موجود" variant="card" />
      </div>
    );
  }

  const handleAddToCart = () => {
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    toast.success(isInWishlist ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط');
    }
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
        <Link href="/" className="hover:text-white transition-colors">
          الرئيسية
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:text-white transition-colors">
          المنتجات
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Gallery */}
        <div>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Title & Rating */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-3">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-white/20'
                    }`}
                  />
                ))}
                <span className="text-white/60 text-sm mr-2">
                  ({product.reviewCount || 0} تقييم)
                </span>
              </div>
              <span className="text-white/40">|</span>
              <span className="text-white/60 text-sm">
                {product.soldCount || 0} مبيعات
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">
              {product.price.toLocaleString()} ل.س
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-white/40 line-through">
                  {product.compareAtPrice.toLocaleString()} ل.س
                </span>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.shortDescription && (
            <p className="text-white/80 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Variants - TODO: Implement when backend provides variant options */}
          {/* {product.variants && product.variants.length > 0 && (
            <ProductVariants
              variants={[]}
              selected={selectedVariants}
              onChange={handleVariantChange}
            />
          )} */}

          {/* Quantity */}
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            max={product.inventory?.stock || 999}
          />

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              أضف إلى السلة
            </motion.button>

            <motion.button
              onClick={handleToggleWishlist}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-xl border transition-colors ${
                isInWishlist
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-white/5 border-white/10 text-white hover:border-white/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-white/5 border border-white/10 rounded-xl text-white hover:border-white/30 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Store Info */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <Link
              href={`/stores/${product.storeId}`}
              className="flex items-center gap-3 group"
            >
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/60">المتجر</p>
                <p className="text-white font-medium group-hover:text-primary transition-colors">
                  {product.storeId}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>

      {/* Description Tab */}
      {product.description && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">الوصف</h2>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-white/80 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedData && relatedData.products.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">منتجات مشابهة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedData.products.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct._id}
                product={relatedProduct}
                onAddToCart={() => toast.success(`تمت إضافة ${relatedProduct.name} إلى السلة`)}
                onToggleWishlist={() => toast.success(`تمت إضافة ${relatedProduct.name} إلى المفضلة`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

