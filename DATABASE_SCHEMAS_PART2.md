# 🗄️ Daraa Platform - Database Schemas (Part 2)

## Continuation from DATABASE_SCHEMAS.md

---

## 🎁 Loyalty & Marketing (Continued)

### 27. Offer Schema
**Collection**: `offers`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  storeId: ObjectId,             // Ref: StoreOwnerProfile, indexed
  title: string,                 // Required
  description: string,
  image: string,                 // Offer banner image
  discountType: enum,            // 'percentage' | 'fixed'
  discountValue: number,
  minPurchaseAmount: number,
  maxDiscountAmount: number,
  applicableProducts: [ObjectId], // Ref: Product (empty = all products)
  startDate: Date,
  endDate: Date,
  isActive: boolean,             // Default: true
  viewCount: number,             // Default: 0
  usageCount: number,            // Default: 0
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ storeId: 1, isActive: 1 }
{ isActive: 1, startDate: 1, endDate: 1 }
{ 'applicableProducts': 1 }
```

### 28. Referral Schema
**Collection**: `referrals`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  referrerId: ObjectId,          // Ref: CustomerProfile, indexed
  referredId: ObjectId,          // Ref: CustomerProfile, indexed
  code: string,                  // Unique referral code, indexed
  status: enum,                  // 'pending' | 'completed' | 'rewarded'
  reward: {
    referrerReward: {
      type: enum,                // 'points' | 'discount' | 'cash'
      value: number
    },
    referredReward: {
      type: enum,
      value: number
    }
  },
  completedAt: Date,             // When referred user made first order
  rewardedAt: Date,              // When rewards were given
  firstOrderId: ObjectId,        // Ref: Order
  createdAt: Date
}

// Indexes
{ referrerId: 1 }
{ referredId: 1 } unique
{ code: 1 } unique
{ status: 1 }
```

### 29. Banner Schema
**Collection**: `banners`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  title: string,
  image: string,                 // Banner image URL (required)
  mobileImage: string,           // Mobile-optimized image
  link: string,                  // Click destination URL
  position: enum,                // 'home_slider' | 'category_top' | 'product_sidebar' | 'checkout'
  targetAudience: enum,          // 'all' | 'customers' | 'new_users' | 'vip_customers'
  displayOrder: number,          // Sort order
  startDate: Date,
  endDate: Date,
  isActive: boolean,             // Default: true
  clicks: number,                // Default: 0
  impressions: number,           // Default: 0
  createdBy: ObjectId,           // Ref: AdminProfile
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ isActive: 1, position: 1, displayOrder: 1 }
{ startDate: 1, endDate: 1 }
```

### 30. FeaturedProduct Schema
**Collection**: `featuredproducts`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  productId: ObjectId,           // Ref: Product, indexed
  storeId: ObjectId,             // Ref: StoreOwnerProfile
  position: number,              // 1-10 (top 10 featured)
  startDate: Date,
  endDate: Date,
  paymentAmount: number,         // If store paid for featuring
  isActive: boolean,             // Default: true
  impressions: number,           // Default: 0
  clicks: number,                // Default: 0
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ isActive: 1, position: 1 }
{ productId: 1, isActive: 1 }
{ startDate: 1, endDate: 1 }
```

---

## ⭐ Reviews & Ratings

