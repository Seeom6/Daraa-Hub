# 🗄️ Daraa Platform - Database Schemas (Part 3 - Final)

## Continuation from DATABASE_SCHEMAS_PART2.md

---

## 📊 Analytics & Reporting (Continued)

### 41. Report Schema
**Collection**: `reports`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  type: enum,                    // 'sales' | 'revenue' | 'users' | 'products' | 'stores' | 'couriers' | 'custom'
  title: string,
  description: string,
  period: {
    from: Date,
    to: Date
  },
  filters: object,               // Report-specific filters
  data: object,                  // Report results
  format: enum,                  // 'pdf' | 'excel' | 'csv' | 'json'
  fileUrl: string,               // Generated file URL
  generatedBy: ObjectId,         // Ref: AdminProfile
  generatedAt: Date,
  expiresAt: Date,               // File expiration
  isScheduled: boolean,          // Default: false
  schedule: {
    frequency: enum,             // 'daily' | 'weekly' | 'monthly'
    dayOfWeek: number,           // 0-6 (for weekly)
    dayOfMonth: number,          // 1-31 (for monthly)
    time: string,                // HH:mm
    recipients: [string]         // Email addresses
  },
  createdAt: Date
}

// Indexes
{ type: 1, generatedAt: -1 }
{ generatedBy: 1, generatedAt: -1 }
{ expiresAt: 1 } expireAfterSeconds: 0  // TTL index
```

---

## 🔔 Notifications & Communication

### 42. Notification Schema
**Collection**: `notifications`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  userId: ObjectId,              // Ref: Account, indexed
  type: enum,                    // 'order_update' | 'promotion' | 'points' | 'review' | 'message' | 'system'
  title: string,                 // Required
  message: string,               // Required
  data: object,                  // Additional data (orderId, etc.)
  channels: [enum],              // ['push', 'email', 'sms', 'in_app']
  priority: enum,                // 'low' | 'normal' | 'high'
  isRead: boolean,               // Default: false
  readAt: Date,
  sentAt: Date,
  deliveryStatus: {
    push: enum,                  // 'pending' | 'sent' | 'failed'
    email: enum,
    sms: enum,
    in_app: enum
  },
  actionUrl: string,             // Deep link or URL
  expiresAt: Date,
  createdAt: Date
}

// Indexes
{ userId: 1, isRead: 0, createdAt: -1 }
{ userId: 1, type: 1 }
{ expiresAt: 1 } expireAfterSeconds: 0  // TTL index
```

### 43. NotificationTemplate Schema
**Collection**: `notificationtemplates`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  name: string,                  // Unique, e.g., 'order_confirmed'
  displayName: string,
  description: string,
  channels: [enum],              // ['push', 'email', 'sms']
  templates: {
    push: {
      title: string,
      body: string
    },
    email: {
      subject: string,
      html: string,              // HTML template
      text: string               // Plain text fallback
    },
    sms: {
      message: string
    }
  },
  variables: [string],           // Available variables: ['customerName', 'orderNumber', etc.]
  isActive: boolean,             // Default: true
  createdBy: ObjectId,           // Ref: AdminProfile
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ name: 1 } unique
{ isActive: 1 }
```

### 44. BulkNotification Schema
**Collection**: `bulknotifications`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  title: string,                 // Required
  message: string,               // Required
  targetAudience: {
    role: enum,                  // 'customer' | 'store_owner' | 'courier' | 'all'
    tier: enum,                  // 'bronze' | 'silver' | 'gold' | 'platinum' | 'all'
    city: [string],              // Specific cities
    customFilter: object         // Advanced filtering
  },
  channels: [enum],              // ['push', 'email', 'sms']
  scheduledAt: Date,             // When to send (null = immediate)
  sentAt: Date,
  status: enum,                  // 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  stats: {
    total: number,               // Total recipients
    sent: number,                // Successfully sent
    failed: number,              // Failed to send
    opened: number,              // Opened (for email/push)
    clicked: number              // Clicked (if has link)
  },
  createdBy: ObjectId,           // Ref: AdminProfile
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ status: 1, scheduledAt: 1 }
{ createdBy: 1, createdAt: -1 }
```

### 45. EmailQueue Schema
**Collection**: `emailqueues`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  to: string,                    // Email address
  subject: string,
  html: string,
  text: string,
  from: string,
  replyTo: string,
  attachments: [{
    filename: string,
    path: string
  }],
  status: enum,                  // 'pending' | 'sending' | 'sent' | 'failed'
  attempts: number,              // Default: 0
  maxAttempts: number,           // Default: 3
  error: string,
  sentAt: Date,
  createdAt: Date
}

// Indexes
{ status: 1, createdAt: 1 }
{ to: 1, status: 1 }
```

### 46. SMSQueue Schema
**Collection**: `smsqueues`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  phoneNumber: string,           // Required
  message: string,               // Required
  status: enum,                  // 'pending' | 'sending' | 'sent' | 'failed'
  attempts: number,              // Default: 0
  maxAttempts: number,           // Default: 3
  provider: string,              // 'twilio' | etc.
  messageId: string,             // Provider message ID
  error: string,
  sentAt: Date,
  createdAt: Date
}

// Indexes
{ status: 1, createdAt: 1 }
{ phoneNumber: 1, status: 1 }
```

