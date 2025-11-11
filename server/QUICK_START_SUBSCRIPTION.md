# 🚀 Quick Start: Subscription System

## دليل سريع لتفعيل واستخدام نظام الاشتراكات

---

## 📋 الخطوات الأساسية

### 1️⃣ تشغيل السيرفر

```bash
npm run start:dev
```

### 2️⃣ إنشاء الخطط الافتراضية

```bash
npm run seed:subscription-plans
```

**النتيجة المتوقعة:**
```
✅ Subscription plans seeded successfully!
Created plans:
- Basic Plan (basic) - $20/month
- Standard Plan (standard) - $50/month
- Premium Plan (premium) - $100/month
```

---

## 🔧 تفعيل النظام (Admin فقط)

### الخطوة 1: تسجيل الدخول كـ Admin

```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "phoneNumber": "+963991234567",
  "password": "Admin@123456"
}
```

**ملاحظة**: سيتم حفظ JWT token في cookie تلقائياً.

### الخطوة 2: تفعيل نظام الاشتراكات

```http
PUT http://localhost:3001/system-settings/subscription
Cookie: <admin_cookie>
Content-Type: application/json

{
  "subscriptionSystemEnabled": true,
  "allowManualPayment": true,
  "allowOnlinePayment": false,
  "subscriptionExpiryWarningDays": 3,
  "notifyOnSubscriptionExpiry": true,
  "notifyOnDailyLimitReached": true
}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "Subscription settings updated successfully",
  "data": {
    "key": "subscription",
    "category": "subscription",
    "value": {
      "subscriptionSystemEnabled": true,
      "allowManualPayment": true,
      "allowOnlinePayment": false,
      "subscriptionExpiryWarningDays": 3,
      "notifyOnSubscriptionExpiry": true,
      "notifyOnDailyLimitReached": true
    }
  }
}
```

---

## 💳 إنشاء اشتراك لمتجر (Admin فقط)

### الخطوة 1: الحصول على معرّف المتجر

```http
GET http://localhost:3001/stores
Cookie: <admin_cookie>
```

### الخطوة 2: الحصول على معرّف الخطة

```http
GET http://localhost:3001/subscription-plans
```

**مثال على النتيجة:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "673f1234567890abcdef1234",
      "name": "Basic Plan",
      "type": "basic",
      "priceUSD": 20,
      "priceSYP": 300000,
      "features": {
        "dailyProductLimit": 2,
        "maxImagesPerProduct": 2,
        "maxVariantsPerProduct": 5
      }
    }
  ]
}
```

### الخطوة 3: إنشاء الاشتراك

```http
POST http://localhost:3001/subscriptions
Cookie: <admin_cookie>
Content-Type: application/json

{
  "storeId": "673f1234567890abcdef5678",
  "planId": "673f1234567890abcdef1234",
  "paymentMethod": "manual",
  "amountPaid": 20,
  "paymentReference": "BANK-TRANSFER-001",
  "notes": "تم استلام الدفع عن طريق التحويل البنكي"
}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "_id": "673f1234567890abcdef9999",
    "storeId": "673f1234567890abcdef5678",
    "planId": "673f1234567890abcdef1234",
    "status": "active",
    "startDate": "2025-11-09T00:00:00.000Z",
    "endDate": "2025-12-09T00:00:00.000Z",
    "paymentMethod": "manual",
    "amountPaid": 20,
    "dailyUsage": [],
    "totalProductsPublished": 0
  }
}
```

---

## 🛍️ إنشاء منتج (Store Owner)

### الخطوة 1: تسجيل الدخول كـ Store Owner

```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "phoneNumber": "+963991234569",
  "password": "StoreOwner@123"
}
```

### الخطوة 2: إنشاء منتج بوحدة قياس

```http
POST http://localhost:3001/products
Cookie: <store_owner_cookie>
Content-Type: application/json

{
  "name": "طماطم طازجة",
  "description": "طماطم عضوية من المزرعة",
  "price": 5000,
  "unit": "kg",
  "unitValue": 1,
  "images": ["tomato1.jpg", "tomato2.jpg"],
  "status": "active"
}
```

**النتيجة المتوقعة (نجاح):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "673f1234567890abcdefaaaa",
    "name": "طماطم طازجة",
    "price": 5000,
    "unit": "kg",
    "unitValue": 1,
    "images": ["tomato1.jpg", "tomato2.jpg"]
  }
}
```