### 31. Review Schema
**Collection**: `reviews`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  customerId: ObjectId,          // Ref: CustomerProfile, indexed
  targetType: enum,              // 'product' | 'store' | 'courier'
  targetId: ObjectId,            // Product/Store/Courier ID, indexed
  orderId: ObjectId,             // Ref: Order (for verification)
  rating: number,                // 1-5, required
  title: string,
  comment: string,
  images: [string],              // Review images
  isVerifiedPurchase: boolean,   // Default: false
  helpfulCount: number,          // Default: 0
  notHelpfulCount: number,       // Default: 0
  status: enum,                  // 'pending' | 'approved' | 'rejected'
  moderatedBy: ObjectId,         // Ref: AdminProfile
  moderationNotes: string,
  storeResponse: {
    message: string,
    respondedAt: Date,
    respondedBy: ObjectId
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ customerId: 1, createdAt: -1 }
{ targetType: 1, targetId: 1, status: 1 }
{ orderId: 1 }
{ status: 1 }
{ rating: 1 }
```

### 32. ReviewVote Schema
**Collection**: `reviewvotes`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  reviewId: ObjectId,            // Ref: Review, indexed
  userId: ObjectId,              // Ref: Account, indexed
  voteType: enum,                // 'helpful' | 'not_helpful'
  createdAt: Date
}

// Indexes
{ reviewId: 1, userId: 1 } unique
{ reviewId: 1, voteType: 1 }
```

---

## 🛡️ Support & Disputes

### 33. Dispute Schema
**Collection**: `disputes`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  orderId: ObjectId,             // Ref: Order, indexed
  reportedBy: ObjectId,          // Ref: Account, indexed
  reportedAgainst: ObjectId,     // Ref: Account
  reporterRole: enum,            // 'customer' | 'store' | 'courier'
  reportedRole: enum,
  type: enum,                    // 'wrong_item' | 'damaged_item' | 'late_delivery' | 'missing_item' | 'payment_issue' | 'other'
  priority: enum,                // 'low' | 'medium' | 'high' | 'urgent'
  status: enum,                  // 'open' | 'investigating' | 'resolved' | 'closed' | 'escalated'
  description: string,           // Required
  evidence: [{
    type: enum,                  // 'image' | 'document' | 'video'
    url: string,
    uploadedAt: Date
  }],
  messages: [{
    senderId: ObjectId,
    senderRole: string,
    message: string,
    attachments: [string],
    timestamp: Date,
    isAdminMessage: boolean
  }],
  resolution: {
    action: enum,                // 'refund' | 'replacement' | 'compensation' | 'warning' | 'no_action'
    amount: number,
    notes: string,
    resolvedBy: ObjectId,
    resolvedAt: Date
  },
  assignedTo: ObjectId,          // Ref: AdminProfile
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ orderId: 1 }
{ reportedBy: 1, status: 1 }
{ status: 1, priority: -1 }
{ assignedTo: 1, status: 1 }
```

### 34. Return Schema
**Collection**: `returns`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  orderId: ObjectId,             // Ref: Order, indexed
  customerId: ObjectId,          // Ref: CustomerProfile, indexed
  storeId: ObjectId,             // Ref: StoreOwnerProfile
  items: [{
    productId: ObjectId,
    variantId: ObjectId,
    name: string,
    quantity: number,
    reason: enum,                // 'defective' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other'
    detailedReason: string,
    images: [string]
  }],
  status: enum,                  // 'requested' | 'approved' | 'rejected' | 'picked_up' | 'inspected' | 'refunded' | 'replaced'
  returnMethod: enum,            // 'courier_pickup' | 'drop_off'
  refundAmount: number,
  refundMethod: enum,            // 'original_payment' | 'points' | 'wallet'
  storeResponse: {
    approved: boolean,
    notes: string,
    respondedAt: Date,
    respondedBy: ObjectId
  },
  adminReview: {
    approved: boolean,
    notes: string,
    reviewedAt: Date,
    reviewedBy: ObjectId
  },
  pickupScheduled: Date,
  pickedUpAt: Date,
  inspectedAt: Date,
  refundedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ orderId: 1 }
{ customerId: 1, status: 1 }
{ storeId: 1, status: 1 }
{ status: 1, createdAt: -1 }
```

