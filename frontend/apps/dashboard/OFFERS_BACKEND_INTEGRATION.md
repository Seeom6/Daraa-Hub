# 🔌 ربط نظام العروض مع الـ Backend

## ✅ حالة الربط

**الحالة**: ✅ **مربوط بالكامل وجاهز للاستخدام**

جميع الـ API endpoints في الـ Frontend متطابقة تماماً مع الـ Backend.

---

## 📋 API Endpoints

### 1. Public Endpoints

#### Get All Offers (Public)
```
GET /api/offers
Query Params: page, limit, search, discountType, isActive, currentOnly
```

**Frontend**: ✅ `offersService.getAllOffers(filters)`  
**Backend**: ✅ `OfferController.getAllOffers()`

#### Get Offer by ID
```
GET /api/offers/:id
```

**Frontend**: ✅ `offersService.getOffer(id)`  
**Backend**: ✅ `OfferController.getOffer()`

#### Get Active Offers for Store
```
GET /api/offers/store/:storeId/active
```

**Frontend**: ✅ `offersService.getActiveOffers(storeId)`  
**Backend**: ✅ `OfferController.getActiveOffers()`

#### Get Offers for Product
```
GET /api/offers/product/:productId
```

**Frontend**: ✅ `offersService.getOffersForProduct(productId)`  
**Backend**: ✅ `OfferController.getOffersForProduct()`

---

### 2. Store Owner Endpoints (Protected)

#### Get My Offers
```
GET /api/offers/store/my
Query Params: page, limit, search, discountType, isActive, currentOnly
Headers: Authorization: Bearer <token>
```

**Frontend**: ✅ `offersService.getMyOffers(filters)`  
**Backend**: ✅ `OfferController.getMyOffers()`  
**Auth**: ✅ JwtAuthGuard + RolesGuard (store_owner)

#### Create Offer
```
POST /api/offers/store
Headers: Authorization: Bearer <token>
Body: CreateOfferDto
```

**Frontend**: ✅ `offersService.createOffer(data)`  
**Backend**: ✅ `OfferController.createOffer()`  
**Auth**: ✅ JwtAuthGuard + RolesGuard (store_owner)

#### Update Offer
```
PUT /api/offers/store/:id
Headers: Authorization: Bearer <token>
Body: UpdateOfferDto
```

**Frontend**: ✅ `offersService.updateOffer(id, data)`  
**Backend**: ✅ `OfferController.updateOffer()`  
**Auth**: ✅ JwtAuthGuard + RolesGuard (store_owner)

#### Delete Offer
```
DELETE /api/offers/store/:id
Headers: Authorization: Bearer <token>
```

**Frontend**: ✅ `offersService.deleteOffer(id)`  
**Backend**: ✅ `OfferController.deleteOffer()`  
**Auth**: ✅ JwtAuthGuard + RolesGuard (store_owner)

#### Get Offer Analytics
```
GET /api/offers/store/:id/analytics
Headers: Authorization: Bearer <token>
```

**Frontend**: ✅ `offersService.getOfferAnalytics(id)`  
**Backend**: ✅ `OfferController.getOfferAnalytics()`  
**Auth**: ✅ JwtAuthGuard + RolesGuard (store_owner)

---

## 📊 Data Types Mapping

### CreateOfferDto

| Field | Type | Required | Frontend | Backend |
|-------|------|----------|----------|---------|
| title | string | ✅ | ✅ | ✅ |
| description | string | ❌ | ✅ | ✅ |
| image | string | ❌ | ✅ | ✅ |
| discountType | enum | ✅ | ✅ | ✅ |
| discountValue | number | ✅ | ✅ | ✅ |
| minPurchaseAmount | number | ❌ | ✅ | ✅ |
| maxDiscountAmount | number | ❌ | ✅ | ✅ |
| applicableProducts | string[] | ❌ | ✅ | ✅ |
| startDate | Date | ✅ | ✅ | ✅ |
| endDate | Date | ✅ | ✅ | ✅ |
| isActive | boolean | ❌ | ✅ | ✅ |

### OfferFilters (QueryOfferDto)

| Field | Type | Default | Frontend | Backend |
|-------|------|---------|----------|---------|
| search | string | - | ✅ | ✅ |
| discountType | enum | - | ✅ | ✅ |
| isActive | boolean | - | ✅ | ✅ |
| currentOnly | boolean | - | ✅ | ✅ |
| page | number | 1 | ✅ | ✅ |
| limit | number | 10 | ✅ | ✅ |
| sortBy | string | 'createdAt' | ✅ | ✅ |
| sortOrder | 'asc'\|'desc' | 'desc' | ✅ | ✅ |

---

## 🔐 Authentication

جميع الـ Store Owner endpoints محمية بـ:
- ✅ **JwtAuthGuard**: التحقق من الـ JWT token
- ✅ **RolesGuard**: التحقق من دور المستخدم (store_owner)

الـ Frontend يرسل الـ token تلقائياً عبر `apiClient` في الـ headers:
```typescript
Authorization: Bearer <token>
```

---

## 🚀 كيفية الاستخدام

### 1. تأكد من تشغيل الـ Backend
```bash
cd server
npm run start:dev
```

### 2. تأكد من تشغيل الـ Frontend
```bash
cd frontend/apps/dashboard
npm run dev
```

### 3. تسجيل الدخول كـ Store Owner
```
http://localhost:3000/login
```

### 4. الوصول إلى صفحة العروض
```
http://localhost:3000/offers
```

---

## ✅ الاختبارات

### اختبار إنشاء عرض
1. افتح `/offers/create`
2. املأ النموذج
3. انقر "إنشاء العرض"
4. تحقق من الـ Network tab في DevTools
5. يجب أن ترى:
   ```
   POST /api/offers/store
   Status: 201 Created
   Response: { success: true, data: {...} }
   ```

### اختبار جلب العروض
1. افتح `/offers`
2. تحقق من الـ Network tab
3. يجب أن ترى:
   ```
   GET /api/offers/store/my?page=1&limit=12
   Status: 200 OK
   Response: { success: true, data: [...], total: X }
   ```

---

## 🐛 استكشاف الأخطاء

### خطأ 401 Unauthorized
- **السبب**: لم يتم تسجيل الدخول أو الـ token منتهي
- **الحل**: سجل الدخول مرة أخرى

### خطأ 403 Forbidden
- **السبب**: المستخدم ليس store_owner
- **الحل**: تأكد من تسجيل الدخول بحساب store owner

### خطأ 404 Not Found
- **السبب**: الـ endpoint غير موجود
- **الحل**: تأكد من أن الـ Backend يعمل وأن الـ OfferModule مسجل في AppModule

### خطأ 500 Internal Server Error
- **السبب**: خطأ في الـ Backend
- **الحل**: تحقق من logs الـ Backend

---

## 📝 ملاحظات

1. ✅ جميع الـ endpoints متطابقة 100%
2. ✅ جميع الـ types متطابقة 100%
3. ✅ الـ Authentication جاهز
4. ✅ الـ Validation جاهز (Frontend + Backend)
5. ✅ الـ Error Handling جاهز

---

## 🎉 النتيجة

**النظام مربوط بالكامل وجاهز للاستخدام!**

لا حاجة لأي تعديلات إضافية. فقط:
1. شغّل الـ Backend
2. شغّل الـ Frontend
3. سجل الدخول
4. ابدأ باستخدام نظام العروض!

