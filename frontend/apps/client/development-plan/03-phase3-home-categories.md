# 🏠 Phase 3: الصفحة الرئيسية والتصنيفات

## المدة: 3-4 أيام
## الأولوية: 🔴 عالية

---

## 📋 الصفحات المطلوبة

### 1. الصفحة الرئيسية (Home)
**المسار:** `/`
**الملف:** `src/app/(main)/page.tsx`

**الأقسام:**
1. **Hero Section** - بانر رئيسي مع عروض
2. **Categories Slider** - شريط التصنيفات
3. **Featured Products** - المنتجات المميزة
4. **Flash Deals** - عروض سريعة (مع عداد تنازلي)
5. **New Arrivals** - المنتجات الجديدة
6. **Top Stores** - أفضل المتاجر
7. **Brands Section** - العلامات التجارية

### 2. صفحة التصنيفات
**المسار:** `/categories`
**الملف:** `src/app/(main)/categories/page.tsx`

### 3. صفحة تصنيف محدد
**المسار:** `/categories/[slug]`
**الملف:** `src/app/(main)/categories/[slug]/page.tsx`

---

## 📁 هيكل الملفات

```
src/
├── app/
│   └── (main)/
│       ├── layout.tsx              # Main Layout
│       ├── page.tsx                # الرئيسية
│       └── categories/
│           ├── page.tsx            # كل التصنيفات
│           └── [slug]/
│               └── page.tsx        # تصنيف محدد
├── features/
│   ├── home/
│   │   ├── components/
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── CategoriesSlider.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── FlashDeals.tsx
│   │   │   ├── NewArrivals.tsx
│   │   │   ├── TopStores.tsx
│   │   │   └── BrandsSection.tsx
│   │   ├── hooks/
│   │   │   ├── useHomeData.ts
│   │   │   └── useFlashDeals.ts
│   │   └── services/
│   │       └── home.service.ts
│   └── categories/
│       ├── components/
│       │   ├── CategoryCard.tsx
│       │   ├── CategoryGrid.tsx
│       │   └── CategoryBreadcrumb.tsx
│       ├── hooks/
│       │   ├── useCategories.ts
│       │   └── useCategory.ts
│       └── services/
│           └── categories.service.ts
└── components/
    └── ui/
        ├── Carousel.tsx
        ├── CountdownTimer.tsx
        └── ProductCard.tsx
```

---

## 🔧 المكونات المطلوبة

### HeroBanner Component
```typescript
// بانر متحرك مع Swiper/Embla
interface HeroBannerProps {
  slides: {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    link: string;
  }[];
  autoplay?: boolean;
}
```

### CategoriesSlider Component
```typescript
// شريط تصنيفات أفقي
interface CategoriesSliderProps {
  categories: Category[];
  showAll?: boolean;
}
```

### FlashDeals Component
```typescript
// عروض مع عداد تنازلي
interface FlashDealsProps {
  products: Product[];
  endTime: Date;
}
```

### CountdownTimer Component
```typescript
// عداد تنازلي
interface CountdownTimerProps {
  endTime: Date;
  onEnd?: () => void;
}
```

### ProductCard Component
```typescript
interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
  showAddToCart?: boolean;
  showWishlist?: boolean;
}
```

---

## 🔗 الـ API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/home/banners` | بانرات الصفحة الرئيسية |
| GET | `/home/featured` | المنتجات المميزة |
| GET | `/home/flash-deals` | العروض السريعة |
| GET | `/home/new-arrivals` | المنتجات الجديدة |
| GET | `/categories` | كل التصنيفات |
| GET | `/categories/:slug` | تصنيف محدد |
| GET | `/categories/:slug/products` | منتجات تصنيف |

---

## 🎨 التصميم

### Hero Banner
- عرض كامل الشاشة
- Autoplay مع dots
- Gradient overlay للنص
- CTAs واضحة

### Categories Grid
- شبكة responsive (2/3/4/6 أعمدة)
- أيقونات ملونة
- تأثير hover

### Product Cards
- صورة مربعة
- اسم المنتج (سطر واحد)
- السعر (قديم/جديد)
- تقييم بالنجوم
- زر إضافة للسلة

---

## ✅ معايير الإنجاز

- [ ] الصفحة الرئيسية تعمل
- [ ] البيانات تُحمل من API
- [ ] Carousel يعمل
- [ ] التصنيفات تظهر
- [ ] العداد التنازلي يعمل
- [ ] Responsive design

---

## ➡️ المرحلة التالية

بعد إكمال هذه المرحلة، انتقل إلى `04-phase4-products.md`

