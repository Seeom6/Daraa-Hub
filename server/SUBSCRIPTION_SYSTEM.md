# 📦 Subscription System Documentation

## Overview

نظام الاشتراكات المدفوعة للمتاجر في منصة درعا. يتيح للمتاجر الاشتراك في خطط مدفوعة مع حدود يومية لنشر المنتجات.

---

## ✨ Features

### 1. **Subscription Plans**
- ✅ 3 خطط مدفوعة (Basic, Standard, Premium)
- ✅ لا يوجد خطة مجانية
- ✅ حدود يومية لنشر المنتجات
- ✅ حدود لعدد الصور لكل منتج
- ✅ حدود للمتغيرات (Variants)

### 2. **Product Units**
- ✅ دعم 7 وحدات قياس:
  - `piece` (قطعة)
  - `kg` (كيلوغرام)
  - `gram` (غرام)
  - `meter` (متر)
  - `liter` (لتر)
  - `box` (صندوق)
  - `pack` (علبة)

### 3. **Daily Limits**
- ✅ إعادة تعيين العداد اليومي في منتصف الليل (00:00)
- ✅ تتبع الاستخدام اليومي لكل متجر
- ✅ منع النشر عند الوصول للحد اليومي

### 4. **Admin Controls**
- ✅ تفعيل/تعطيل نظام الاشتراكات
- ✅ منح خطط مجانية لمتاجر معينة
- ✅ تمديد الاشتراكات
- ✅ إلغاء الاشتراكات

### 5. **Payment Methods**
- ✅ دفع يدوي (افتراضي)
- ⏳ دفع إلكتروني (مستقبلاً)

### 6. **Notifications**
- ✅ تحذير قبل انتهاء الاشتراك (3 أيام)
- ✅ إشعار عند انتهاء الاشتراك
- ✅ إشعار عند الوصول للحد اليومي
- ✅ إشعار عند تفعيل الاشتراك
- ✅ إشعار عند نجاح/فشل الدفع

### 7. **Cron Jobs**
- ✅ فحص الاشتراكات المنتهية (كل ساعة)
- ✅ إرسال تحذيرات الانتهاء (يومياً الساعة 9 صباحاً)
- ✅ إعادة تعيين العدادات اليومية (منتصف الليل)

---

## 📋 Subscription Plans

### Basic Plan
- **السعر**: $20/شهر (300,000 SYP)
- **المنتجات اليومية**: 2 منتجات/يوم
- **الصور**: 2 صور/منتج
- **المتغيرات**: 5 متغيرات/منتج

### Standard Plan
- **السعر**: $50/شهر (750,000 SYP)
- **المنتجات اليومية**: 5 منتجات/يوم
- **الصور**: 4 صور/منتج
- **المتغيرات**: غير محدودة

### Premium Plan
- **السعر**: $100/شهر (1,500,000 SYP)
- **المنتجات اليومية**: 15 منتج/يوم
- **الصور**: 6 صور/منتج
- **المتغيرات**: غير محدودة
- **دعم أولوية**: ✅
- **تحليلات متقدمة**: ✅

---

## 🚀 Setup

### 1. Seed Subscription Plans

```bash
npm run seed:subscription-plans
```

### 2. Seed Notification Templates

```bash
npm run seed:notification-templates
```

### 3. Enable Subscription System (Admin)

```http
PUT /system-settings/subscription
Authorization: Bearer <admin_token>

{
  "subscriptionSystemEnabled": true,
  "allowManualPayment": true,
  "allowOnlinePayment": false,
  "trialPeriodDays": 0,
  "subscriptionExpiryWarningDays": 3,
  "notifyOnSubscriptionExpiry": true,
  "notifyOnDailyLimitReached": true,
  "notifyOnPaymentSuccess": true,
  "notifyOnPaymentFailure": true
}
```

---

## 📡 API Endpoints

### Subscription Plans

#### Get All Plans
```http
GET /subscription-plans
GET /subscription-plans?activeOnly=true
```

#### Get Plan by ID
```http
GET /subscription-plans/:id
```

#### Create Plan (Admin)
```http
POST /subscription-plans
Authorization: Bearer <admin_token>

{
  "name": "Custom Plan",
  "type": "basic",
  "description": "Custom plan description",
  "priceUSD": 30,
  "priceSYP": 450000,
  "durationDays": 30,
  "features": {
    "dailyProductLimit": 3,
    "maxImagesPerProduct": 3,
    "maxVariantsPerProduct": 10,
    "prioritySupport": false,
    "analyticsAccess": false,
    "customDomain": false
  }
}
```

