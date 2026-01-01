'use client';

/**
 * Home Page Component
 * Main landing page with all sections
 */

import { toast } from 'react-hot-toast';
import {
  HeroBanner,
  CategoriesSlider,
  FeaturedProducts,
  FlashDeals,
} from '@/features/home/components';
import {
  useBanners,
  useHomeFeaturedProducts,
  useFlashDeals,
  useHomeNewArrivals,
} from '@/features/home/hooks/useHomeData';
import { useRootCategories } from '@/features/categories/hooks/useCategories';
import { Spinner, ErrorMessage } from '@/components/ui';
import type { Product } from '@/features/shared/types';

export function HomePage() {
  // Fetch data
  const { data: bannersData, isLoading: bannersLoading } = useBanners();
  const { data: categoriesData, isLoading: categoriesLoading } = useRootCategories();
  const { data: featuredData, isLoading: featuredLoading } = useHomeFeaturedProducts(12);
  const { data: flashDealsData, isLoading: flashDealsLoading } = useFlashDeals();
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useHomeNewArrivals(12);

  // Handlers
  const handleAddToCart = (product: Product) => {
    // TODO: Implement add to cart
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  };

  const handleToggleWishlist = (product: Product) => {
    // TODO: Implement wishlist toggle
    toast.success(`تمت إضافة ${product.name} إلى المفضلة`);
  };

  const handleDealEnd = () => {
    toast('انتهى العرض!', { icon: '⏰' });
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      {bannersLoading ? (
        <div className="h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-2xl">
          <Spinner size="lg" />
        </div>
      ) : bannersData?.banners && bannersData.banners.length > 0 ? (
        <HeroBanner banners={bannersData.banners} />
      ) : null}

      {/* Categories Slider */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          التصنيفات
        </h2>
        {categoriesLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : categoriesData?.categories && categoriesData.categories.length > 0 ? (
          <CategoriesSlider categories={categoriesData.categories} />
        ) : (
          <ErrorMessage message="لا توجد تصنيفات متاحة" />
        )}
      </section>

      {/* Flash Deals */}
      {flashDealsData?.deals && flashDealsData.deals.length > 0 && (
        <FlashDeals
          deal={flashDealsData.deals[0]}
          isLoading={flashDealsLoading}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          onDealEnd={handleDealEnd}
        />
      )}

      {/* Featured Products */}
      {featuredData?.products && featuredData.products.length > 0 && (
        <FeaturedProducts
          products={featuredData.products}
          isLoading={featuredLoading}
          title="المنتجات المميزة"
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {/* New Arrivals */}
      {newArrivalsData?.products && newArrivalsData.products.length > 0 && (
        <FeaturedProducts
          products={newArrivalsData.products}
          isLoading={newArrivalsLoading}
          title="وصل حديثاً"
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {/* Empty State */}
      {!bannersLoading &&
        !categoriesLoading &&
        !featuredLoading &&
        !flashDealsLoading &&
        !newArrivalsLoading &&
        (!bannersData?.banners || bannersData.banners.length === 0) &&
        (!categoriesData?.categories || categoriesData.categories.length === 0) &&
        (!featuredData?.products || featuredData.products.length === 0) &&
        (!flashDealsData?.deals || flashDealsData.deals.length === 0) &&
        (!newArrivalsData?.products || newArrivalsData.products.length === 0) && (
          <div className="text-center py-12">
            <ErrorMessage
              message="لا توجد بيانات متاحة حالياً"
              variant="card"
            />
          </div>
        )}
    </div>
  );
}

