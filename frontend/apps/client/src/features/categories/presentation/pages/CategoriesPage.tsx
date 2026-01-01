'use client';

/**
 * Categories Page Component
 * Displays all categories in a grid
 */

import { CategoryCard } from '@/components/ui/CategoryCard';
import { Spinner, ErrorMessage } from '@/components/ui';
import { useCategories } from '@/features/categories/hooks/useCategories';

export function CategoriesPage() {
  const { data, isLoading, error } = useCategories({ isActive: true });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorMessage message="حدث خطأ أثناء تحميل التصنيفات" />
      </div>
    );
  }

  if (!data?.categories || data.categories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorMessage message="لا توجد تصنيفات متاحة" variant="card" />
      </div>
    );
  }

  // Group categories by level
  const rootCategories = data.categories.filter((cat) => cat.level === 0);
  const subCategories = data.categories.filter((cat) => cat.level > 0);

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          التصنيفات
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          تصفح جميع التصنيفات واكتشف المنتجات التي تبحث عنها
        </p>
      </div>

      {/* Root Categories */}
      {rootCategories.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            التصنيفات الرئيسية
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {rootCategories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                variant="default"
                showProductCount={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sub Categories */}
      {subCategories.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            التصنيفات الفرعية
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {subCategories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                variant="compact"
                showProductCount={true}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

