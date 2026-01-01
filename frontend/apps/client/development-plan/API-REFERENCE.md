# 🔗 API Reference - Daraa Backend

## Base URL
```
http://localhost:3001/api
```

## 🔑 Authentication Method
- JWT tokens في HTTP-only cookies
- Access token: 7 أيام
- Refresh token: 30 يوم

---

## 🔐 Authentication

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/auth/login` | تسجيل الدخول |
| POST | `/auth/register/step1` | إرسال OTP |
| POST | `/auth/register/verify-otp` | التحقق من OTP |
| POST | `/auth/register/complete-profile` | إكمال التسجيل |
| POST | `/auth/logout` | تسجيل الخروج |
| POST | `/auth/forgot-password` | نسيت كلمة المرور |
| POST | `/auth/forgot-password/verify-otp` | التحقق من OTP |
| POST | `/auth/reset-password` | إعادة تعيين |
| GET | `/auth/me` | المستخدم الحالي |
| POST | `/auth/refresh` | تجديد التوكن |

---

## 👤 Profile

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/profile` | بيانات المستخدم |
| PUT | `/profile` | تحديث البيانات |
| PUT | `/profile/password` | تغيير كلمة المرور |
| POST | `/profile/avatar` | رفع الصورة |

---

## 📦 Products

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/products` | قائمة المنتجات |
| GET | `/products/:slug` | تفاصيل منتج |
| GET | `/products/search` | بحث |
| GET | `/products/:id/related` | منتجات مشابهة |
| GET | `/products/:id/reviews` | تقييمات |

**Query Parameters:**
```
?page=1&limit=20&category=electronics&minPrice=100&maxPrice=5000&rating=4&sort=price_asc
```

---

## 📂 Categories

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/categories` | كل التصنيفات |
| GET | `/categories/:slug` | تصنيف محدد |
| GET | `/categories/:slug/products` | منتجات تصنيف |

---

## 🏪 Stores

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/stores` | قائمة المتاجر |
| GET | `/stores/:slug` | تفاصيل متجر |
| GET | `/stores/:slug/products` | منتجات المتجر |
| GET | `/stores/:slug/reviews` | تقييمات المتجر |
| POST | `/stores/:id/follow` | متابعة |
| DELETE | `/stores/:id/unfollow` | إلغاء المتابعة |

---

## 🛒 Cart

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/cart` | عرض السلة |
| POST | `/cart/items` | إضافة للسلة |
| PUT | `/cart/items/:productId` | تحديث الكمية |
| DELETE | `/cart/items/:productId` | حذف من السلة |
| DELETE | `/cart` | مسح السلة |
| POST | `/cart/apply-coupon` | تطبيق كوبون |
| DELETE | `/cart/remove-coupon` | إزالة كوبون |

---

## 📋 Orders

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/orders/my-orders` | قائمة طلباتي |
| GET | `/orders/store-orders` | طلبات المتجر (store_owner) |
| GET | `/orders/:id` | تفاصيل طلب |
| POST | `/orders` | إنشاء طلب |
| PUT | `/orders/:id/cancel` | إلغاء طلب |
| POST | `/orders/:id/return` | طلب إرجاع |

**Query Parameters:**
```
?status=pending&page=1&limit=20
```

---

## 📍 Addresses

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/addresses` | العناوين |
| POST | `/addresses` | إضافة عنوان |
| PUT | `/addresses/:id` | تعديل عنوان |
| DELETE | `/addresses/:id` | حذف عنوان |

---

## ❤️ Wishlist

⚠️ **ملاحظة:** Wishlist غير موجود في Backend حالياً

**الحل المؤقت:** استخدام LocalStorage في Frontend

```typescript
// localStorage
const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
```

---

## ⭐ Reviews

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/reviews/my` | تقييماتي |
| POST | `/reviews` | إضافة تقييم |
| PUT | `/reviews/:id` | تعديل تقييم |
| DELETE | `/reviews/:id` | حذف تقييم |
| POST | `/reviews/:id/helpful` | مفيد |

---

## 💰 Wallet

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/wallet/balance` | الرصيد الحالي |
| GET | `/wallet/transactions` | المعاملات |
| GET | `/wallet/transactions/summary` | ملخص المعاملات |
| GET | `/wallet/transactions/:id` | تفاصيل معاملة |
| POST | `/wallet/withdraw` | طلب سحب (store_owner, courier) |

---

## 🔔 Notifications

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/notifications` | الإشعارات |
| GET | `/notifications/unread-count` | عدد غير المقروءة |
| PUT | `/notifications/:id/read` | تحديد كمقروء |
| PUT | `/notifications/read-all` | تحديد الكل |
| DELETE | `/notifications/:id` | حذف |

---

## 🏠 Home

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/home/banners` | البانرات |
| GET | `/home/featured` | المنتجات المميزة |
| GET | `/home/flash-deals` | العروض السريعة |
| GET | `/home/new-arrivals` | الجديد |

---

## 📝 ملاحظات

### Headers المطلوبة
```
Content-Type: application/json
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Success"
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

### Pagination
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

