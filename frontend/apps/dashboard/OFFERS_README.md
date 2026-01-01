# 🎁 نظام إدارة العروض - Dashboard

## 📋 نظرة عامة

نظام متكامل لإدارة العروض والخصومات في لوحة تحكم أصحاب المتاجر.

---

## 🚀 البدء السريع

### 1. تشغيل المشروع

```bash
# Backend
cd server
npm run start:dev

# Frontend
cd frontend/apps/dashboard
npm run dev
```

### 2. الوصول إلى النظام

```
http://localhost:3000/offers
```

---

## 📁 هيكل المجلدات

```
src/features/offers/
├── components/          # المكونات
│   ├── OfferCard.tsx
│   ├── OfferFilters.tsx
│   ├── OfferForm/
│   │   ├── OfferForm.tsx
│   │   ├── BasicInfoStep.tsx
│   │   ├── DiscountStep.tsx
│   │   ├── ProductsStep.tsx
│   │   └── ScheduleStep.tsx
│   ├── OfferStats.tsx
│   ├── OfferAnalytics.tsx
│   ├── OfferStatusBadge.tsx
│   ├── OfferDiscountBadge.tsx
│   └── OfferProductSelector.tsx
├── hooks/              # React Query Hooks
│   ├── useOffers.ts
│   ├── useOffer.ts
│   ├── useCreateOffer.ts
│   ├── useUpdateOffer.ts
│   ├── useDeleteOffer.ts
│   └── useOfferAnalytics.ts
├── services/           # API Services
│   └── offers.service.ts
├── types/              # TypeScript Types
│   └── index.ts
└── utils/              # Helper Functions
    └── offer-helpers.ts

src/app/(store-owner)/offers/
├── page.tsx            # قائمة العروض
├── create/
│   └── page.tsx        # إنشاء عرض
└── [id]/
    ├── page.tsx        # تفاصيل العرض
    └── edit/
        └── page.tsx    # تعديل العرض
```

---

## 🎯 الميزات الرئيسية

### ✅ إدارة العروض
- إنشاء عرض جديد (نموذج متعدد الخطوات)
- تعديل عرض موجود
- حذف عرض
- تفعيل/إيقاف عرض

### ✅ أنواع الخصم
- **نسبة مئوية**: خصم بنسبة معينة (مثل 20%)
- **مبلغ ثابت**: خصم بمبلغ محدد (مثل 50 ريال)

### ✅ خيارات متقدمة
- حد أدنى لمبلغ الشراء
- حد أقصى لقيمة الخصم
- تطبيق على جميع المنتجات أو منتجات محددة
- جدولة العروض (تاريخ بداية ونهاية)

### ✅ البحث والتصفية
- البحث بالعنوان
- التصفية حسب نوع الخصم
- التصفية حسب الحالة
- التصفية حسب التاريخ
- الترتيب والـ Pagination

### ✅ التحليلات
- عدد المشاهدات
- عدد الاستخدامات
- معدل التحويل

---

## 🔌 API Endpoints

### Public Endpoints
```
GET    /api/offers                      # جميع العروض
GET    /api/offers/:id                  # عرض واحد
GET    /api/offers/store/:storeId/active # العروض النشطة للمتجر
GET    /api/offers/product/:productId   # عروض المنتج
```

### Protected Endpoints (Store Owner)
```
GET    /api/offers/store/my             # عروض المتجر الخاص
POST   /api/offers/store                # إنشاء عرض
PUT    /api/offers/store/:id            # تحديث عرض
DELETE /api/offers/store/:id            # حذف عرض
GET    /api/offers/store/:id/analytics  # تحليلات العرض
```

---

## 💻 أمثلة الاستخدام

### جلب قائمة العروض

```typescript
import { useOffers } from '@/features/offers/hooks';

function OffersPage() {
  const { data, isLoading } = useOffers({
    page: 1,
    limit: 12,
    isActive: true,
  });

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div>
      {data?.data.map(offer => (
        <OfferCard key={offer._id} offer={offer} />
      ))}
    </div>
  );
}
```

### إنشاء عرض جديد

```typescript
import { useCreateOffer } from '@/features/offers/hooks';

function CreateOfferPage() {
  const { mutate: createOffer, isPending } = useCreateOffer();

  const handleSubmit = (data: CreateOfferDto) => {
    createOffer(data, {
      onSuccess: () => {
        toast.success('تم إنشاء العرض بنجاح');
        router.push('/offers');
      },
    });
  };

  return <OfferForm onSubmit={handleSubmit} isLoading={isPending} />;
}
```

### حساب قيمة الخصم

```typescript
import { calculateDiscount } from '@/features/offers/utils';

const offer = {
  discountType: 'percentage',
  discountValue: 20,
  maxDiscountAmount: 100,
};

const originalPrice = 500;
const discount = calculateDiscount(offer, originalPrice);
// discount = 100 (20% من 500 = 100، ولكن الحد الأقصى 100)

const finalPrice = originalPrice - discount;
// finalPrice = 400
```

---

## 🎨 المكونات الرئيسية

### OfferCard
بطاقة عرض العرض في القائمة

```typescript
<OfferCard offer={offer} />
```

### OfferForm
نموذج متعدد الخطوات لإنشاء/تعديل العرض

```typescript
<OfferForm
  initialData={offer}
  onSubmit={handleSubmit}
  isLoading={isLoading}
/>
```

### OfferFilters
فلاتر البحث والتصفية

```typescript
<OfferFilters
  filters={filters}
  onFiltersChange={setFilters}
/>
```

### OfferAnalytics
عرض تحليلات العرض

```typescript
<OfferAnalytics offerId={offerId} />
```

---

## 📚 الملفات المرجعية

- `OFFERS_BACKEND_INTEGRATION.md` - دليل الربط مع الـ Backend
- `OFFERS_TESTING_GUIDE.md` - دليل الاختبار الشامل
- `OFFERS_SUMMARY.md` - ملخص كامل للنظام

---

## 🔐 الأمان

- ✅ جميع الـ endpoints محمية بـ JWT Authentication
- ✅ التحقق من دور المستخدم (Store Owner)
- ✅ Validation على Frontend و Backend
- ✅ HTTP-only cookies للـ tokens

---

## 🐛 استكشاف الأخطاء

### المشكلة: "Network Error"
**الحل**: تأكد من تشغيل الـ Backend على `http://localhost:3001`

### المشكلة: "401 Unauthorized"
**الحل**: سجل الدخول من `/auth/login`

### المشكلة: "403 Forbidden"
**الحل**: تأكد من تسجيل الدخول بحساب Store Owner

### المشكلة: العروض لا تظهر
**الحل**: تحقق من:
1. الـ Backend يعمل
2. تسجيل الدخول صحيح
3. الـ Network tab في DevTools

---

## 📞 الدعم

للمزيد من المعلومات، راجع:
- [Backend Integration Guide](./OFFERS_BACKEND_INTEGRATION.md)
- [Testing Guide](./OFFERS_TESTING_GUIDE.md)
- [Complete Summary](./OFFERS_SUMMARY.md)

