# 🛍️ Sillap - منصة التجارة الإلكترونية

تطبيق Frontend لمنصة Daraa Hub للتجارة الإلكترونية في سوريا.

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- npm أو yarn أو pnpm

### التثبيت

```bash
# تثبيت المكتبات
npm install --legacy-peer-deps

# تشغيل التطوير
npm run dev

# فتح المتصفح
# http://localhost:3000
```

---

## 📁 هيكل المشروع

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # صفحات المصادقة
│   ├── (main)/            # الصفحات الرئيسية
│   ├── error.tsx          # صفحة الأخطاء
│   ├── not-found.tsx      # صفحة 404
│   └── layout.tsx         # Root Layout
├── components/            # المكونات
│   ├── ui/               # مكونات UI
│   │   ├── forms/        # Form components
│   │   ├── Spinner.tsx   # Loading spinner
│   │   ├── Skeleton.tsx  # Content placeholders
│   │   └── ...
│   ├── navigation/       # التنقل
│   ├── layouts/          # التخطيطات
│   └── ...
├── features/             # الميزات (Feature-based)
│   ├── auth/            # المصادقة
│   ├── products/        # المنتجات
│   ├── cart/            # السلة
│   └── ...
├── contexts/            # React Contexts
├── hooks/               # Custom Hooks
├── lib/                 # المكتبات والأدوات
│   ├── api-client.ts   # Axios client
│   ├── utils.ts        # Utility functions
│   ├── constants.ts    # Constants
│   └── toast.ts        # Toast helpers
├── providers/           # React Providers
│   ├── QueryProvider.tsx
│   └── ToastProvider.tsx
└── types/              # TypeScript types
```

---

## 🛠️ التقنيات المستخدمة

### Core
- **Next.js 15** - React Framework
- **React 19** - UI Library
- **TypeScript** - Type Safety

### Styling
- **Tailwind CSS** - Utility-first CSS
- **Glassmorphism** - Modern UI design
- **Dark Mode** - Theme support
- **RTL** - Right-to-left support

### State Management
- **React Query** - Server state
- **React Context** - Client state

### HTTP & API
- **Axios** - HTTP client
- **JWT** - Authentication (HTTP-only cookies)

### UI Components
- **Lucide React** - Icons
- **Motion** - Animations
- **React Hot Toast** - Notifications

---

## 📝 الأوامر المتاحة

```bash
# تشغيل التطوير
npm run dev

# Build للإنتاج
npm run build

# تشغيل الإنتاج
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 🎨 Design System

### Colors
- **Primary:** Blue (#3b82f6)
- **Success:** Green (#10b981)
- **Error:** Red (#ef4444)
- **Warning:** Amber (#f59e0b)

### Typography
- **Font:** System fonts + Noto Sans Arabic
- **Sizes:** 14px - 40px
- **Weights:** 400, 500, 600, 700

### Spacing
- **Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Border Radius
- **sm:** 6px
- **md:** 8px
- **lg:** 12px
- **xl:** 16px
- **2xl:** 24px

---

## 🔗 API Integration

### Base URL
```
http://localhost:3001/api
```

### Authentication
- JWT tokens في HTTP-only cookies
- Automatic token refresh
- Redirect على 401

### Example Usage

```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const { data } = await apiClient.get('/products');

// POST request
const { data } = await apiClient.post('/auth/login', {
  phone: '+963991234567',
  password: 'password123',
});
```

---

## 📱 الصفحات

### Phase 1 ✅ (مكتمل)
- Foundation & Design System

### Phase 2 (قيد التطوير)
- Login
- Register (3 steps)
- OTP Verification
- Password Reset

### Phase 3-10 (قادم)
- Home & Categories
- Products & Search
- Cart & Checkout
- Orders & Profile
- Stores
- Reviews & Wishlist
- Notifications
- Optimization

---

## 🧪 الاختبار

### صفحة اختبار المكونات
```
http://localhost:3000/test-components
```

---

## 📚 الوثائق

راجع مجلد `development-plan/` للحصول على:
- خطة التطوير الكاملة
- توثيق الـ API
- دليل المراحل

---

## 🤝 المساهمة

هذا مشروع خاص. للمساهمة، يرجى التواصل مع الفريق.

---

## 📄 الترخيص

جميع الحقوق محفوظة © 2025 Sillap Team

