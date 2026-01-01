# 👤 Phase 6: الطلبات والملف الشخصي

## المدة: 4-5 أيام
## الأولوية: 🟡 متوسطة

---

## 📋 الصفحات المطلوبة

### 1. صفحة الملف الشخصي
**المسار:** `/profile`
**الملف:** `src/app/(main)/profile/page.tsx`

**المتطلبات:**
- عرض معلومات المستخدم
- تعديل البيانات الشخصية
- تغيير كلمة المرور
- تغيير الصورة الشخصية

### 2. صفحة الطلبات
**المسار:** `/orders`
**الملف:** `src/app/(main)/orders/page.tsx`

**المتطلبات:**
- قائمة الطلبات
- فلترة حسب الحالة
- البحث بالرقم

### 3. صفحة تفاصيل الطلب
**المسار:** `/orders/[id]`
**الملف:** `src/app/(main)/orders/[id]/page.tsx`

**المتطلبات:**
- تفاصيل الطلب
- حالة الطلب (Timeline)
- تتبع الشحنة
- المنتجات
- إلغاء الطلب (إذا ممكن)
- طلب إرجاع

### 4. صفحة المحفظة
**المسار:** `/wallet`
**الملف:** `src/app/(main)/wallet/page.tsx`

**المتطلبات:**
- الرصيد الحالي
- سجل المعاملات
- شحن الرصيد

### 5. صفحة النقاط
**المسار:** `/points`
**الملف:** `src/app/(main)/points/page.tsx`

---

## 📁 هيكل الملفات

```
src/
├── app/
│   └── (main)/
│       ├── profile/
│       │   ├── page.tsx              # الملف الشخصي
│       │   ├── edit/
│       │   │   └── page.tsx          # تعديل البيانات
│       │   └── password/
│       │       └── page.tsx          # تغيير كلمة المرور
│       ├── orders/
│       │   ├── page.tsx              # قائمة الطلبات
│       │   └── [id]/
│       │       └── page.tsx          # تفاصيل الطلب
│       ├── wallet/
│       │   └── page.tsx
│       └── points/
│           └── page.tsx
├── features/
│   ├── profile/
│   │   ├── components/
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── PasswordForm.tsx
│   │   │   ├── AvatarUpload.tsx
│   │   │   └── ProfileMenu.tsx
│   │   ├── hooks/
│   │   │   ├── useProfile.ts
│   │   │   └── useUpdateProfile.ts
│   │   └── services/
│   │       └── profile.service.ts
│   ├── orders/
│   │   ├── components/
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderList.tsx
│   │   │   ├── OrderDetails.tsx
│   │   │   ├── OrderTimeline.tsx
│   │   │   ├── OrderItems.tsx
│   │   │   ├── OrderStatus.tsx
│   │   │   ├── TrackingInfo.tsx
│   │   │   └── CancelOrderModal.tsx
│   │   ├── hooks/
│   │   │   ├── useOrders.ts
│   │   │   ├── useOrder.ts
│   │   │   └── useCancelOrder.ts
│   │   └── services/
│   │       └── orders.service.ts
│   └── wallet/
│       ├── components/
│       │   ├── WalletBalance.tsx
│       │   ├── TransactionList.tsx
│       │   ├── TransactionItem.tsx
│       │   └── TopUpModal.tsx
│       ├── hooks/
│       │   └── useWallet.ts
│       └── services/
│           └── wallet.service.ts
```

---

## 🔧 المكونات المطلوبة

### OrderCard Component
```typescript
interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}
// يعرض: رقم الطلب، التاريخ، الحالة، المجموع، عدد المنتجات
```

### OrderTimeline Component
```typescript
interface OrderTimelineProps {
  events: {
    status: OrderStatus;
    date: Date;
    description: string;
  }[];
  currentStatus: OrderStatus;
}
// الحالات: pending, confirmed, processing, shipped, delivered, cancelled
```

### OrderStatus Component
```typescript
interface OrderStatusProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}
// Badge ملون حسب الحالة
```

### WalletBalance Component
```typescript
interface WalletBalanceProps {
  balance: number;
  currency: string;
  onTopUp?: () => void;
}
```

### TransactionItem Component
```typescript
interface TransactionItemProps {
  transaction: {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: Date;
  };
}
```

---

## 🔗 الـ API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/profile` | بيانات المستخدم |
| PUT | `/profile` | تحديث البيانات |
| PUT | `/profile/password` | تغيير كلمة المرور |
| POST | `/profile/avatar` | رفع الصورة |
| GET | `/orders` | قائمة الطلبات |
| GET | `/orders/:id` | تفاصيل طلب |
| POST | `/orders/:id/cancel` | إلغاء طلب |
| POST | `/orders/:id/return` | طلب إرجاع |
| GET | `/wallet` | بيانات المحفظة |
| GET | `/wallet/transactions` | المعاملات |
| POST | `/wallet/topup` | شحن الرصيد |
| GET | `/points` | النقاط |
| GET | `/points/history` | سجل النقاط |

---

## 🎨 حالات الطلب

| الحالة | اللون | الأيقونة |
|--------|-------|----------|
| pending | أصفر | ⏳ |
| confirmed | أزرق | ✓ |
| processing | بنفسجي | 📦 |
| shipped | سماوي | 🚚 |
| delivered | أخضر | ✅ |
| cancelled | أحمر | ✕ |
| returned | رمادي | ↩️ |

---

## ✅ معايير الإنجاز

- [ ] الملف الشخصي يعمل
- [ ] تعديل البيانات يعمل
- [ ] قائمة الطلبات تعمل
- [ ] تفاصيل الطلب تعمل
- [ ] Timeline يعمل
- [ ] المحفظة تعمل
- [ ] سجل المعاملات يعمل

---

## ➡️ المرحلة التالية

بعد إكمال هذه المرحلة، انتقل إلى `07-phase7-stores.md`

