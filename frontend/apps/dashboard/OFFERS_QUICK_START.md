# 🚀 نظام العروض - دليل البدء السريع

## 📦 التثبيت

النظام جاهز للاستخدام! لا حاجة لتثبيت dependencies إضافية.

## 🔌 ربط الـ Backend

### 1. تأكد من وجود الـ API Endpoints

يجب أن يوفر الـ Backend الـ endpoints التالية:

```
GET    /api/offers              - جلب قائمة العروض
GET    /api/offers/:id          - جلب عرض واحد
POST   /api/offers              - إنشاء عرض جديد
PUT    /api/offers/:id          - تحديث عرض
DELETE /api/offers/:id          - حذف عرض
```

### 2. تحديث الـ API Client

تأكد من أن `apiClient` في `lib/api-client.ts` يشير إلى الـ Backend الصحيح.

## 🎯 الاستخدام

### 1. الوصول إلى صفحة العروض

```
http://localhost:3000/offers
```

### 2. إنشاء عرض جديد

#### الخطوة 1: المعلومات الأساسية
- أدخل عنوان العرض (مطلوب)
- أدخل الوصف (اختياري)
- ارفع صورة بانر (اختياري)

#### الخطوة 2: تفاصيل الخصم
- اختر نوع الخصم:
  - **نسبة مئوية**: مثال 25%
  - **مبلغ ثابت**: مثال 50,000 ل.س
- أدخل قيمة الخصم (مطلوب)
- أدخل الحد الأدنى للشراء (اختياري)
- أدخل الحد الأقصى للخصم (اختياري، للنسب المئوية فقط)

#### الخطوة 3: المنتجات المطبقة
- اختر "تطبيق على جميع المنتجات" أو
- اختر منتجات محددة من القائمة

#### الخطوة 4: الجدولة والتفعيل
- حدد تاريخ البدء
- حدد تاريخ الانتهاء
- فعّل أو عطّل العرض
- راجع الملخص

### 3. تعديل عرض

1. انقر على "تعديل" في بطاقة العرض
2. قم بتعديل المعلومات المطلوبة
3. انقر على "حفظ التعديلات"

### 4. حذف عرض

1. انقر على "حذف" في بطاقة العرض
2. أكد الحذف

## 💻 استخدام الـ Hooks في الكود

### جلب قائمة العروض

```typescript
import { useOffers } from '@/features/offers/hooks';

function MyComponent() {
  const { data, isLoading, error } = useOffers({
    page: 1,
    limit: 10,
    search: 'خصم',
    discountType: 'percentage',
    currentOnly: true,
  });

  if (isLoading) return <div>جاري التحميل...</div>;
  if (error) return <div>حدث خطأ</div>;

  return (
    <div>
      {data?.data.map((offer) => (
        <div key={offer._id}>{offer.title}</div>
      ))}
    </div>
  );
}
```

### إنشاء عرض جديد

```typescript
import { useCreateOffer } from '@/features/offers/hooks';

function CreateOfferButton() {
  const createOffer = useCreateOffer();

  const handleCreate = async () => {
    await createOffer.mutateAsync({
      title: 'خصم 50%',
      discountType: 'percentage',
      discountValue: 50,
      applicableProducts: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
  };

  return (
    <button onClick={handleCreate} disabled={createOffer.isPending}>
      {createOffer.isPending ? 'جاري الإنشاء...' : 'إنشاء عرض'}
    </button>
  );
}
```

### تحديث عرض

```typescript
import { useUpdateOffer } from '@/features/offers/hooks';

function UpdateOfferButton({ offerId }: { offerId: string }) {
  const updateOffer = useUpdateOffer();

  const handleUpdate = async () => {
    await updateOffer.mutateAsync({
      id: offerId,
      data: {
        title: 'خصم محدث',
        isActive: false,
      },
    });
  };

  return (
    <button onClick={handleUpdate} disabled={updateOffer.isPending}>
      تحديث
    </button>
  );
}
```

### حذف عرض

```typescript
import { useDeleteOffer } from '@/features/offers/hooks';

function DeleteOfferButton({ offerId }: { offerId: string }) {
  const deleteOffer = useDeleteOffer();

  const handleDelete = async () => {
    if (confirm('هل أنت متأكد؟')) {
      await deleteOffer.mutateAsync(offerId);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteOffer.isPending}>
      حذف
    </button>
  );
}
```

## 🎨 استخدام المكونات

### OfferCard

```typescript
import { OfferCard } from '@/features/offers/components';

<OfferCard
  offer={offer}
  onEdit={(offer) => router.push(`/offers/${offer._id}/edit`)}
  onDelete={(offer) => handleDelete(offer._id)}
  onView={(offer) => router.push(`/offers/${offer._id}`)}
/>
```

### OfferBadge

```typescript
import { OfferBadge } from '@/features/offers/components';

<OfferBadge offer={offer} className="absolute top-2 right-2" />
```

### OfferStats

```typescript
import { OfferStats } from '@/features/offers/components';

<OfferStats
  analytics={{
    viewCount: 1250,
    usageCount: 85,
    conversionRate: 6.8,
  }}
/>
```

## 🔧 استخدام الـ Utils

### حساب الخصم

```typescript
import { calculateDiscountAmount, calculateFinalPrice } from '@/features/offers/utils';

const discountAmount = calculateDiscountAmount(offer, 100000);
const finalPrice = calculateFinalPrice(offer, 100000);
```

### التحقق من تطبيق العرض

```typescript
import { isOfferApplicable } from '@/features/offers/utils';

const canApply = isOfferApplicable(offer, productId, 100000);
```

### الحصول على حالة العرض

```typescript
import { getOfferStatus } from '@/features/offers/utils';

const status = getOfferStatus(offer); // 'active' | 'upcoming' | 'expired' | 'disabled'
```

### تنسيق الخصم

```typescript
import { formatDiscount, formatDateRange } from '@/features/offers/utils';

const discountText = formatDiscount(offer); // "25%" أو "50,000 ل.س"
const dateRange = formatDateRange(offer.startDate, offer.endDate);
```

## 🐛 استكشاف الأخطاء

### الخطأ: "Cannot find module '@/features/offers'"

تأكد من أن المسار صحيح في `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### الخطأ: "API endpoint not found"

تأكد من أن الـ Backend يعمل وأن الـ endpoints متاحة.

### الخطأ: "Validation failed"

تحقق من أن جميع الحقول المطلوبة مملوءة بشكل صحيح.

## 📚 المزيد من المعلومات

- راجع `features/offers/README.md` للتوثيق الكامل
- راجع `OFFERS_SYSTEM_SUMMARY.md` للملخص الشامل
- راجع `OFFERS_CHECKLIST.md` للتحقق من الاكتمال

