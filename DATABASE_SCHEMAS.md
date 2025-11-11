# 🗄️ Daraa Platform - Complete Database Schema Reference

## 📋 Overview

This document contains all database schemas for the Daraa e-commerce platform. Each schema is designed following MongoDB best practices with proper indexing, validation, and relationships.

---

## 🔐 Authentication & Account Management

### 1. Account Schema
**Collection**: `accounts`  
**Status**: ✅ Implemented

```typescript
{
  _id: ObjectId,
  fullName: string,              // Required, trimmed
  phone: string,                 // Required, unique, indexed
  email: string,                 // Optional, unique, indexed
  passwordHash: string,          // Bcrypt hashed
  role: enum,                    // 'customer' | 'store_owner' | 'courier' | 'admin'
  isVerified: boolean,           // Default: false
  isActive: boolean,             // Default: true
  securityProfileId: ObjectId,   // Ref: SecurityProfile
  roleProfileId: ObjectId,       // Dynamic ref based on role
  roleProfileRef: string,        // 'CustomerProfile' | 'StoreOwnerProfile' | etc.
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ phone: 1 } unique
{ email: 1 } unique, sparse
{ role: 1 }
{ isActive: 1, isVerified: 1 }
```

### 2. SecurityProfile Schema
**Collection**: `securityprofiles`  
**Status**: ✅ Implemented

```typescript
{
  _id: ObjectId,
  accountId: ObjectId,           // Ref: Account, unique, indexed
  phoneVerified: boolean,        // Default: false
  idVerified: boolean,           // Default: false
  twoFactorEnabled: boolean,     // Default: false
  lastOtpCode: string,           // Hashed
  lastOtpSentAt: Date,
  failedAttempts: number,        // Default: 0
  lockedUntil: Date,             // Account lock timestamp
  loginHistory: [{
    ip: string,
    device: string,
    timestamp: Date,
    success: boolean
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ accountId: 1 } unique
{ phoneVerified: 1 }
```

### 3. OTP Schema
**Collection**: `otps`  
**Status**: ✅ Implemented

```typescript
{
  _id: ObjectId,
  phoneNumber: string,           // Indexed
  otp: string,                   // Hashed
  expiresAt: Date,               // TTL index
  attempts: number,              // Default: 0, max: 3
  isUsed: boolean,               // Default: false
  type: enum,                    // 'registration' | 'forgot-password'
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ phoneNumber: 1 }
{ expiresAt: 1 } expireAfterSeconds: 0  // TTL index
```