#### Update Plan (Admin)
```http
PUT /subscription-plans/:id
Authorization: Bearer <admin_token>

{
  "priceUSD": 25,
  "priceSYP": 375000
}
```

### Subscriptions

#### Create Subscription (Admin)
```http
POST /subscriptions
Authorization: Bearer <admin_token>

{
  "storeId": "store_id",
  "planId": "plan_id",
  "paymentMethod": "manual",
  "amountPaid": 20,
  "paymentReference": "REF123",
  "notes": "Manual payment received"
}
```

#### Get All Subscriptions (Admin)
```http
GET /subscriptions
GET /subscriptions?status=active
GET /subscriptions?storeId=store_id
GET /subscriptions?page=1&limit=20
```

#### Get Subscription by ID (Admin)
```http
GET /subscriptions/:id
```

#### Get Store's Active Subscription
```http
GET /subscriptions/store/:storeId/active
Authorization: Bearer <store_owner_token>
```

#### Get Store's All Subscriptions
```http
GET /subscriptions/store/:storeId
Authorization: Bearer <store_owner_token>
```

#### Update Subscription (Admin)
```http
PUT /subscriptions/:id
Authorization: Bearer <admin_token>

{
  "status": "cancelled",
  "cancellationReason": "Customer request"
}
```

#### Extend Subscription (Admin)
```http
PUT /subscriptions/:id
Authorization: Bearer <admin_token>

{
  "endDate": "2024-12-31T23:59:59.999Z"
}
```

### System Settings

#### Get Subscription Settings (Admin)
```http
GET /system-settings/subscription
Authorization: Bearer <admin_token>
```

#### Update Subscription Settings (Admin)
```http
PUT /system-settings/subscription
Authorization: Bearer <admin_token>

{
  "subscriptionSystemEnabled": true,
  "allowManualPayment": true,
  "subscriptionExpiryWarningDays": 3
}
```

---

## 🔒 Subscription Enforcement

عند إنشاء منتج جديد، يتم التحقق من:

1. ✅ هل نظام الاشتراكات مفعّل؟
2. ✅ هل المتجر لديه اشتراك نشط؟
3. ✅ هل الاشتراك لم ينتهي؟
4. ✅ هل المتجر لم يصل للحد اليومي؟
5. ✅ هل عدد الصور ضمن الحد المسموح؟

إذا فشل أي من هذه الشروط، يتم رفض إنشاء المنتج مع رسالة خطأ واضحة.

---

## 📊 Database Schemas

### SubscriptionPlan
```typescript
{
  name: string;
  type: 'basic' | 'standard' | 'premium';
  description?: string;
  priceUSD: number;
  priceSYP: number;
  durationDays: number;
  features: {
    dailyProductLimit: number;
    maxImagesPerProduct: number;
    maxVariantsPerProduct: number;
    prioritySupport: boolean;
    analyticsAccess: boolean;
    customDomain: boolean;
  };
  isActive: boolean;
  order: number;
}
```

### StoreSubscription
```typescript
{
  storeId: ObjectId;
  planId: ObjectId;
  status: 'active' | 'expired' | 'cancelled' | 'pending_payment';
  startDate: Date;
  endDate: Date;
  paymentMethod: 'manual' | 'online' | 'free_grant';
  amountPaid?: number;
  paymentReference?: string;
  activatedBy?: ObjectId;
  activatedAt?: Date;
  cancelledBy?: ObjectId;
  cancelledAt?: Date;
  cancellationReason?: string;
  dailyUsage: Array<{
    date: string;
    productsPublished: number;
  }>;
  totalProductsPublished: number;
  autoRenew: boolean;
  notes?: string;
}
```

---

## 🎯 Next Steps

- [ ] إضافة نظام الدفع الإلكتروني
- [ ] إضافة نظام العروض المدفوعة
- [ ] إضافة تقارير الاستخدام للمتاجر
- [ ] إضافة نظام الخصومات والكوبونات

---

## 📝 Notes

- النظام **معطل افتراضياً** - يجب على الـ Admin تفعيله من الإعدادات
- عند تعطيل النظام، جميع المتاجر يمكنها نشر منتجات بدون حدود
- الـ Admin يمكنه منح خطط مجانية لمتاجر معينة
- الاشتراكات المنتهية لا تحذف المنتجات القديمة، فقط تمنع نشر منتجات جديدة