---

## 🔒 Security & Verification

### 47. VerificationRequest Schema
**Collection**: `verificationrequests`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  accountId: ObjectId,           // Ref: Account, indexed
  type: enum,                    // 'store_owner' | 'courier' | 'id_verification'
  status: enum,                  // 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info'
  documents: [{
    type: enum,                  // 'business_license' | 'id_card' | 'driver_license' | 'vehicle_registration'
    url: string,
    uploadedAt: Date,
    expiresAt: Date              // Document expiration
  }],
  reviewedBy: ObjectId,          // Ref: AdminProfile
  reviewNotes: string,
  rejectionReason: string,
  submittedAt: Date,
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ accountId: 1, type: 1 }
{ status: 1, submittedAt: -1 }
{ reviewedBy: 1, status: 1 }
```

### 48. SecurityEvent Schema
**Collection**: `securityevents`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  userId: ObjectId,              // Ref: Account, indexed
  type: enum,                    // 'suspicious_login' | 'multiple_failed_attempts' | 'unusual_activity' | 'fraud_detected' | 'account_locked'
  severity: enum,                // 'low' | 'medium' | 'high' | 'critical'
  details: object,               // Event-specific details
  ipAddress: string,
  device: object,
  location: {
    city: string,
    country: string,
    coordinates: [number, number]
  },
  timestamp: Date,
  status: enum,                  // 'open' | 'investigating' | 'resolved' | 'false_positive'
  actionTaken: enum,             // 'none' | 'account_locked' | 'verification_required' | 'banned'
  investigatedBy: ObjectId,      // Ref: AdminProfile
  notes: string,
  createdAt: Date
}

// Indexes
{ userId: 1, timestamp: -1 }
{ severity: 1, status: 1 }
{ type: 1, timestamp: -1 }
```

### 49. FraudDetection Schema
**Collection**: `frauddetections`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  orderId: ObjectId,             // Ref: Order, indexed
  userId: ObjectId,              // Ref: Account, indexed
  riskScore: number,             // 0-100
  flags: [enum],                 // ['multiple_orders_short_time', 'different_shipping_billing', 'high_value_first_order', 'vpn_detected', 'suspicious_payment']
  details: {
    ipAddress: string,
    deviceFingerprint: string,
    orderCount24h: number,
    accountAge: number,          // Days
    shippingBillingMatch: boolean,
    vpnDetected: boolean,
    proxyDetected: boolean
  },
  status: enum,                  // 'pending_review' | 'approved' | 'rejected' | 'cancelled'
  reviewedBy: ObjectId,          // Ref: AdminProfile
  reviewNotes: string,
  actionTaken: string,
  createdAt: Date,
  reviewedAt: Date
}

// Indexes
{ orderId: 1 }
{ userId: 1, createdAt: -1 }
{ status: 1, riskScore: -1 }
```

### 50. IPBlacklist Schema
**Collection**: `ipblacklists`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  ipAddress: string,             // Unique, indexed
  reason: string,
  addedBy: ObjectId,             // Ref: AdminProfile
  expiresAt: Date,               // Null = permanent
  isActive: boolean,             // Default: true
  createdAt: Date
}

// Indexes
{ ipAddress: 1 } unique
{ isActive: 1 }
{ expiresAt: 1 } expireAfterSeconds: 0  // TTL index
```

### 51. DeviceFingerprint Schema
**Collection**: `devicefingerprints`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  userId: ObjectId,              // Ref: Account, indexed
  fingerprint: string,           // Unique device identifier
  deviceInfo: {
    userAgent: string,
    platform: string,
    browser: string,
    screenResolution: string,
    timezone: string,
    language: string
  },
  isTrusted: boolean,            // Default: false
  lastSeen: Date,
  createdAt: Date
}

// Indexes
{ userId: 1 }
{ fingerprint: 1 }
{ isTrusted: 1 }
```

---

## 🛠️ System Management

### 52. SystemSettings Schema
**Collection**: `systemsettings`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  category: enum,                // 'general' | 'payment' | 'shipping' | 'points' | 'commission' | 'email' | 'sms'
  settings: object,              // Category-specific settings (see IMPLEMENTATION_ROADMAP.md)
  updatedBy: ObjectId,           // Ref: AdminProfile
  updatedAt: Date,
  createdAt: Date
}

// Indexes
{ category: 1 } unique
```

### 53. AuditLog Schema
**Collection**: `auditlogs`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  userId: ObjectId,              // Ref: Account, indexed
  userRole: string,
  action: enum,                  // 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'logout'
  resource: string,              // 'user' | 'product' | 'order' | 'store' | 'settings' | etc.
  resourceId: ObjectId,
  changes: {
    before: object,              // Previous state
    after: object                // New state
  },
  ipAddress: string,
  userAgent: string,
  timestamp: Date,
  severity: enum,                // 'info' | 'warning' | 'critical'
  createdAt: Date
}