**النتيجة المتوقعة (فشل - تجاوز الحد اليومي):**
```json
{
  "success": false,
  "message": "You have reached your daily product limit (2/2). Please upgrade your plan or wait until tomorrow.",
  "statusCode": 400
}
```

**النتيجة المتوقعة (فشل - عدد صور كبير):**
```json
{
  "success": false,
  "message": "Your plan allows maximum 2 images per product. You provided 3 images.",
  "statusCode": 400
}
```

---

## 📊 عرض الاشتراك الحالي (Store Owner)

```http
GET http://localhost:3001/subscriptions/store/{storeId}/active
Cookie: <store_owner_cookie>
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "_id": "673f1234567890abcdef9999",
    "status": "active",
    "plan": {
      "name": "Basic Plan",
      "type": "basic",
      "features": {
        "dailyProductLimit": 2,
        "maxImagesPerProduct": 2
      }
    },
    "startDate": "2025-11-09T00:00:00.000Z",
    "endDate": "2025-12-09T00:00:00.000Z",
    "dailyUsage": [
      {
        "date": "2025-11-09",
        "productsPublished": 2
      }
    ],
    "totalProductsPublished": 2
  }
}
```

---

## 🎁 منح خطة مجانية (Admin فقط)

```http
POST http://localhost:3001/subscriptions
Cookie: <admin_cookie>
Content-Type: application/json

{
  "storeId": "673f1234567890abcdef5678",
  "planId": "673f1234567890abcdef1234",
  "paymentMethod": "free_grant",
  "amountPaid": 0,
  "notes": "منحة مجانية لمتجر مميز"
}
```

---

## 🔄 تمديد اشتراك (Admin فقط)

```http
PUT http://localhost:3001/subscriptions/{subscriptionId}
Cookie: <admin_cookie>
Content-Type: application/json

{
  "extendDays": 30,
  "notes": "تمديد لمدة شهر إضافي"
}
```

---

## 📱 وحدات القياس المتاحة

| الوحدة | الكود | الاستخدام |
|--------|------|-----------|
| قطعة | `piece` | المنتجات المفردة (هواتف، أجهزة، إلخ) |
| كيلوغرام | `kg` | الخضار، الفواكه، اللحوم |
| غرام | `gram` | التوابل، المكسرات |
| متر | `meter` | الأقمشة، الكابلات |
| لتر | `liter` | السوائل، الزيوت |
| صندوق | `box` | المنتجات المعبأة في صناديق |
| علبة | `pack` | المنتجات المعبأة في علب |

---

## 🔔 الإشعارات التلقائية

النظام يرسل إشعارات تلقائية في الحالات التالية:

1. **تفعيل الاشتراك** - عند إنشاء اشتراك جديد
2. **انتهاء الاشتراك** - عند انتهاء صلاحية الاشتراك
3. **تحذير قبل الانتهاء** - قبل 3 أيام من انتهاء الاشتراك
4. **الوصول للحد اليومي** - عند نشر آخر منتج مسموح به
5. **نجاح الدفع** - عند تفعيل اشتراك بنجاح
6. **فشل الدفع** - عند فشل عملية الدفع

---

## ⏰ المهام التلقائية (Cron Jobs)

- **كل ساعة**: فحص الاشتراكات المنتهية وتحديث حالتها
- **يومياً الساعة 9 صباحاً**: إرسال تحذيرات للاشتراكات القريبة من الانتهاء
- **منتصف الليل (00:00)**: إعادة تعيين العداد اليومي للمنتجات

---

## 🛠️ استكشاف الأخطاء

### المشكلة: "Subscription system is disabled"

**الحل**: تفعيل النظام من خلال Admin:
```http
PUT http://localhost:3001/system-settings/subscription
{
  "subscriptionSystemEnabled": true
}
```

### المشكلة: "No active subscription found"

**الحل**: إنشاء اشتراك للمتجر من خلال Admin.

### المشكلة: "Daily limit reached"

**الحل**: 
- الانتظار حتى منتصف الليل (00:00) لإعادة تعيين العداد
- أو ترقية الخطة إلى خطة أعلى

---

## 📞 الدعم

للمزيد من المعلومات، راجع:
- `SUBSCRIPTION_SYSTEM.md` - التوثيق الكامل
- `PHASE_1.5_SUMMARY.md` - ملخص التنفيذ

---

**تم التطوير بواسطة**: Augment Agent  
**التاريخ**: 9 نوفمبر 2025  
**الحالة**: ✅ جاهز للاستخدام