### 4. AdminProfile Schema
**Collection**: `adminprofiles`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  accountId: ObjectId,           // Ref: Account, unique, indexed
  permissions: {
    users: {
      view: boolean,
      create: boolean,
      edit: boolean,
      delete: boolean,
      suspend: boolean
    },
    stores: {
      view: boolean,
      approve: boolean,
      reject: boolean,
      suspend: boolean
    },
    couriers: {
      view: boolean,
      approve: boolean,
      reject: boolean,
      suspend: boolean
    },
    products: {
      view: boolean,
      edit: boolean,
      delete: boolean,
      feature: boolean
    },
    orders: {
      view: boolean,
      cancel: boolean,
      refund: boolean
    },
    payments: {
      view: boolean,
      refund: boolean
    },
    reports: {
      view: boolean,
      export: boolean
    },
    settings: {
      view: boolean,
      edit: boolean
    },
    coupons: {
      view: boolean,
      create: boolean,
      edit: boolean,
      delete: boolean
    },
    categories: {
      view: boolean,
      create: boolean,
      edit: boolean,
      delete: boolean
    },
    notifications: {
      send_bulk: boolean
    }
  },
  role: enum,                    // 'super_admin' | 'admin' | 'moderator' | 'support'
  department: enum,              // 'operations' | 'finance' | 'support' | 'marketing'
  lastLoginAt: Date,
  activityLog: [{
    action: string,
    resource: string,
    resourceId: ObjectId,
    timestamp: Date,
    details: object
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ accountId: 1 } unique
{ role: 1 }
{ department: 1 }
```

---

## 👥 User Profiles

### 5. CustomerProfile Schema
**Collection**: `customerprofiles`  
**Status**: ✅ Implemented

```typescript
{
  _id: ObjectId,
  accountId: ObjectId,           // Ref: Account, unique, indexed
  loyaltyPoints: number,         // Default: 0, min: 0
  tier: enum,                    // 'bronze' | 'silver' | 'gold' | 'platinum'
  addresses: [ObjectId],         // Ref: Address
  orders: [ObjectId],            // Ref: Order
  wishlist: [ObjectId],          // Ref: Product
  cartId: ObjectId,              // Ref: Cart
  totalSpent: number,            // Default: 0
  totalOrders: number,           // Default: 0
  averageOrderValue: number,     // Calculated
  lastOrderAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ accountId: 1 } unique
{ tier: 1 }
{ loyaltyPoints: -1 }
{ totalSpent: -1 }
```

### 6. StoreOwnerProfile Schema
**Collection**: `storeownerprofiles`  
**Status**: ✅ Implemented

```typescript
{
  _id: ObjectId,
  accountId: ObjectId,           // Ref: Account, unique, indexed
  storeName: string,             // Trimmed
  storeSlug: string,             // Unique, indexed
  storeDescription: string,
  storeLogo: string,             // URL
  storeBanner: string,           // URL
  storeCategories: [string],
  verificationStatus: enum,      // 'pending' | 'approved' | 'rejected' | 'suspended'
  businessLicense: string,       // Document URL
  taxId: string,
  rating: number,                // 0-5, default: 0
  totalReviews: number,          // Default: 0
  totalSales: number,            // Default: 0
  totalRevenue: number,          // Default: 0
  products: [ObjectId],          // Ref: Product
  orders: [ObjectId],            // Ref: Order
  isStoreActive: boolean,        // Default: true
  storeAddress: {
    fullAddress: string,
    city: string,
    district: string,
    location: {
      type: 'Point',
      coordinates: [number, number]
    }
  },
  contactInfo: {
    phone: string,
    email: string,
    whatsapp: string
  },
  businessHours: [{
    day: string,
    openTime: string,
    closeTime: string,
    isClosed: boolean
  }],
  bankDetails: {
    accountName: string,
    accountNumber: string,
    bankName: string,
    iban: string
  },
  subscriptionPlanId: ObjectId,  // Ref: SubscriptionPlan
  subscriptionExpiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ accountId: 1 } unique
{ storeSlug: 1 } unique
{ verificationStatus: 1 }
{ rating: -1 }
{ isStoreActive: 1 }
{ 'storeAddress.location': '2dsphere' }
```

### 7. CourierProfile Schema
**Collection**: `courierprofiles`  
**Status**: ✅ Implemented

```typescript
{
  _id: ObjectId,
  accountId: ObjectId,           // Ref: Account, unique, indexed
  verificationStatus: enum,      // 'pending' | 'approved' | 'rejected' | 'suspended'
  driverLicense: string,         // Document URL
  vehicleType: string,           // 'motorcycle' | 'car' | 'bicycle'
  vehiclePlateNumber: string,
  vehicleModel: string,
  vehicleColor: string,
  status: enum,                  // 'offline' | 'available' | 'busy' | 'on_break'
  currentLocation: {
    type: 'Point',
    coordinates: [number, number]
  },
  rating: number,                // 0-5, default: 0
  totalReviews: number,          // Default: 0
  totalDeliveries: number,       // Default: 0
  totalEarnings: number,         // Default: 0
  deliveries: [ObjectId],        // Ref: Delivery
  activeDeliveries: [ObjectId],  // Ref: Delivery
  isAvailableForDelivery: boolean, // Default: true
  workingZones: [ObjectId],      // Ref: DeliveryZone
  bankDetails: {
    accountName: string,
    accountNumber: string,
    bankName: string
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ accountId: 1 } unique
{ verificationStatus: 1 }
{ status: 1 }
{ rating: -1 }
{ isAvailableForDelivery: 1 }
{ currentLocation: '2dsphere' }
```

---

## 🏪 Product Catalog

### 8. Category Schema
**Collection**: `categories`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  name: string,                  // Required
  slug: string,                  // Unique, indexed
  description: string,
  icon: string,                  // Icon name or URL
  image: string,                 // Category image URL
  parentCategory: ObjectId,      // Ref: Category (for subcategories)
  level: number,                 // 0 for root, 1 for subcategory, etc.
  order: number,                 // Display order
  isActive: boolean,             // Default: true
  seoTitle: string,
  seoDescription: string,
  productCount: number,          // Denormalized, default: 0
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ slug: 1 } unique
{ parentCategory: 1 }
{ isActive: 1, order: 1 }
{ level: 1 }
```

### 9. Product Schema
**Collection**: `products`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  storeId: ObjectId,             // Ref: StoreOwnerProfile, indexed
  categoryId: ObjectId,          // Ref: Category, indexed
  name: string,                  // Required, text indexed
  slug: string,                  // Unique, indexed
  description: string,           // Text indexed
  shortDescription: string,
  sku: string,                   // Stock Keeping Unit, unique
  barcode: string,
  price: number,                 // Required, min: 0
  compareAtPrice: number,        // Original price (for discounts)
  pointsPrice: number,           // Price in loyalty points
  costPrice: number,             // For profit calculation
  images: [string],              // Array of image URLs
  mainImage: string,             // Primary image URL
  tags: [string],                // For search, indexed
  specifications: {              // Product specs (flexible)
    brand: string,
    weight: string,
    dimensions: string,
    material: string,
    // ... other specs
  },
  hasVariants: boolean,          // Default: false
  status: enum,                  // 'draft' | 'active' | 'inactive' | 'out_of_stock'
  isFeatured: boolean,           // Default: false
  rating: number,                // 0-5, calculated from reviews
  reviewCount: number,           // Default: 0
  soldCount: number,             // Default: 0
  viewCount: number,             // Default: 0
  seoTitle: string,
  seoDescription: string,
  seoKeywords: [string],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ storeId: 1, status: 1 }
{ categoryId: 1, status: 1 }
{ slug: 1 } unique
{ sku: 1 } unique
{ status: 1, isFeatured: -1 }
{ rating: -1 }
{ soldCount: -1 }
{ name: 'text', description: 'text', tags: 'text' }
{ price: 1 }
```

### 10. ProductVariant Schema
**Collection**: `productvariants`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  productId: ObjectId,           // Ref: Product, indexed
  name: string,                  // e.g., "Red - Large"
  sku: string,                   // Unique
  price: number,                 // Can override product price
  compareAtPrice: number,
  attributes: {
    size: string,
    color: string,
    material: string,
    // ... other variant attributes
  },
  image: string,                 // Variant-specific image
  stock: number,                 // Default: 0
  isActive: boolean,             // Default: true
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ productId: 1 }
{ sku: 1 } unique
{ isActive: 1 }
```

---

## 📦 Inventory Management

### 11. Inventory Schema
**Collection**: `inventories`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  productId: ObjectId,           // Ref: Product, indexed
  variantId: ObjectId,           // Ref: ProductVariant (optional)
  storeId: ObjectId,             // Ref: StoreOwnerProfile, indexed
  quantity: number,              // Total quantity
  reservedQuantity: number,      // Reserved in carts/pending orders
  availableQuantity: number,     // quantity - reservedQuantity
  lowStockThreshold: number,     // Alert threshold
  reorderPoint: number,          // When to reorder
  reorderQuantity: number,       // How much to reorder
  lastRestocked: Date,
  movements: [{
    type: enum,                  // 'in' | 'out' | 'adjustment' | 'return'
    quantity: number,
    reason: string,
    orderId: ObjectId,           // Ref: Order (if applicable)
    performedBy: ObjectId,       // Ref: Account
    timestamp: Date,
    notes: string
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ productId: 1, storeId: 1 } unique
{ variantId: 1, storeId: 1 }
{ storeId: 1, availableQuantity: 1 }
{ availableQuantity: 1 }
```

### 12. StockAlert Schema
**Collection**: `stockalerts`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  productId: ObjectId,           // Ref: Product
  variantId: ObjectId,           // Ref: ProductVariant (optional)
  storeId: ObjectId,             // Ref: StoreOwnerProfile
  type: enum,                    // 'low_stock' | 'out_of_stock' | 'overstock'
  currentQuantity: number,
  threshold: number,
  status: enum,                  // 'active' | 'resolved'
  notifiedAt: Date,
  resolvedAt: Date,
  createdAt: Date
}

// Indexes
{ storeId: 1, status: 1 }
{ productId: 1, status: 1 }
```

---

## 🛒 Shopping & Orders

### 13. Address Schema
**Collection**: `addresses`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  customerId: ObjectId,          // Ref: CustomerProfile, indexed
  label: enum,                   // 'home' | 'work' | 'other'
  fullName: string,              // Recipient name
  phoneNumber: string,           // Contact number
  fullAddress: string,           // Complete address
  city: string,                  // Indexed
  district: string,
  street: string,
  buildingNumber: string,
  floor: string,
  apartmentNumber: string,
  landmark: string,              // Nearby landmark
  location: {
    type: 'Point',
    coordinates: [number, number] // [longitude, latitude]
  },
  isDefault: boolean,            // Default: false
  notes: string,                 // Delivery instructions
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ customerId: 1 }
{ customerId: 1, isDefault: 1 }
{ city: 1 }
{ location: '2dsphere' }
```

### 14. Cart Schema
**Collection**: `carts`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  customerId: ObjectId,          // Ref: CustomerProfile, indexed
  sessionId: string,             // For guest carts, indexed
  items: [{
    productId: ObjectId,         // Ref: Product
    variantId: ObjectId,         // Ref: ProductVariant (optional)
    quantity: number,            // Min: 1
    price: number,               // Price at time of adding
    pointsPrice: number,         // Points price at time of adding
    selectedOptions: object,     // Any custom options
    addedAt: Date
  }],
  subtotal: number,              // Calculated
  discount: number,              // From coupon
  total: number,                 // subtotal - discount
  appliedCoupon: ObjectId,       // Ref: Coupon
  expiresAt: Date,               // Cart expiration (e.g., 7 days)
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ customerId: 1 } unique
{ sessionId: 1 } unique, sparse
{ expiresAt: 1 } expireAfterSeconds: 0  // TTL index
```

### 15. Order Schema
**Collection**: `orders`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  orderNumber: string,           // Unique, auto-generated (e.g., "ORD-20250109-0001")
  customerId: ObjectId,          // Ref: CustomerProfile, indexed
  storeId: ObjectId,             // Ref: StoreOwnerProfile, indexed
  courierId: ObjectId,           // Ref: CourierProfile, indexed
  items: [{
    productId: ObjectId,         // Ref: Product
    variantId: ObjectId,         // Ref: ProductVariant (optional)
    name: string,                // Product name (snapshot)
    image: string,               // Product image (snapshot)
    sku: string,
    quantity: number,
    price: number,               // Price at time of order
    pointsPrice: number,
    subtotal: number             // quantity * price
  }],
  subtotal: number,              // Sum of items subtotal
  deliveryFee: number,
  discount: number,              // From coupon/offer
  total: number,                 // subtotal + deliveryFee - discount
  paymentMethod: enum,           // 'cash' | 'card' | 'points' | 'wallet' | 'mixed'
  paymentStatus: enum,           // 'pending' | 'paid' | 'failed' | 'refunded'
  orderStatus: enum,             // 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled'
  deliveryAddress: {             // Snapshot of address
    fullName: string,
    phoneNumber: string,
    fullAddress: string,
    city: string,
    district: string,
    location: {
      type: 'Point',
      coordinates: [number, number]
    },
    notes: string
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  pointsEarned: number,          // Loyalty points earned
  pointsUsed: number,            // Loyalty points used
  appliedCoupon: {               // Snapshot of coupon
    code: string,
    discountValue: number
  },
  notes: string,                 // Customer notes
  cancellationReason: string,
  cancelledBy: ObjectId,         // Ref: Account
  statusHistory: [{
    status: string,
    timestamp: Date,
    updatedBy: ObjectId,         // Ref: Account
    notes: string
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ orderNumber: 1 } unique
{ customerId: 1, createdAt: -1 }
{ storeId: 1, orderStatus: 1 }
{ courierId: 1, orderStatus: 1 }
{ orderStatus: 1, createdAt: -1 }
{ paymentStatus: 1 }
{ createdAt: -1 }
```

---

## 💳 Payment & Finance

### 16. Payment Schema
**Collection**: `payments`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  orderId: ObjectId,             // Ref: Order, indexed
  customerId: ObjectId,          // Ref: CustomerProfile, indexed
  amount: number,                // Total payment amount
  method: enum,                  // 'cash' | 'card' | 'points' | 'wallet' | 'mixed'
  breakdown: {                   // For mixed payments
    cash: number,
    card: number,
    points: number,
    wallet: number
  },
  status: enum,                  // 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  gateway: enum,                 // 'stripe' | 'paypal' | null (for cash)
  transactionId: string,         // Gateway transaction ID
  gatewayResponse: object,       // Full gateway response
  failureReason: string,
  refundAmount: number,
  refundedAt: Date,
  metadata: object,              // Additional payment data
  createdAt: Date,
  completedAt: Date
}

// Indexes
{ orderId: 1 }
{ customerId: 1, createdAt: -1 }
{ status: 1 }
{ transactionId: 1 }
```

### 17. Wallet Schema
**Collection**: `wallets`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  accountId: ObjectId,           // Ref: Account, unique, indexed
  balance: number,               // Default: 0, min: 0
  currency: string,              // Default: 'IQD'
  isActive: boolean,             // Default: true
  lastTransactionAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ accountId: 1 } unique
{ isActive: 1 }
```

### 18. WalletTransaction Schema
**Collection**: `wallettransactions`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  walletId: ObjectId,            // Ref: Wallet, indexed
  accountId: ObjectId,           // Ref: Account, indexed (denormalized)
  type: enum,                    // 'credit' | 'debit'
  amount: number,                // Positive number
  source: enum,                  // 'refund' | 'cashback' | 'admin_credit' | 'withdrawal' | 'purchase' | 'top_up'
  referenceId: ObjectId,         // Order/Refund/etc ID
  referenceType: string,         // 'Order' | 'Refund' | etc.
  balanceBefore: number,
  balanceAfter: number,
  description: string,
  performedBy: ObjectId,         // Ref: Account (for admin actions)
  timestamp: Date,
  createdAt: Date
}

// Indexes
{ walletId: 1, timestamp: -1 }
{ accountId: 1, timestamp: -1 }
{ referenceId: 1, referenceType: 1 }
```

### 19. Commission Schema
**Collection**: `commissions`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  storeId: ObjectId,             // Ref: StoreOwnerProfile, indexed
  orderId: ObjectId,             // Ref: Order, indexed
  orderAmount: number,           // Total order amount
  commissionRate: number,        // Percentage (e.g., 10 for 10%)
  commissionAmount: number,      // Calculated commission
  netAmount: number,             // orderAmount - commissionAmount
  status: enum,                  // 'pending' | 'approved' | 'paid' | 'disputed'
  paidAt: Date,
  paymentMethod: string,
  notes: string,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ storeId: 1, status: 1 }
{ orderId: 1 } unique
{ status: 1, createdAt: -1 }
```

### 20. Payout Schema
**Collection**: `payouts`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  storeId: ObjectId,             // Ref: StoreOwnerProfile, indexed
  period: {
    from: Date,
    to: Date
  },
  totalOrders: number,
  totalRevenue: number,
  totalCommission: number,
  netAmount: number,             // totalRevenue - totalCommission
  status: enum,                  // 'pending' | 'processing' | 'completed' | 'failed'
  bankDetails: {
    accountName: string,
    accountNumber: string,
    bankName: string,
    iban: string
  },
  processedAt: Date,
  processedBy: ObjectId,         // Ref: AdminProfile
  transactionId: string,         // Bank transaction ID
  notes: string,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ storeId: 1, createdAt: -1 }
{ status: 1 }
```

### 21. Refund Schema
**Collection**: `refunds`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  orderId: ObjectId,             // Ref: Order, indexed
  paymentId: ObjectId,           // Ref: Payment
  customerId: ObjectId,          // Ref: CustomerProfile
  amount: number,
  reason: string,
  method: enum,                  // 'original_payment' | 'wallet' | 'points'
  status: enum,                  // 'pending' | 'processing' | 'completed' | 'failed'
  processedBy: ObjectId,         // Ref: AdminProfile
  transactionId: string,
  notes: string,
  createdAt: Date,
  completedAt: Date
}