// Indexes
{ userId: 1, timestamp: -1 }
{ resource: 1, resourceId: 1, timestamp: -1 }
{ severity: 1, timestamp: -1 }
{ timestamp: -1 }
```

### 54. Page Schema (CMS)
**Collection**: `pages`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  slug: string,                  // Unique, e.g., 'about-us', 'terms'
  title: string,
  content: string,               // HTML/Markdown content
  metaTitle: string,
  metaDescription: string,
  isPublished: boolean,          // Default: false
  publishedAt: Date,
  lastEditedBy: ObjectId,        // Ref: AdminProfile
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ slug: 1 } unique
{ isPublished: 1 }
```

### 55. FAQ Schema
**Collection**: `faqs`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  question: string,              // Required
  answer: string,                // Required
  category: enum,                // 'orders' | 'payments' | 'shipping' | 'returns' | 'account' | 'general'
  order: number,                 // Display order
  isPublished: boolean,          // Default: true
  viewCount: number,             // Default: 0
  helpfulCount: number,          // Default: 0
  createdBy: ObjectId,           // Ref: AdminProfile
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ category: 1, order: 1 }
{ isPublished: 1, order: 1 }
```

### 56. SubscriptionPlan Schema
**Collection**: `subscriptionplans`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  name: string,                  // 'basic' | 'premium' | 'enterprise'
  displayName: string,
  description: string,
  price: number,
  billingCycle: enum,            // 'monthly' | 'yearly'
  features: {
    maxProducts: number,
    commissionRate: number,      // Lower commission for premium plans
    featuredProducts: number,
    prioritySupport: boolean,
    analytics: boolean,
    customBranding: boolean,
    apiAccess: boolean
  },
  isActive: boolean,             // Default: true
  order: number,                 // Display order
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ isActive: 1, order: 1 }
```

### 57. StoreSubscription Schema
**Collection**: `storesubscriptions`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  storeId: ObjectId,             // Ref: StoreOwnerProfile, indexed
  planId: ObjectId,              // Ref: SubscriptionPlan
  status: enum,                  // 'active' | 'cancelled' | 'expired' | 'suspended'
  startDate: Date,
  endDate: Date,
  autoRenew: boolean,            // Default: true
  paymentHistory: [{
    amount: number,
    paidAt: Date,
    invoiceUrl: string,
    paymentMethod: string
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ storeId: 1 }
{ status: 1, endDate: 1 }
```

---

## 📈 Summary

### Total Schemas: 57

#### By Status:
- ✅ **Implemented**: 7 schemas
  - Account, SecurityProfile, OTP, CustomerProfile, StoreOwnerProfile, CourierProfile
  
- ❌ **To be Implemented**: 50 schemas
  - All remaining schemas as documented above

#### By Category:
- **Authentication & Accounts**: 4 schemas
- **User Profiles**: 4 schemas
- **Product Catalog**: 4 schemas
- **Inventory**: 2 schemas
- **Shopping & Orders**: 3 schemas
- **Payment & Finance**: 6 schemas
- **Delivery & Tracking**: 3 schemas
- **Loyalty & Marketing**: 6 schemas
- **Reviews & Ratings**: 2 schemas
- **Support & Disputes**: 5 schemas
- **Analytics & Reporting**: 4 schemas
- **Notifications**: 5 schemas
- **Security**: 6 schemas
- **System Management**: 6 schemas

---

## 🔗 Relationships Overview

```
Account (1) ──→ (1) SecurityProfile
Account (1) ──→ (0..1) CustomerProfile
Account (1) ──→ (0..1) StoreOwnerProfile
Account (1) ──→ (0..1) CourierProfile
Account (1) ──→ (0..1) AdminProfile
Account (1) ──→ (0..1) Wallet

CustomerProfile (1) ──→ (N) Address
CustomerProfile (1) ──→ (N) Order
CustomerProfile (1) ──→ (N) PointsTransaction
CustomerProfile (1) ──→ (1) Cart

StoreOwnerProfile (1) ──→ (N) Product
StoreOwnerProfile (1) ──→ (N) Order
StoreOwnerProfile (1) ──→ (N) Offer
StoreOwnerProfile (1) ──→ (0..1) StoreSubscription

CourierProfile (1) ──→ (N) Delivery

Product (N) ──→ (1) Category
Product (1) ──→ (N) ProductVariant
Product (1) ──→ (1) Inventory
Product (1) ──→ (N) Review

Order (1) ──→ (1) Payment
Order (1) ──→ (1) Delivery
Order (1) ──→ (N) Review
Order (1) ──→ (0..1) Dispute
Order (1) ──→ (0..1) Return
```

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-11-09  
**Total Schemas**: 57  
**Status**: Complete - Ready for Implementation

