# Offers Feature

نظام إدارة العروض الترويجية والخصومات للمتاجر.

## 📁 الهيكل

```
offers/
├── types/              # TypeScript Types & Interfaces
│   └── index.ts
├── services/           # API Services
│   └── offers.service.ts
├── hooks/              # React Hooks
│   └── index.ts
├── components/         # UI Components
│   ├── OfferCard.tsx
│   ├── OfferBadge.tsx
│   ├── OfferStats.tsx
│   ├── OfferFilters.tsx
│   └── index.ts
├── utils/              # Utility Functions
│   ├── validation.ts
│   ├── calculations.ts
│   ├── formatters.ts
│   └── index.ts
└── index.ts            # Barrel Export
```

## 🎯 الميزات

### 1. إدارة العروض
- ✅ إنشاء عروض جديدة
- ✅ تعديل العروض الموجودة
- ✅ حذف العروض
- ✅ عرض قائمة العروض مع الفلاتر
- ✅ عرض تفاصيل العرض

### 2. أنواع الخصومات
- **نسبة مئوية**: خصم بنسبة معينة من السعر
- **مبلغ ثابت**: خصم بمبلغ محدد

### 3. شروط العرض
- الحد الأدنى لقيمة الطلب
- الحد الأقصى لقيمة الخصم (للنسب المئوية)
- تحديد المنتجات المطبقة (أو جميع المنتجات)
- تحديد فترة العرض (تاريخ البدء والانتهاء)

### 4. الإحصائيات
- عدد المشاهدات
- عدد الاستخدامات
- معدل التحويل

## 🔧 الاستخدام

### استيراد الـ Hooks

```typescript
import { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from '@/features/offers/hooks';

// في المكون
const { data, isLoading } = useOffers({ page: 1, limit: 10 });
const createOffer = useCreateOffer();
const updateOffer = useUpdateOffer();
const deleteOffer = useDeleteOffer();
```

### استيراد المكونات

```typescript
import { OfferCard, OfferBadge, OfferStats, OfferFilters } from '@/features/offers/components';

// استخدام OfferCard
<OfferCard
  offer={offer}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
/>

// استخدام OfferBadge
<OfferBadge offer={offer} />

// استخدام OfferStats
<OfferStats analytics={analytics} />
```

### استخدام الـ Utils

```typescript
import {
  validateOfferStep,
  formatDiscount,
  getOfferStatus,
  formatDateRange,
} from '@/features/offers/utils';

// التحقق من صحة البيانات
const validation = validateOfferStep(1, formData);

// تنسيق الخصم
const discountText = formatDiscount(offer); // "25%" أو "50,000 ل.س"

// الحصول على حالة العرض
const status = getOfferStatus(offer); // 'active' | 'upcoming' | 'expired' | 'disabled'

// تنسيق نطاق التاريخ
const dateRange = formatDateRange(startDate, endDate);
```

## 📄 الصفحات

### 1. قائمة العروض
**المسار**: `/offers`

عرض جميع العروض مع:
- فلاتر البحث
- فلتر نوع الخصم
- فلتر الحالة
- Pagination

### 2. إنشاء عرض
**المسار**: `/offers/create`

نموذج متعدد الخطوات:
1. المعلومات الأساسية (العنوان، الوصف، الصورة)
2. تفاصيل الخصم (النوع، القيمة، الشروط)
3. المنتجات المطبقة
4. الجدولة والتفعيل

### 3. تفاصيل العرض
**المسار**: `/offers/[id]`

عرض:
- معلومات العرض
- الإحصائيات
- تفاصيل الخصم
- الجدولة
- المنتجات

### 4. تعديل العرض
**المسار**: `/offers/[id]/edit`

نفس نموذج الإنشاء مع البيانات المحملة مسبقاً

## 🔄 API Endpoints

```typescript
// الحصول على جميع العروض
GET /api/offers?page=1&limit=10&search=...

// الحصول على عرض واحد
GET /api/offers/:id

// إنشاء عرض جديد
POST /api/offers

// تحديث عرض
PUT /api/offers/:id

// حذف عرض
DELETE /api/offers/:id
```

## 📝 Types

### Offer
```typescript
interface Offer {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  applicableProducts: string[] | Product[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  viewCount: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 المكونات

### OfferCard
بطاقة عرض العرض مع:
- الصورة
- العنوان والوصف
- تفاصيل الخصم
- الإحصائيات
- أزرار التحكم

### OfferBadge
شارة صغيرة لعرض الخصم على المنتجات

### OfferStats
عرض إحصائيات العرض:
- المشاهدات
- الاستخدامات
- معدل التحويل

### OfferFilters
فلاتر البحث والتصفية

## 🧪 الاختبار

```bash
# تشغيل التطبيق
npm run dev

# الانتقال إلى صفحة العروض
http://localhost:3000/offers
```