### 35. SupportTicket Schema
**Collection**: `supporttickets`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  ticketNumber: string,          // Unique, auto-generated
  userId: ObjectId,              // Ref: Account, indexed
  userRole: string,
  category: enum,                // 'order' | 'payment' | 'account' | 'technical' | 'other'
  subject: string,               // Required
  status: enum,                  // 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
  priority: enum,                // 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: ObjectId,          // Ref: AdminProfile
  relatedOrderId: ObjectId,      // Ref: Order (optional)
  messages: [{
    senderId: ObjectId,
    message: string,
    attachments: [string],
    timestamp: Date,
    isStaffMessage: boolean
  }],
  resolution: {
    notes: string,
    resolvedBy: ObjectId,
    resolvedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ ticketNumber: 1 } unique
{ userId: 1, status: 1 }
{ status: 1, priority: -1 }
{ assignedTo: 1, status: 1 }
```

### 36. Conversation Schema
**Collection**: `conversations`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  participants: [ObjectId],      // Array of Account IDs
  type: enum,                    // 'customer_store' | 'customer_courier' | 'customer_support'
  orderId: ObjectId,             // Ref: Order (if related)
  status: enum,                  // 'active' | 'closed'
  lastMessage: {
    senderId: ObjectId,
    message: string,
    timestamp: Date
  },
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ participants: 1 }
{ orderId: 1 }
{ status: 1, lastMessageAt: -1 }
```

### 37. Message Schema
**Collection**: `messages`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  conversationId: ObjectId,      // Ref: Conversation, indexed
  senderId: ObjectId,            // Ref: Account, indexed
  message: string,               // Required
  attachments: [{
    type: enum,                  // 'image' | 'document' | 'video'
    url: string,
    filename: string,
    size: number
  }],
  isRead: boolean,               // Default: false
  readAt: Date,
  readBy: [ObjectId],            // For group conversations
  timestamp: Date,
  createdAt: Date
}

// Indexes
{ conversationId: 1, timestamp: -1 }
{ senderId: 1, timestamp: -1 }
{ isRead: 0 }
```

---

## 📊 Analytics & Reporting

### 38. UserActivity Schema
**Collection**: `useractivities`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  userId: ObjectId,              // Ref: Account, indexed
  sessionId: string,             // Indexed
  events: [{
    type: enum,                  // 'page_view' | 'product_view' | 'add_to_cart' | 'search' | 'purchase' | 'click'
    data: object,                // Event-specific data
    timestamp: Date
  }],
  device: {
    type: enum,                  // 'mobile' | 'tablet' | 'desktop'
    os: string,
    browser: string,
    userAgent: string
  },
  location: {
    city: string,
    country: string,
    ip: string
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ userId: 1, createdAt: -1 }
{ sessionId: 1 }
{ 'events.type': 1, 'events.timestamp': -1 }
```

### 39. ProductAnalytics Schema
**Collection**: `productanalytics`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  productId: ObjectId,           // Ref: Product, indexed
  storeId: ObjectId,             // Ref: StoreOwnerProfile, indexed
  period: enum,                  // 'daily' | 'weekly' | 'monthly'
  date: Date,                    // Period start date, indexed
  views: number,                 // Default: 0
  uniqueViews: number,           // Default: 0
  addToCartCount: number,        // Default: 0
  purchaseCount: number,         // Default: 0
  conversionRate: number,        // purchaseCount / views
  averageRating: number,
  totalRevenue: number,          // Default: 0
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ productId: 1, period: 1, date: -1 }
{ storeId: 1, period: 1, date: -1 }
{ date: -1 }
```

### 40. StoreAnalytics Schema
**Collection**: `storeanalytics`  
**Status**: ❌ To be implemented

```typescript
{
  _id: ObjectId,
  storeId: ObjectId,             // Ref: StoreOwnerProfile, indexed
  period: enum,                  // 'daily' | 'weekly' | 'monthly'
  date: Date,                    // Period start date, indexed
  totalOrders: number,           // Default: 0
  totalRevenue: number,          // Default: 0
  totalCommission: number,       // Default: 0
  netRevenue: number,            // totalRevenue - totalCommission
  averageOrderValue: number,
  conversionRate: number,
  customerRetentionRate: number,
  newCustomers: number,
  returningCustomers: number,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ storeId: 1, period: 1, date: -1 }
{ date: -1 }
```

---

_Continued in DATABASE_SCHEMAS_PART3.md..._