// Indexes
{ orderId: 1 }
{ customerId: 1, createdAt: -1 }
{ status: 1 }
```

---

## 🚚 Delivery & Tracking

### 22. Delivery Schema
**Collection**: `deliveries`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  orderId: ObjectId,             // Ref: Order, unique, indexed
  courierId: ObjectId,           // Ref: CourierProfile, indexed
  storeId: ObjectId,             // Ref: StoreOwnerProfile
  customerId: ObjectId,          // Ref: CustomerProfile
  pickupAddress: {
    fullAddress: string,
    location: {
      type: 'Point',
      coordinates: [number, number]
    }
  },
  deliveryAddress: {
    fullAddress: string,
    location: {
      type: 'Point',
      coordinates: [number, number]
    }
  },
  distance: number,              // In kilometers
  deliveryFee: number,
  status: enum,                  // 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'
  assignedAt: Date,
  acceptedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  courierNotes: string,
  customerNotes: string,
  proofOfDelivery: {
    signature: string,           // Image URL
    photo: string,               // Image URL
    receivedBy: string,          // Name of person who received
    timestamp: Date
  },
  failureReason: string,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ orderId: 1 } unique
{ courierId: 1, status: 1 }
{ status: 1, createdAt: -1 }
```

### 23. DeliveryTracking Schema
**Collection**: `deliverytrackings`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  deliveryId: ObjectId,          // Ref: Delivery, indexed
  courierId: ObjectId,           // Ref: CourierProfile, indexed
  location: {
    type: 'Point',
    coordinates: [number, number]
  },
  speed: number,                 // km/h
  heading: number,               // Degrees (0-360)
  accuracy: number,              // Meters
  timestamp: Date,
  status: string,                // Current delivery status
  notes: string,
  createdAt: Date
}

