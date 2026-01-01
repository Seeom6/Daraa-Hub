# ⭐ Phase 8: التقييمات والمفضلة

## المدة: 3-4 أيام
## الأولوية: 🟡 متوسطة

---

## 📋 الصفحات المطلوبة

### 1. صفحة المفضلة (Wishlist)
**المسار:** `/wishlist`
**الملف:** `src/app/(main)/wishlist/page.tsx`

**المتطلبات:**
- عرض المنتجات المفضلة
- إزالة من المفضلة
- إضافة للسلة
- مشاركة القائمة

### 2. صفحة تقييماتي
**المسار:** `/my-reviews`
**الملف:** `src/app/(main)/my-reviews/page.tsx`

**المتطلبات:**
- عرض التقييمات التي كتبتها
- تعديل التقييم
- حذف التقييم

### 3. نموذج إضافة تقييم
**Modal أو صفحة منفصلة**

---

## 📁 هيكل الملفات

```
src/
├── app/
│   └── (main)/
│       ├── wishlist/
│       │   └── page.tsx
│       └── my-reviews/
│           └── page.tsx
├── features/
│   ├── wishlist/
│   │   ├── components/
│   │   │   ├── WishlistItem.tsx
│   │   │   ├── WishlistGrid.tsx
│   │   │   ├── EmptyWishlist.tsx
│   │   │   └── WishlistButton.tsx
│   │   ├── hooks/
│   │   │   ├── useWishlist.ts
│   │   │   ├── useAddToWishlist.ts
│   │   │   └── useRemoveFromWishlist.ts
│   │   ├── services/
│   │   │   └── wishlist.service.ts
│   │   └── store/
│   │       └── wishlistStore.ts
│   └── reviews/
│       ├── components/
│       │   ├── ReviewCard.tsx
│       │   ├── ReviewList.tsx
│       │   ├── ReviewForm.tsx
│       │   ├── ReviewModal.tsx
│       │   ├── StarRating.tsx
│       │   ├── RatingBreakdown.tsx
│       │   ├── ReviewImages.tsx
│       │   └── MyReviewCard.tsx
│       ├── hooks/
│       │   ├── useReviews.ts
│       │   ├── useMyReviews.ts
│       │   ├── useCreateReview.ts
│       │   ├── useUpdateReview.ts
│       │   └── useDeleteReview.ts
│       ├── services/
│       │   └── reviews.service.ts
│       └── types/
│           └── reviews.types.ts
```

---

## 🔧 المكونات المطلوبة

### WishlistButton Component
```typescript
interface WishlistButtonProps {
  productId: string;
  isInWishlist: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}
// أيقونة قلب (ممتلئ/فارغ)
```

### WishlistItem Component
```typescript
interface WishlistItemProps {
  product: Product;
  onRemove: () => void;
  onAddToCart: () => void;
}
```

### StarRating Component
```typescript
interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}
```

### RatingBreakdown Component
```typescript
interface RatingBreakdownProps {
  ratings: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalReviews: number;
  averageRating: number;
}
// شريط تقدم لكل نجمة
```

### ReviewForm Component
```typescript
interface ReviewFormProps {
  productId: string;
  orderId?: string;
  initialData?: Review;
  onSubmit: (data: ReviewInput) => void;
  onCancel: () => void;
}
// الحقول: التقييم، العنوان، التعليق، الصور
```

### ReviewCard Component
```typescript
interface ReviewCardProps {
  review: Review;
  showProduct?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onHelpful?: () => void;
}
```

---

## 🔗 الـ API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/wishlist` | المفضلة |
| POST | `/wishlist/:productId` | إضافة للمفضلة |
| DELETE | `/wishlist/:productId` | إزالة من المفضلة |
| GET | `/reviews/my` | تقييماتي |
| GET | `/products/:id/reviews` | تقييمات منتج |
| POST | `/reviews` | إضافة تقييم |
| PUT | `/reviews/:id` | تعديل تقييم |
| DELETE | `/reviews/:id` | حذف تقييم |
| POST | `/reviews/:id/helpful` | مفيد |
| POST | `/reviews/:id/report` | إبلاغ |

---

## 🎨 تصميم التقييمات

### Rating Breakdown
```
⭐⭐⭐⭐⭐  4.8 من 5
━━━━━━━━━━━━━━━━━━━━

5 ⭐  ████████████████░░  80%
4 ⭐  ████░░░░░░░░░░░░░░  15%
3 ⭐  █░░░░░░░░░░░░░░░░░   3%
2 ⭐  ░░░░░░░░░░░░░░░░░░   1%
1 ⭐  ░░░░░░░░░░░░░░░░░░   1%

234 تقييم
```

### Review Card
```
┌─────────────────────────────────────────────────────┐
│  👤 أحمد محمد          ⭐⭐⭐⭐⭐  منذ 3 أيام      │
│  ✓ مشتري موثق                                      │
├─────────────────────────────────────────────────────┤
│  منتج رائع وجودة ممتازة                            │
│                                                     │
│  الجودة ممتازة والتوصيل سريع. أنصح بالشراء من      │
│  هذا المتجر.                                       │
│                                                     │
│  ┌────┐ ┌────┐ ┌────┐                              │
│  │ 📷 │ │ 📷 │ │ 📷 │  (صور المراجعة)              │
│  └────┘ └────┘ └────┘                              │
├─────────────────────────────────────────────────────┤
│  👍 15 شخص وجد هذا مفيداً    [مفيد]  [إبلاغ]       │
└─────────────────────────────────────────────────────┘
```

---

## ✅ معايير الإنجاز

- [ ] المفضلة تعمل
- [ ] إضافة/إزالة من المفضلة
- [ ] عرض التقييمات
- [ ] إضافة تقييم مع صور
- [ ] تعديل/حذف تقييماتي
- [ ] StarRating interactive

---

## ➡️ المرحلة التالية

بعد إكمال هذه المرحلة، انتقل إلى `09-phase9-notifications.md`

