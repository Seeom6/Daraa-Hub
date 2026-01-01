/**
 * Home Page
 * Main landing page for Sillap platform
 */

import {
  MainLayout,
  HeroSection,
  ContentSection,
  FeatureSection,
  ProductGrid,
  CategoryGrid
} from '@/components';
import { ShoppingBag, Truck, Shield, HeadphonesIcon } from 'lucide-react';

export default function HomePage() {
  // Sample features data
  const features = [
    {
      id: '1',
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'منتجات متنوعة',
      description: 'آلاف المنتجات من مختلف الفئات بأفضل الأسعار',
    },
    {
      id: '2',
      icon: <Truck className="w-8 h-8" />,
      title: 'توصيل سريع',
      description: 'خدمة توصيل سريعة وآمنة لجميع المحافظات',
    },
    {
      id: '3',
      icon: <Shield className="w-8 h-8" />,
      title: 'دفع آمن',
      description: 'نظام دفع آمن ومشفر لحماية معلوماتك',
    },
    {
      id: '4',
      icon: <HeadphonesIcon className="w-8 h-8" />,
      title: 'دعم 24/7',
      description: 'فريق دعم متاح على مدار الساعة لمساعدتك',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <HeroSection
        title="تسوق أفضل المنتجات في سوريا"
        description="اكتشف مجموعتنا الواسعة من المنتجات عالية الجودة بأسعار منافسة. تسوق الآن واستمتع بتجربة تسوق فريدة."
        actions={
          <>
            <button className="btn-primary">
              تصفح المنتجات
            </button>
            <button className="btn-secondary">
              تعرف علينا
            </button>
          </>
        }
        image={
          <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-32 h-32 text-white" />
          </div>
        }
      />

      {/* Features Section */}
      <FeatureSection
        features={features}
        title="لماذا تختار Sillap؟"
        description="نوفر لك أفضل تجربة تسوق عبر الإنترنت"
        columns={4}
        background="white"
      />

      {/* Categories Section */}
      <ContentSection
        title="تصفح حسب الفئة"
        description="اختر الفئة المناسبة لك"
        spacing="xl"
      >
        <CategoryGrid>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="glass-card p-6 text-center space-y-3 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-gray-900 dark:text-gray-100">فئة {i}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {Math.floor(Math.random() * 100)} منتج
              </p>
            </div>
          ))}
        </CategoryGrid>
      </ContentSection>

      {/* Products Section */}
      <ContentSection
        title="المنتجات المميزة"
        description="أحدث المنتجات المضافة"
        spacing="xl"
        background="white"
      >
        <ProductGrid>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="glass-card group overflow-hidden hover:shadow-2xl transition-all"
            >
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <ShoppingBag className="w-20 h-20 text-white" />
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="text-gray-900 dark:text-gray-100">
                  منتج {i}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  وصف قصير للمنتج يوضح أهم المميزات
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-blue-500 font-semibold">
                    {(Math.random() * 1000 + 100).toFixed(0)} ل.س
                  </span>
                  <button className="btn-primary px-4 py-2 text-sm">
                    إضافة للسلة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </ProductGrid>
      </ContentSection>

      {/* CTA Section */}
      <ContentSection
        spacing="xl"
        background="gray"
      >
        <div className="glass-card p-12 text-center space-y-6">
          <h2 className="text-gray-900 dark:text-gray-100">
            هل أنت مستعد للبدء؟
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            انضم إلى آلاف العملاء الذين يثقون بنا واستمتع بتجربة تسوق فريدة
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn-primary">
              ابدأ التسوق الآن
            </button>
            <button className="btn-secondary">
              تواصل معنا
            </button>
          </div>
        </div>
      </ContentSection>
    </MainLayout>
  );
}