// Indexes
{ deliveryId: 1, timestamp: -1 }
{ courierId: 1, timestamp: -1 }
{ location: '2dsphere' }
```

### 24. DeliveryZone Schema
**Collection**: `deliveryzones`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  name: string,                  // Zone name
  city: string,
  districts: [string],           // List of districts in zone
  polygon: {                     // GeoJSON polygon
    type: 'Polygon',
    coordinates: [[[number, number]]]
  },
  baseDeliveryFee: number,       // Base fee for this zone
  perKmRate: number,             // Additional fee per km
  isActive: boolean,             // Default: true
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ city: 1, isActive: 1 }
{ polygon: '2dsphere' }
```

---

## 🎁 Loyalty & Marketing

### 25. PointsTransaction Schema
**Collection**: `pointstransactions`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  customerId: ObjectId,          // Ref: CustomerProfile, indexed
  type: enum,                    // 'earned' | 'spent' | 'expired' | 'refunded' | 'admin_adjustment'
  amount: number,                // Positive for earned, negative for spent
  orderId: ObjectId,             // Ref: Order (if applicable)
  description: string,
  balanceBefore: number,
  balanceAfter: number,
  expiresAt: Date,               // Points expiration date
  isExpired: boolean,            // Default: false
  createdAt: Date
}

