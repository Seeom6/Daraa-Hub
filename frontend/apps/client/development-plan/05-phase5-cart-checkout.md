# 🛒 Phase 5: السلة والدفع

## المدة: 5-6 أيام
## الأولوية: 🔴 عالية

---

## 📋 الصفحات المطلوبة

### 1. صفحة السلة
**المسار:** `/cart`
**الملف:** `src/app/(main)/cart/page.tsx`

**المتطلبات:**
- قائمة المنتجات في السلة
- تعديل الكمية
- حذف منتج
- تطبيق كوبون خصم
- ملخص الأسعار
- زر المتابعة للدفع

### 2. صفحة الدفع (Checkout)
**المسار:** `/checkout`
**الملف:** `src/app/(main)/checkout/page.tsx`

**الخطوات:**
1. **العنوان** - اختيار/إضافة عنوان التوصيل
2. **الشحن** - اختيار طريقة الشحن
3. **الدفع** - اختيار طريقة الدفع
4. **المراجعة** - مراجعة الطلب
5. **التأكيد** - تأكيد الطلب

### 3. صفحة نجاح الطلب
**المسار:** `/checkout/success`
**الملف:** `src/app/(main)/checkout/success/page.tsx`

### 4. صفحة إدارة العناوين
**المسار:** `/addresses`
**الملف:** `src/app/(main)/addresses/page.tsx`

---

## 📁 هيكل الملفات

```
src/
├── app/
│   └── (main)/
│       ├── cart/
│       │   └── page.tsx
│       ├── checkout/
│       │   ├── page.tsx
│       │   └── success/
│       │       └── page.tsx
│       └── addresses/
│           └── page.tsx
├── features/
│   ├── cart/
│   │   ├── components/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartList.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   ├── CouponInput.tsx
│   │   │   ├── EmptyCart.tsx
│   │   │   └── CartDrawer.tsx
│   │   ├── hooks/
│   │   │   ├── useCart.ts
│   │   │   ├── useAddToCart.ts
│   │   │   ├── useRemoveFromCart.ts
│   │   │   └── useApplyCoupon.ts
│   │   ├── services/
│   │   │   └── cart.service.ts
│   │   ├── store/
│   │   │   └── cartStore.ts       # Zustand store
│   │   └── types/
│   │       └── cart.types.ts
│   ├── checkout/
│   │   ├── components/
│   │   │   ├── CheckoutSteps.tsx
│   │   │   ├── AddressStep.tsx
│   │   │   ├── ShippingStep.tsx
│   │   │   ├── PaymentStep.tsx
│   │   │   ├── ReviewStep.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   └── PaymentMethods.tsx
│   │   ├── hooks/
│   │   │   ├── useCheckout.ts
│   │   │   └── useCreateOrder.ts
│   │   └── services/
│   │       └── checkout.service.ts
│   └── addresses/
│       ├── components/
│       │   ├── AddressCard.tsx
│       │   ├── AddressForm.tsx
│       │   ├── AddressList.tsx
│       │   └── AddressModal.tsx
│       ├── hooks/
│       │   ├── useAddresses.ts
│       │   └── useCreateAddress.ts
│       └── services/
│           └── addresses.service.ts
```

---

## 🔧 المكونات المطلوبة

### CartItem Component
```typescript
interface CartItemProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}
```

### CartSummary Component
```typescript
interface CartSummaryProps {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: Coupon;
}
```

### CheckoutSteps Component
```typescript
interface CheckoutStepsProps {
  currentStep: number; // 1-4
  steps: {
    title: string;
    completed: boolean;
  }[];
}
```

### AddressForm Component
```typescript
interface AddressFormProps {
  initialData?: Address;
  onSubmit: (data: AddressInput) => void;
  onCancel: () => void;
}
// الحقول: الاسم، الهاتف، المحافظة، المنطقة، العنوان التفصيلي
```

### PaymentMethods Component
```typescript
interface PaymentMethodsProps {
  methods: PaymentMethod[];
  selected: string;
  onSelect: (methodId: string) => void;
}
// الطرق: كاش عند الاستلام، محفظة، بطاقة
```

---

## 🔗 الـ API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/cart` | عرض السلة |
| POST | `/cart/add` | إضافة للسلة |
| PUT | `/cart/update` | تحديث الكمية |
| DELETE | `/cart/remove/:id` | حذف من السلة |
| POST | `/cart/apply-coupon` | تطبيق كوبون |
| DELETE | `/cart/remove-coupon` | إزالة كوبون |
| GET | `/addresses` | العناوين |
| POST | `/addresses` | إضافة عنوان |
| PUT | `/addresses/:id` | تعديل عنوان |
| DELETE | `/addresses/:id` | حذف عنوان |
| GET | `/shipping/methods` | طرق الشحن |
| POST | `/orders` | إنشاء طلب |

---

## 💳 طرق الدفع

1. **الدفع عند الاستلام (COD)**
2. **المحفظة الإلكترونية**
3. **بطاقة ائتمان** (اختياري)

---

## ✅ معايير الإنجاز

- [ ] السلة تعمل (إضافة/تعديل/حذف)
- [ ] الكوبونات تعمل
- [ ] العناوين تعمل
- [ ] خطوات الدفع تعمل
- [ ] إنشاء الطلب يعمل
- [ ] صفحة النجاح تظهر

---

## ➡️ المرحلة التالية

بعد إكمال هذه المرحلة، انتقل إلى `06-phase6-orders-profile.md`

