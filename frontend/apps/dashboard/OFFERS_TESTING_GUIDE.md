# 🧪 دليل اختبار نظام العروض

## ✅ قائمة الاختبارات

### 1. اختبار الواجهة الأساسية

#### ✅ صفحة قائمة العروض (`/offers`)
- [ ] الصفحة تفتح بدون أخطاء
- [ ] الـ Grid يعرض العروض بشكل صحيح
- [ ] الـ Filters تعمل (البحث، النوع، الحالة)
- [ ] الـ Pagination يعمل
- [ ] زر "إنشاء عرض جديد" يظهر
- [ ] الـ Empty State يظهر عند عدم وجود عروض

#### ✅ صفحة إنشاء عرض (`/offers/create`)
- [ ] النموذج يفتح بدون أخطاء
- [ ] جميع الحقول تظهر بشكل صحيح
- [ ] الـ Validation يعمل على جميع الحقول
- [ ] اختيار المنتجات يعمل
- [ ] اختيار التواريخ يعمل
- [ ] رفع الصورة يعمل
- [ ] زر "إنشاء العرض" يعمل

#### ✅ صفحة تفاصيل العرض (`/offers/[id]`)
- [ ] الصفحة تفتح بدون أخطاء
- [ ] جميع التفاصيل تظهر بشكل صحيح
- [ ] الـ Analytics تظهر
- [ ] زر "تعديل" يعمل
- [ ] زر "حذف" يعمل
- [ ] زر "تفعيل/إيقاف" يعمل

#### ✅ صفحة تعديل العرض (`/offers/[id]/edit`)
- [ ] النموذج يفتح مع البيانات الحالية
- [ ] جميع الحقول قابلة للتعديل
- [ ] الـ Validation يعمل
- [ ] زر "حفظ التغييرات" يعمل

---

### 2. اختبار الـ API Integration

#### ✅ GET /api/offers/store/my
```bash
# افتح DevTools > Network
# افتح صفحة /offers
# يجب أن ترى:
Request URL: http://localhost:3001/api/offers/store/my?page=1&limit=12
Request Method: GET
Status Code: 200 OK
Response: {
  "success": true,
  "data": [...],
  "total": X,
  "page": 1,
  "limit": 12
}
```

#### ✅ POST /api/offers/store
```bash
# افتح DevTools > Network
# افتح صفحة /offers/create
# املأ النموذج وانقر "إنشاء العرض"
# يجب أن ترى:
Request URL: http://localhost:3001/api/offers/store
Request Method: POST
Status Code: 201 Created
Request Payload: { title: "...", ... }
Response: {
  "success": true,
  "message": "Offer created successfully",
  "data": { _id: "...", ... }
}
```

#### ✅ GET /api/offers/:id
```bash
# افتح DevTools > Network
# افتح صفحة /offers/[id]
# يجب أن ترى:
Request URL: http://localhost:3001/api/offers/[id]
Request Method: GET
Status Code: 200 OK
Response: {
  "success": true,
  "data": { _id: "...", ... }
}
```

#### ✅ PUT /api/offers/store/:id
```bash
# افتح DevTools > Network
# افتح صفحة /offers/[id]/edit
# عدّل البيانات وانقر "حفظ التغييرات"
# يجب أن ترى:
Request URL: http://localhost:3001/api/offers/store/[id]
Request Method: PUT
Status Code: 200 OK
Request Payload: { title: "...", ... }
Response: {
  "success": true,
  "message": "Offer updated successfully",
  "data": { _id: "...", ... }
}
```

#### ✅ DELETE /api/offers/store/:id
```bash
# افتح DevTools > Network
# افتح صفحة /offers/[id]
# انقر "حذف" وأكد الحذف
# يجب أن ترى:
Request URL: http://localhost:3001/api/offers/store/[id]
Request Method: DELETE
Status Code: 200 OK
Response: {
  "success": true,
  "message": "Offer deleted successfully"
}
```

#### ✅ GET /api/offers/store/:id/analytics
```bash
# افتح DevTools > Network
# افتح صفحة /offers/[id]
# يجب أن ترى:
Request URL: http://localhost:3001/api/offers/store/[id]/analytics
Request Method: GET
Status Code: 200 OK
Response: {
  "success": true,
  "data": {
    "viewCount": X,
    "usageCount": Y,
    "conversionRate": Z
  }
}
```

---

### 3. اختبار الـ Authentication

#### ✅ تسجيل الدخول
```bash
1. افتح http://localhost:3000/auth/login
2. سجل الدخول بحساب store owner
3. تحقق من وجود cookie باسم "access_token" في DevTools > Application > Cookies
```

#### ✅ الـ Token في الـ Requests
```bash
1. افتح DevTools > Network
2. افتح أي صفحة من صفحات العروض
3. انقر على أي request
4. تحقق من Headers > Request Headers
5. يجب أن ترى: Cookie: access_token=...
```

#### ✅ Unauthorized (401)
```bash
1. احذف الـ cookie "access_token" من DevTools
2. حاول فتح /offers
3. يجب أن يتم توجيهك إلى /auth/login
```

---

### 4. اختبار الـ Validation

#### ✅ Frontend Validation
- [ ] حقل العنوان: يجب ألا يكون فارغاً
- [ ] حقل نوع الخصم: يجب اختيار نوع
- [ ] حقل قيمة الخصم: يجب أن يكون رقماً موجباً
- [ ] حقل تاريخ البداية: يجب اختيار تاريخ
- [ ] حقل تاريخ النهاية: يجب أن يكون بعد تاريخ البداية

#### ✅ Backend Validation
```bash
# جرب إرسال بيانات غير صحيحة عبر Postman أو curl
curl -X POST http://localhost:3001/api/offers/store \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# يجب أن ترى:
Status: 400 Bad Request
Response: {
  "statusCode": 400,
  "message": ["title should not be empty", ...],
  "error": "Bad Request"
}
```

---

## 🚀 خطوات الاختبار السريع

### 1. تشغيل الـ Backend
```bash
cd server
npm run start:dev
```

### 2. تشغيل الـ Frontend
```bash
cd frontend/apps/dashboard
npm run dev
```

### 3. تسجيل الدخول
```
http://localhost:3000/auth/login
```

### 4. فتح صفحة العروض
```
http://localhost:3000/offers
```

### 5. إنشاء عرض جديد
```
http://localhost:3000/offers/create
```

---

## ✅ النتيجة المتوقعة

إذا كانت جميع الاختبارات ناجحة، يجب أن ترى:
- ✅ جميع الصفحات تفتح بدون أخطاء
- ✅ جميع الـ API requests تعمل بشكل صحيح
- ✅ الـ Authentication يعمل
- ✅ الـ Validation يعمل (Frontend + Backend)
- ✅ الـ CRUD operations تعمل بشكل كامل

---

## 🐛 استكشاف الأخطاء الشائعة

### خطأ: "Network Error"
- **السبب**: الـ Backend لا يعمل
- **الحل**: تأكد من تشغيل `npm run start:dev` في مجلد server

### خطأ: "401 Unauthorized"
- **السبب**: لم يتم تسجيل الدخول
- **الحل**: سجل الدخول من /auth/login

### خطأ: "403 Forbidden"
- **السبب**: المستخدم ليس store_owner
- **الحل**: سجل الدخول بحساب store owner

### خطأ: "CORS Error"
- **السبب**: الـ CORS غير مفعّل في الـ Backend
- **الحل**: تحقق من إعدادات CORS في server/src/main.ts