// Indexes
{ customerId: 1, createdAt: -1 }
{ orderId: 1 }
{ expiresAt: 1, isExpired: 0 }
```

### 26. Coupon Schema
**Collection**: `coupons`
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  code: string,                  // Unique, uppercase, indexed
  type: enum,                    // 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y'
  discountValue: number,         // Percentage or fixed amount
  minPurchaseAmount: number,     // Minimum order value
  maxDiscountAmount: number,     // Maximum discount cap
  usageLimit: {
    total: number,               // Total usage limit
    perUser: number,             // Per user limit
    perDay: number               // Daily limit
  },
  usedCount: number,             // Default: 0
  validFrom: Date,
  validUntil: Date,
  applicableTo: {
    stores: [ObjectId],          // Specific stores
    categories: [ObjectId],      // Specific categories
    products: [ObjectId],        // Specific products
    userTiers: [string],         // Specific customer tiers
    newUsersOnly: boolean        // Only for new users
  },
  autoApply: boolean,            // Auto-apply if conditions met
  isActive: boolean,             // Default: true
  createdBy: ObjectId,           // Ref: AdminProfile
  usageHistory: [{
    userId: ObjectId,
    orderId: ObjectId,
    discountAmount: number,
    usedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ code: 1 } unique
{ isActive: 1, validFrom: 1, validUntil: 1 }
{ 'applicableTo.stores': 1 }
{ 'applicableTo.categories': 1 }
```

---

_Continued in DATABASE_SCHEMAS_PART2.md..._

