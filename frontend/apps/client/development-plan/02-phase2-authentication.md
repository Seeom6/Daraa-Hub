# 🔐 Phase 2: نظام المصادقة

## المدة: 4-5 أيام
## الأولوية: 🔴 عالية

---

## 📋 الصفحات المطلوبة

### 1. صفحة تسجيل الدخول
**المسار:** `/auth/login`
**الملف:** `src/app/(auth)/login/page.tsx`

**المتطلبات:**
- حقل رقم الهاتف (بصيغة سورية +963)
- حقل كلمة المرور
- زر "تذكرني"
- رابط "نسيت كلمة المرور"
- رابط "إنشاء حساب جديد"
- تسجيل دخول بـ Google/Facebook (اختياري)

**الـ API:**
```
POST /api/auth/login
Body: { phone: string, password: string }
Response: { user: User, message: string }
```

### 2. صفحة إنشاء حساب
**المسار:** `/auth/register`
**الملف:** `src/app/(auth)/register/page.tsx`

**الخطوات:**
1. إدخال رقم الهاتف
2. التحقق بـ OTP
3. إدخال البيانات الشخصية
4. إنشاء كلمة المرور

**الـ API:**
```
POST /api/auth/register
POST /api/auth/send-otp
POST /api/auth/verify-otp
```

### 3. صفحة نسيت كلمة المرور
**المسار:** `/auth/forgot-password`
**الملف:** `src/app/(auth)/forgot-password/page.tsx`

### 4. صفحة إعادة تعيين كلمة المرور
**المسار:** `/auth/reset-password`
**الملف:** `src/app/(auth)/reset-password/page.tsx`

### 5. صفحة التحقق من OTP
**المسار:** `/auth/verify-otp`
**الملف:** `src/app/(auth)/verify-otp/page.tsx`

---

## 📁 هيكل الملفات

```
src/
├── app/
│   └── (auth)/
│       ├── layout.tsx              # Auth Layout
│       ├── login/
│       │   └── page.tsx
│       ├── register/
│       │   └── page.tsx
│       ├── forgot-password/
│       │   └── page.tsx
│       ├── reset-password/
│       │   └── page.tsx
│       └── verify-otp/
│           └── page.tsx
├── features/
│   └── auth/
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   ├── RegisterForm.tsx
│       │   ├── OTPInput.tsx
│       │   ├── PhoneInput.tsx
│       │   └── PasswordInput.tsx
│       ├── hooks/
│       │   ├── useLogin.ts
│       │   ├── useRegister.ts
│       │   ├── useLogout.ts
│       │   └── useOTP.ts
│       ├── services/
│       │   └── auth.service.ts
│       └── types/
│           └── auth.types.ts
└── components/
    └── layouts/
        └── AuthLayout.tsx          # تخطيط صفحات Auth
```

---

## 🔧 المكونات المطلوبة

### PhoneInput Component
```typescript
// حقل إدخال رقم الهاتف السوري
interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}
```

### OTPInput Component
```typescript
// حقول إدخال OTP (6 أرقام)
interface OTPInputProps {
  length?: number; // default 6
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}
```

### PasswordInput Component
```typescript
// حقل كلمة المرور مع إظهار/إخفاء
interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  showStrength?: boolean;
  error?: string;
}
```

---

## 🔗 الـ API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/auth/login` | تسجيل الدخول |
| POST | `/auth/register` | إنشاء حساب |
| POST | `/auth/logout` | تسجيل الخروج |
| POST | `/auth/send-otp` | إرسال OTP |
| POST | `/auth/verify-otp` | التحقق من OTP |
| POST | `/auth/forgot-password` | طلب إعادة تعيين |
| POST | `/auth/reset-password` | إعادة تعيين كلمة المرور |
| GET | `/auth/me` | بيانات المستخدم الحالي |
| POST | `/auth/refresh` | تجديد التوكن |

---

## ✅ معايير الإنجاز

- [ ] تسجيل الدخول يعمل
- [ ] إنشاء حساب يعمل
- [ ] نظام OTP يعمل
- [ ] استعادة كلمة المرور تعمل
- [ ] حماية الصفحات (Protected Routes)
- [ ] تخزين التوكن في HTTP-only cookies

---

## ➡️ المرحلة التالية

بعد إكمال هذه المرحلة، انتقل إلى `03-phase3-home-categories.md`

