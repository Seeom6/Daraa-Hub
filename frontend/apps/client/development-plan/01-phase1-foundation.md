# 🏗️ Phase 1: الأساسيات والـ Design System

## المدة: 3-4 أيام
## الأولوية: 🔴 عالية

---

## ✅ المهام المكتملة

- [x] إعداد Next.js 15 مع TypeScript
- [x] إعداد Tailwind CSS
- [x] إنشاء Design System أساسي
- [x] إنشاء Navbar و Footer
- [x] إنشاء MobileNavigation
- [x] إنشاء AuthContext
- [x] إنشاء MainLayout

---

## 📋 المهام المتبقية

### 1. إعداد API Client (الأولوية: عالية)

**الملف:** `src/lib/api-client.ts`

```typescript
// إعداد Axios مع interceptors
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // للـ cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  // إضافة token إذا موجود
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. إعداد React Query Provider (الأولوية: عالية)

**الملف:** `src/providers/QueryProvider.tsx`

- تكوين QueryClient مع cache settings
- إضافة devtools للتطوير

### 3. إنشاء Loading Components (الأولوية: متوسطة)

**الملفات:**
- `src/components/ui/Spinner.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/components/ui/PageLoader.tsx`

### 4. إنشاء Error Components (الأولوية: متوسطة)

**الملفات:**
- `src/components/ui/ErrorMessage.tsx`
- `src/components/ui/ErrorBoundary.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`

### 5. إنشاء Form Components (الأولوية: عالية)

**الملفات:**
```
src/components/ui/forms/
├── Input.tsx
├── Select.tsx
├── Textarea.tsx
├── Checkbox.tsx
├── RadioGroup.tsx
├── FormField.tsx
├── FormError.tsx
└── index.ts
```

### 6. إنشاء Modal & Dialog (الأولوية: متوسطة)

**الملفات:**
- `src/components/ui/Modal.tsx`
- `src/components/ui/ConfirmDialog.tsx`
- `src/components/ui/Drawer.tsx`

### 7. إعداد Toast Notifications (الأولوية: عالية)

**التثبيت:**
```bash
npm install react-hot-toast --legacy-peer-deps
```

**الملف:** `src/components/ui/Toast.tsx`

---

## 📁 هيكل الملفات المطلوب إنشاؤها

```
src/
├── lib/
│   ├── api-client.ts          ⬅️ جديد
│   ├── utils.ts               ⬅️ جديد
│   └── constants.ts           ⬅️ جديد
├── components/
│   └── ui/
│       ├── Spinner.tsx        ⬅️ جديد
│       ├── Skeleton.tsx       ⬅️ جديد
│       ├── PageLoader.tsx     ⬅️ جديد
│       ├── ErrorMessage.tsx   ⬅️ جديد
│       ├── Modal.tsx          ⬅️ جديد
│       ├── Toast.tsx          ⬅️ جديد
│       └── forms/
│           ├── Input.tsx      ⬅️ جديد
│           ├── Select.tsx     ⬅️ جديد
│           └── ...
├── providers/
│   ├── QueryProvider.tsx      ⬅️ تحديث
│   └── ToastProvider.tsx      ⬅️ جديد
└── app/
    ├── error.tsx              ⬅️ جديد
    └── not-found.tsx          ⬅️ جديد
```

---

## ✅ معايير الإنجاز

- [ ] API Client يعمل مع Backend
- [ ] جميع Form Components جاهزة
- [ ] Loading states تعمل
- [ ] Error handling جاهز
- [ ] Toast notifications تعمل

---

## ➡️ المرحلة التالية

بعد إكمال هذه المرحلة، انتقل إلى `02-phase2-authentication.md`

