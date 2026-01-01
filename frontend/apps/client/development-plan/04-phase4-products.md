# 📦 Phase 4: المنتجات والبحث

## المدة: 5-6 أيام
## الأولوية: 🔴 عالية

---

## 📋 الصفحات المطلوبة

### 1. صفحة المنتجات (Listing)
**المسار:** `/products`
**الملف:** `src/app/(main)/products/page.tsx`

**المتطلبات:**
- فلترة حسب (التصنيف، السعر، التقييم، المتجر)
- ترتيب (الأحدث، السعر، الأكثر مبيعاً، التقييم)
- عرض Grid أو List
- Pagination أو Infinite Scroll
- حفظ الفلاتر في URL

### 2. صفحة تفاصيل المنتج
**المسار:** `/products/[slug]`
**الملف:** `src/app/(main)/products/[slug]/page.tsx`

**المتطلبات:**
- معرض صور (Gallery)
- معلومات المنتج (اسم، وصف، سعر)
- اختيار المتغيرات (لون، حجم)
- اختيار الكمية
- إضافة للسلة
- إضافة للمفضلة
- معلومات المتجر
- التقييمات والمراجعات
- منتجات مشابهة

### 3. صفحة البحث
**المسار:** `/search`
**الملف:** `src/app/(main)/search/page.tsx`

**المتطلبات:**
- بحث نصي
- اقتراحات أثناء الكتابة
- فلترة النتائج
- تاريخ البحث

---

## 📁 هيكل الملفات

```
src/
├── app/
│   └── (main)/
│       ├── products/
│       │   ├── page.tsx              # قائمة المنتجات
│       │   └── [slug]/
│       │       └── page.tsx          # تفاصيل المنتج
│       └── search/
│           └── page.tsx              # نتائج البحث
├── features/
│   └── products/
│       ├── components/
│       │   ├── ProductList.tsx
│       │   ├── ProductGrid.tsx
│       │   ├── ProductCard.tsx
│       │   ├── ProductDetails.tsx
│       │   ├── ProductGallery.tsx
│       │   ├── ProductInfo.tsx
│       │   ├── ProductVariants.tsx
│       │   ├── QuantitySelector.tsx
│       │   ├── AddToCartButton.tsx
│       │   ├── WishlistButton.tsx
│       │   ├── ProductFilters.tsx
│       │   ├── ProductSort.tsx
│       │   ├── SearchBar.tsx
│       │   ├── SearchSuggestions.tsx
│       │   └── RelatedProducts.tsx
│       ├── hooks/
│       │   ├── useProducts.ts
│       │   ├── useProduct.ts
│       │   ├── useSearch.ts
│       │   ├── useFilters.ts
│       │   └── useInfiniteProducts.ts
│       ├── services/
│       │   └── products.service.ts
│       └── types/
│           └── products.types.ts
```

---

## 🔧 المكونات المطلوبة

### ProductGallery Component
```typescript
interface ProductGalleryProps {
  images: string[];
  productName: string;
}
// - Thumbnail navigation
// - Zoom on hover
// - Lightbox on click
// - Swipe on mobile
```

### ProductVariants Component
```typescript
interface ProductVariantsProps {
  variants: {
    name: string; // مثل "اللون" أو "الحجم"
    options: {
      value: string;
      label: string;
      available: boolean;
      image?: string;
    }[];
  }[];
  selected: Record<string, string>;
  onChange: (key: string, value: string) => void;
}
```

### QuantitySelector Component
```typescript
interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number; // حسب المخزون
}
```

### ProductFilters Component
```typescript
interface ProductFiltersProps {
  categories: Category[];
  priceRange: { min: number; max: number };
  ratings: number[];
  stores: Store[];
  selected: FilterState;
  onChange: (filters: FilterState) => void;
}
// - Collapsible sections
// - Price range slider
// - Checkbox lists
// - Clear filters button
```

### SearchBar Component
```typescript
interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: string[];
  recentSearches?: string[];
}
```

---

## 🔗 الـ API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/products` | قائمة المنتجات |
| GET | `/products/:slug` | تفاصيل منتج |
| GET | `/products/search` | بحث المنتجات |
| GET | `/products/:id/related` | منتجات مشابهة |
| GET | `/products/:id/reviews` | تقييمات المنتج |

**Query Parameters للـ `/products`:**
```
?page=1
&limit=20
&category=electronics
&minPrice=100
&maxPrice=5000
&rating=4
&store=store-id
&sort=price_asc
&search=samsung
```

---

## ✅ معايير الإنجاز

- [ ] قائمة المنتجات تعمل
- [ ] الفلترة تعمل
- [ ] الترتيب يعمل
- [ ] صفحة التفاصيل تعمل
- [ ] معرض الصور يعمل
- [ ] المتغيرات تعمل
- [ ] البحث يعمل
- [ ] Infinite scroll أو pagination

---

## ➡️ المرحلة التالية

بعد إكمال هذه المرحلة، انتقل إلى `05-phase5-cart-checkout.md`

