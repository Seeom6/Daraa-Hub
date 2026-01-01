# نظام إدارة العروض الترويجية - ملخص كامل

## 📋 نظرة عامة

تم إنشاء نظام متكامل لإدارة العروض الترويجية والخصومات في لوحة تحكم المتجر.

## ✅ الملفات المنشأة

### 1. Types & Interfaces
- `features/offers/types/index.ts` - جميع الـ TypeScript types

### 2. Services
- `features/offers/services/offers.service.ts` - API calls للعروض

### 3. Hooks
- `features/offers/hooks/index.ts` - React Query hooks:
  - `useOffers` - جلب قائمة العروض
  - `useOffer` - جلب عرض واحد
  - `useCreateOffer` - إنشاء عرض جديد
  - `useUpdateOffer` - تحديث عرض
  - `useDeleteOffer` - حذف عرض

### 4. Utils
- `features/offers/utils/validation.ts` - التحقق من صحة البيانات
- `features/offers/utils/calculations.ts` - حسابات العروض
- `features/offers/utils/formatters.ts` - تنسيق البيانات
- `features/offers/utils/index.ts` - Barrel export

### 5. Components
- `features/offers/components/OfferCard.tsx` - بطاقة العرض
- `features/offers/components/OfferBadge.tsx` - شارة الخصم
- `features/offers/components/OfferStats.tsx` - إحصائيات العرض
- `features/offers/components/OfferFilters.tsx` - فلاتر البحث
- `features/offers/components/index.ts` - Barrel export

### 6. Pages
- `app/(store-owner)/offers/page.tsx` - قائمة العروض
- `app/(store-owner)/offers/create/page.tsx` - إنشاء عرض جديد
- `app/(store-owner)/offers/[id]/page.tsx` - تفاصيل العرض
- `app/(store-owner)/offers/[id]/edit/page.tsx` - تعديل العرض

### 7. Form Steps (Create/Edit)
- `app/(store-owner)/offers/create/components/Step1BasicInfo.tsx` - المعلومات الأساسية
- `app/(store-owner)/offers/create/components/Step2Discount.tsx` - تفاصيل الخصم
- `app/(store-owner)/offers/create/components/Step3Products.tsx` - المنتجات المطبقة
- `app/(store-owner)/offers/create/components/Step4Schedule.tsx` - الجدولة والتفعيل

### 8. Documentation
- `features/offers/README.md` - توثيق كامل للنظام
- `features/offers/index.ts` - Main barrel export

## 🎯 الميزات الرئيسية

### 1. إدارة العروض
✅ إنشاء عروض جديدة بنموذج متعدد الخطوات
✅ تعديل العروض الموجودة
✅ حذف العروض
✅ عرض قائمة العروض مع pagination
✅ فلاتر البحث والتصفية

### 2. أنواع الخصومات
✅ خصم بنسبة مئوية (Percentage)
✅ خصم بمبلغ ثابت (Fixed Amount)

### 3. شروط العرض
✅ الحد الأدنى لقيمة الطلب
✅ الحد الأقصى لقيمة الخصم
✅ تحديد المنتجات المطبقة
✅ تطبيق على جميع المنتجات
✅ تحديد فترة العرض

### 4. الإحصائيات
✅ عدد المشاهدات
✅ عدد الاستخدامات
✅ معدل التحويل

### 5. حالات العرض
✅ نشط (Active)
✅ قادم (Upcoming)
✅ منتهي (Expired)
✅ معطّل (Disabled)

## 🔧 كيفية الاستخدام

### 1. الوصول إلى صفحة العروض
```
http://localhost:3000/offers
```

### 2. إنشاء عرض جديد
1. انقر على "إنشاء عرض جديد"
2. املأ المعلومات الأساسية (الخطوة 1)
3. حدد نوع وقيمة الخصم (الخطوة 2)
4. اختر المنتجات المطبقة (الخطوة 3)
5. حدد فترة العرض والتفعيل (الخطوة 4)
6. انقر على "إنشاء العرض"

### 3. تعديل عرض
1. انقر على "تعديل" في بطاقة العرض
2. قم بتعديل المعلومات المطلوبة
3. انقر على "حفظ التعديلات"

### 4. حذف عرض
1. انقر على "حذف" في بطاقة العرض
2. أكد الحذف

## 📊 هيكل البيانات

### Offer Type
```typescript
{
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
}
```

## 🔌 API Endpoints المطلوبة

يجب أن يوفر الـ Backend الـ endpoints التالية:

```
GET    /api/offers              - جلب قائمة العروض
GET    /api/offers/:id          - جلب عرض واحد
POST   /api/offers              - إنشاء عرض جديد
PUT    /api/offers/:id          - تحديث عرض
DELETE /api/offers/:id          - حذف عرض
```

## 🎨 UI Components المستخدمة

من `@/components/ui`:
- Card, CardHeader, CardBody
- Button
- Badge
- Input
- Textarea
- Select

## 📦 Dependencies

- React Query (@tanstack/react-query)
- Next.js
- Lucide Icons
- Tailwind CSS

## ✨ ملاحظات مهمة

1. **التحقق من الصحة**: يتم التحقق من صحة البيانات في كل خطوة
2. **التنسيق**: جميع النصوص والأرقام منسقة بالعربية
3. **الحالات**: يتم حساب حالة العرض تلقائياً بناءً على التواريخ والتفعيل
4. **المنتجات**: يمكن تطبيق العرض على منتجات محددة أو جميع المنتجات
5. **الصور**: يدعم رفع صورة بانر للعرض (يحتاج تطبيق upload logic)

## 🚀 الخطوات التالية

1. ✅ تطبيق image upload logic
2. ✅ ربط الـ Backend APIs
3. ✅ اختبار جميع الوظائف
4. ✅ إضافة المزيد من الإحصائيات
5. ✅ تطبيق العروض على صفحة المنتجات

## 📝 التوثيق الكامل

راجع `features/offers/README.md` للتوثيق التفصيلي.

