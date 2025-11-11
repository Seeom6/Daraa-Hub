# 🏗️ **تحليل شامل للبنية المعمارية - نظام Daraa**

**تاريخ التحليل:** 2025-11-11  
**المحلل:** AI Architecture Expert  
**الهدف:** تقييم البنية الحالية وتحديد الحاجة للـ Refactoring

---

## 📊 **ملخص تنفيذي**

### **التقييم العام: 7.5/10** ⭐⭐⭐⭐⭐⭐⭐⚪⚪⚪

**الخلاصة:**
البنية المعمارية **جيدة جداً** ولكن تحتاج **تحسينات محددة** قبل إضافة نظام الخدمات الجديد.

**التوصية الرئيسية:**
✅ **Refactoring تدريجي** أثناء التطوير، وليس refactoring شامل قبل التطوير.

---

## ✅ **نقاط القوة (ما تم عمله بشكل صحيح)**

### **1. البنية المعمارية الأساسية** ⭐⭐⭐⭐⭐
```
✅ Clean Architecture (Layered)
✅ Modular Design (29 modules)
✅ Separation of Concerns
✅ Infrastructure Layer منفصل
✅ Common Layer للمشاركة
```

**التقييم:** ممتاز - البنية الأساسية قوية ومنظمة

---

### **2. تنظيم الملفات** ⭐⭐⭐⭐⭐
```
server/src/
├── common/              ✅ Shared utilities
├── config/              ✅ Configuration
├── database/schemas/    ✅ Centralized schemas
├── infrastructure/      ✅ External services
└── modules/             ✅ Feature modules
    ├── auth/
    ├── order/
    ├── product/
    └── ...
```

**التقييم:** ممتاز - تنظيم واضح ومنطقي

---

### **3. Dependency Injection** ⭐⭐⭐⭐⭐
```typescript
// ✅ استخدام صحيح لـ NestJS DI
@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
  ) {}
}
```

**التقييم:** ممتاز - استخدام صحيح للـ DI

---

### **4. Event-Driven Architecture** ⭐⭐⭐⭐⭐
```typescript
// ✅ استخدام Events للفصل بين الوحدات
this.eventEmitter.emit('order.created', {
  orderId: order._id,
  customerId: order.customerId,
});
```

**التقييم:** ممتاز - يقلل الـ Coupling

---

### **5. Infrastructure Layer** ⭐⭐⭐⭐⭐
```
infrastructure/
├── email/      ✅ Email service
├── sms/        ✅ SMS service
├── redis/      ✅ Caching
├── queue/      ✅ Background jobs
├── storage/    ✅ File storage
└── events/     ✅ Event system
```

**التقييم:** ممتاز - فصل واضح للخدمات الخارجية

---

## ⚠️ **نقاط الضعف (ما يحتاج تحسين)**

### **1. Services كبيرة جداً (God Objects)** ⚠️⚠️⚠️

**المشكلة:**
```
review.service.ts        592 سطر  ❌ كبير جداً
store-categories.service 504 سطر  ❌ كبير جداً
coupon.service.ts        496 سطر  ❌ كبير جداً
product.service.ts       479 سطر  ⚠️ كبير
account.service.ts       461 سطر  ⚠️ كبير
order.service.ts         444 سطر  ⚠️ كبير
```

**التأثير:**
- صعوبة الصيانة
- صعوبة الاختبار
- انتهاك Single Responsibility Principle

**الحل المقترح:**
```typescript
// ❌ الوضع الحالي
order.service.ts (444 lines)
  - createOrder()
  - validateInventory()
  - calculateShipping()
  - applyDiscount()
  - processPayment()
  - sendNotifications()
  - updateAnalytics()

// ✅ الوضع المقترح
order/
├── services/
│   ├── order.service.ts           (150 lines) - Core logic
│   ├── order-validation.service.ts (100 lines) - Validation
│   ├── order-pricing.service.ts    (100 lines) - Pricing
│   └── order-fulfillment.service.ts (100 lines) - Fulfillment
```

**الأولوية:** 🔴 عالية

---

### **2. عدم وجود Repository Pattern** ⚠️⚠️

**المشكلة:**
```typescript
// ❌ الوضع الحالي - Services تتعامل مع Models مباشرة
@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    // ... 7 models أخرى!
  ) {}
  
  async createOrder() {
    const order = await this.orderModel.create(...);  // ❌ Direct DB access
  }
}
```

**التأثير:**
- Tight coupling مع MongoDB
- صعوبة تغيير قاعدة البيانات
- صعوبة الاختبار (Mocking)
- تكرار الكود (Queries)

**الحل المقترح:**
```typescript
// ✅ الوضع المقترح - Repository Pattern
@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}
  
  async create(data: CreateOrderData): Promise<Order> {
    return this.orderModel.create(data);
  }
  
  async findById(id: string): Promise<Order> {
    return this.orderModel.findById(id).exec();
  }
  
  async findByCustomer(customerId: string, options: PaginationOptions) {
    // Reusable query logic
  }
}

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,  // ✅ Abstraction
    private cartRepository: CartRepository,
  ) {}
  
  async createOrder() {
    const order = await this.orderRepository.create(...);  // ✅ Clean
  }
}
```

**الأولوية:** 🟡 متوسطة (لكن مهمة للمستقبل)

---

### **3. تكرار الكود (Code Duplication)** ⚠️⚠️

**المشكلة:**
```typescript
// ❌ تكرار في كل Service
async findAll(query) {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
  
  const filter: any = {};
  // ... build filter
  
  const skip = (page - 1) * limit;
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  
  const [data, total] = await Promise.all([
    this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
    this.model.countDocuments(filter).exec(),
  ]);
  
  return { data, total, page, limit };
}
```

**هذا الكود مكرر في:**
- ProductService
- OrderService
- CategoryService
- CouponService
- ReviewService
- ... (10+ services)

**الحل المقترح:**
```typescript
// ✅ Base Repository مع Pagination
export abstract class BaseRepository<T> {
  constructor(protected model: Model<T>) {}
  
  async findAll(query: PaginationQuery): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const filter = this.buildFilter(query);
    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    
    return { data, total, page, limit };
  }
  
  protected abstract buildFilter(query: any): any;
}

// استخدام
export class ProductRepository extends BaseRepository<Product> {
  protected buildFilter(query: QueryProductDto) {
    const filter: any = {};
    if (query.search) filter.$text = { $search: query.search };
    if (query.categoryId) filter.categoryId = query.categoryId;
    return filter;
  }
}
```

**الأولوية:** 🟡 متوسطة

---

### **4. Circular Dependencies** ⚠️

**المشكلة:**
```typescript
// ❌ استخدام forwardRef في عدة أماكن
@Module({
  imports: [
    forwardRef(() => PaymentModule),  // ⚠️ Circular dependency
  ],
})
export class OrderModule {}
```

**التأثير:**
- علامة على تصميم غير صحيح
- صعوبة في الاختبار
- مشاكل محتملة في Runtime

**الحل المقترح:**
- استخدام Events بدلاً من Direct calls
- إعادة تصميم العلاقات بين الوحدات
- استخدام Mediator Pattern

**الأولوية:** 🟡 متوسطة

---

### **5. عدم وجود Unit Tests** ❌❌❌

**المشكلة:**
```
server/src/modules/
├── order/
│   ├── services/
│   │   └── order.service.ts  ❌ لا يوجد order.service.spec.ts
│   └── order.controller.ts   ❌ لا يوجد order.controller.spec.ts
```

**التأثير:**
- صعوبة اكتشاف الأخطاء مبكراً
- خوف من التعديل (Fear of Change)
- صعوبة الـ Refactoring

**الحل المقترح:**
- إضافة Unit Tests لكل Service
- إضافة Unit Tests لكل Controller
- استهداف 80%+ Code Coverage

**الأولوية:** 🔴 عالية جداً

---

### **6. عدم وجود DTOs للـ Responses** ⚠️

**المشكلة:**
```typescript
// ❌ الوضع الحالي
async findOne(id: string): Promise<OrderDocument> {
  return this.orderModel.findById(id).exec();  // ❌ يعيد كل الحقول
}

// Controller
@Get(':id')
async getOrder(@Param('id') id: string) {
  const order = await this.orderService.findOne(id);
  return { success: true, data: order };  // ❌ يعيد كل شيء للـ Client
}
```

**التأثير:**
- تسريب بيانات حساسة
- عدم التحكم في الـ Response
- صعوبة التوثيق

**الحل المقترح:**
```typescript
// ✅ Response DTOs
export class OrderResponseDto {
  @Expose()
  id: string;
  
  @Expose()
  orderNumber: string;
  
  @Expose()
  @Transform(({ value }) => value.toFixed(2))
  totalAmount: number;
  
  // لا يتم إرجاع الحقول الحساسة
}

// Service
async findOne(id: string): Promise<OrderResponseDto> {
  const order = await this.orderModel.findById(id).exec();
  return plainToClass(OrderResponseDto, order, { excludeExtraneousValues: true });
}
```

**الأولوية:** 🟡 متوسطة

---

## 🎯 **التوصيات حسب الأولوية**

### **🔴 عاجل (قبل إضافة نظام الخدمات)**

#### **1. إضافة Unit Tests** (أسبوع 1)
```
الهدف: 80%+ Code Coverage
الوقت: 5-7 أيام
الأولوية: عالية جداً
```

**لماذا؟**
- ستضيف نظام خدمات كبير ومعقد
- بدون Tests، ستخاف من التعديل
- Tests تسهل الـ Refactoring

**الخطة:**
```
Day 1-2: Core Services (Order, Product, Payment)
Day 3-4: Supporting Services (Inventory, Cart, Coupon)
Day 5-6: Infrastructure Services (Email, SMS, Queue)
Day 7: Integration Tests
```

---

#### **2. تقسيم الـ Services الكبيرة** (أسبوع 2)
```
الهدف: لا يوجد Service أكبر من 300 سطر
الوقت: 5-7 أيام
الأولوية: عالية
```

**الخطة:**
```typescript
// Services للتقسيم
1. review.service.ts (592 lines) → 3 services
2. store-categories.service.ts (504 lines) → 2 services
3. coupon.service.ts (496 lines) → 2 services
4. product.service.ts (479 lines) → 2 services
5. account.service.ts (461 lines) → 2 services
```

---

### **🟡 مهم (أثناء تطوير نظام الخدمات)**

#### **3. إضافة Repository Pattern** (تدريجي)
```
الهدف: فصل Data Access عن Business Logic
الوقت: تدريجي مع التطوير
الأولوية: متوسطة
```

**الخطة:**
- عند إنشاء نظام الخدمات الجديد، استخدم Repository Pattern
- لا تعيد كتابة الأنظمة القديمة الآن
- Refactor تدريجي عند الحاجة

---

#### **4. إضافة Response DTOs** (تدريجي)
```
الهدف: التحكم في الـ Responses
الوقت: تدريجي مع التطوير
الأولوية: متوسطة
```

---

### **🟢 تحسينات (بعد إطلاق نظام الخدمات)**

#### **5. إزالة Circular Dependencies**
#### **6. إضافة CQRS Pattern للأنظمة المعقدة**
#### **7. إضافة Domain Events**

---

## 🏗️ **البنية المقترحة لنظام الخدمات الجديد**

### **الهيكل المقترح:**
```
server/src/modules/
├── services/                    # نظام الخدمات الرئيسي
│   ├── services.module.ts
│   ├── controllers/
│   │   ├── service.controller.ts
│   │   ├── service-booking.controller.ts
│   │   └── service-provider.controller.ts
│   ├── services/
│   │   ├── service.service.ts
│   │   ├── service-validation.service.ts
│   │   ├── service-pricing.service.ts
│   │   └── service-scheduling.service.ts
│   ├── repositories/            # ✅ استخدام Repository Pattern
│   │   ├── service.repository.ts
│   │   ├── booking.repository.ts
│   │   └── provider.repository.ts
│   ├── dto/
│   │   ├── requests/
│   │   └── responses/           # ✅ Response DTOs
│   ├── entities/
│   ├── events/                  # ✅ Domain Events
│   └── tests/                   # ✅ Unit Tests
│
├── service-categories/          # تصنيفات الخدمات
├── service-providers/           # مقدمو الخدمات
├── service-bookings/            # حجوزات الخدمات
├── service-reviews/             # تقييمات الخدمات
└── service-payments/            # مدفوعات الخدمات
```

---

## 📊 **مقارنة: Refactor الآن vs Refactor تدريجي**

### **Option 1: Refactor شامل الآن** ❌
```
الوقت: 4-6 أسابيع
المخاطر: عالية جداً
الفوائد: بنية مثالية

المشاكل:
- توقف التطوير لمدة شهر
- احتمال كسر الأنظمة الموجودة
- 134 اختبار فاشل قد تزيد
- تأخير نظام الخدمات
```

### **Option 2: Refactor تدريجي** ✅ (الموصى به)
```
الوقت: أسبوعين + تدريجي
المخاطر: منخفضة
الفوائد: توازن بين الجودة والسرعة

الخطة:
Week 1: Unit Tests للأنظمة الحالية
Week 2: تقسيم الـ Services الكبيرة
Week 3-6: تطوير نظام الخدمات (مع Best Practices)
Week 7+: Refactor تدريجي للأنظمة القديمة
```

---

## ✅ **الخلاصة والتوصية النهائية**

### **الإجابة على سؤالك:**

**"هل من الأفضل Refactor الآن أم بعد التطوير؟"**

**الجواب:** ✅ **Refactor تدريجي (Hybrid Approach)**

### **الخطة الموصى بها:**

#### **المرحلة 1: التحضير (أسبوعين)**
1. ✅ إضافة Unit Tests للأنظمة الحالية (أسبوع 1)
2. ✅ تقسيم الـ Services الكبيرة (أسبوع 2)
3. ✅ إصلاح الاختبارات الفاشلة (134 tests)

#### **المرحلة 2: التطوير (4-6 أسابيع)**
4. ✅ تطوير نظام الخدمات بـ Best Practices:
   - Repository Pattern
   - Response DTOs
   - Unit Tests من البداية
   - Services صغيرة (< 300 lines)
   - Event-Driven

#### **المرحلة 3: Refactor تدريجي (مستمر)**
5. ✅ Refactor الأنظمة القديمة عند الحاجة
6. ✅ إضافة Repository Pattern تدريجياً
7. ✅ تحسين الأداء والأمان

---

---

## 🎨 **تقييم البنية المعمارية بالتفصيل**

### **1. Modularity (التقسيم إلى وحدات)** ⭐⭐⭐⭐⭐ 9/10

**الإيجابيات:**
- ✅ 29 وحدة منفصلة
- ✅ كل وحدة لها مسؤولية واضحة
- ✅ Infrastructure منفصل عن Business Logic

**السلبيات:**
- ⚠️ بعض الوحدات كبيرة جداً (Order, Product)
- ⚠️ بعض الوحدات صغيرة جداً (Stores - ملف واحد فقط)

**التوصية:**
- تقسيم الوحدات الكبيرة إلى Sub-modules
- دمج الوحدات الصغيرة جداً

---

### **2. Coupling (الترابط)** ⭐⭐⭐⚪⚪ 6/10

**الإيجابيات:**
- ✅ استخدام Events لتقليل الترابط
- ✅ Dependency Injection

**السلبيات:**
- ❌ Services تحقن 7-10 Models مباشرة (Tight Coupling)
- ❌ Circular Dependencies (forwardRef)
- ❌ لا يوجد Repository Pattern

**مثال على المشكلة:**
```typescript
// ❌ OrderService يعتمد على 10 Models مباشرة!
constructor(
  @InjectModel(Order.name) private orderModel,
  @InjectModel(Cart.name) private cartModel,
  @InjectModel(Product.name) private productModel,
  @InjectModel(ProductVariant.name) private productVariantModel,
  @InjectModel(Inventory.name) private inventoryModel,
  @InjectModel(StoreOwnerProfile.name) private storeProfileModel,
  @InjectModel(CustomerProfile.name) private customerProfileModel,
  @InjectModel(Account.name) private accountModel,
  // ... المزيد
) {}
```

**التوصية:**
- إضافة Repository Pattern
- استخدام Facade Pattern للتعامل مع عدة Repositories

---

### **3. Cohesion (التماسك)** ⭐⭐⭐⭐⚪ 7/10

**الإيجابيات:**
- ✅ كل Service له مسؤولية واضحة
- ✅ DTOs منفصلة

**السلبيات:**
- ⚠️ بعض الـ Services تفعل أشياء كثيرة (Low Cohesion)
- ⚠️ Validation, Business Logic, Data Access كلها في Service واحد

**التوصية:**
- فصل Validation إلى Validator Classes
- فصل Data Access إلى Repositories
- فصل Business Logic إلى Domain Services

---

### **4. Testability (قابلية الاختبار)** ⭐⭐⚪⚪⚪ 4/10

**الإيجابيات:**
- ✅ Dependency Injection يسهل الـ Mocking
- ✅ E2E Tests موجودة (271 test)

**السلبيات:**
- ❌ لا يوجد Unit Tests
- ❌ Services كبيرة جداً (صعب اختبارها)
- ❌ Tight Coupling مع MongoDB (صعب Mock)

**التوصية:**
- إضافة Unit Tests لكل Service
- استخدام Repository Pattern لسهولة الـ Mocking

---

### **5. Scalability (قابلية التوسع)** ⭐⭐⭐⭐⚪ 8/10

**الإيجابيات:**
- ✅ Modular Design يسهل إضافة وحدات جديدة
- ✅ Event-Driven يسهل التوسع
- ✅ Redis Caching
- ✅ Bull Queue للـ Background Jobs

**السلبيات:**
- ⚠️ لا يوجد CQRS (قد تحتاجه مستقبلاً)
- ⚠️ لا يوجد Microservices Architecture (إذا كبر النظام)

**التوصية:**
- الاستمرار في Modular Monolith حالياً
- التحضير لـ CQRS في الأنظمة المعقدة (Orders, Services)

---

### **6. Maintainability (قابلية الصيانة)** ⭐⭐⭐⚪⚪ 6/10

**الإيجابيات:**
- ✅ تنظيم واضح
- ✅ TypeScript (Type Safety)
- ✅ DTOs للـ Validation

**السلبيات:**
- ❌ Services كبيرة جداً (صعب الصيانة)
- ❌ Code Duplication
- ❌ لا يوجد Documentation (Swagger)

**التوصية:**
- تقسيم الـ Services الكبيرة
- إضافة Swagger Documentation
- إزالة Code Duplication

---

### **7. Security (الأمان)** ⭐⭐⭐⭐⚪ 7/10

**الإيجابيات:**
- ✅ JWT Authentication
- ✅ HTTP-only Cookies
- ✅ Bcrypt Password Hashing
- ✅ Input Validation (class-validator)
- ✅ Rate Limiting (ThrottlerGuard)

**السلبيات:**
- ⚠️ لا يوجد Response DTOs (قد يسرب بيانات)
- ⚠️ لا يوجد Helmet.js
- ⚠️ لا يوجد Input Sanitization

**التوصية:**
- إضافة Response DTOs
- إضافة Helmet.js
- إضافة Input Sanitization

---

### **8. Performance (الأداء)** ⭐⭐⭐⭐⚪ 7/10

**الإيجابيات:**
- ✅ Redis Caching
- ✅ Database Indexes
- ✅ Pagination
- ✅ Mongoose Virtuals

**السلبيات:**
- ⚠️ N+1 Query Problem في بعض الأماكن
- ⚠️ لا يوجد Query Optimization
- ⚠️ لا يوجد Connection Pooling

**التوصية:**
- استخدام DataLoader لحل N+1 Problem
- تحسين الـ Queries
- إضافة Connection Pooling

---

## 📈 **مقارنة مع Best Practices**

| المعيار | الحالي | Best Practice | الفجوة |
|--------|--------|---------------|--------|
| **Repository Pattern** | ❌ لا يوجد | ✅ موجود | 🔴 كبيرة |
| **Unit Tests** | ❌ لا يوجد | ✅ 80%+ Coverage | 🔴 كبيرة جداً |
| **Service Size** | ⚠️ 200-600 lines | ✅ < 300 lines | 🟡 متوسطة |
| **Code Duplication** | ⚠️ موجود | ✅ DRY | 🟡 متوسطة |
| **Response DTOs** | ❌ لا يوجد | ✅ موجود | 🟡 متوسطة |
| **API Documentation** | ❌ لا يوجد | ✅ Swagger | 🟡 متوسطة |
| **CQRS** | ❌ لا يوجد | ⚠️ للأنظمة المعقدة | 🟢 صغيرة |
| **Microservices** | ❌ Monolith | ⚠️ عند الحاجة | 🟢 صغيرة |

---

## 🚀 **خطة Refactoring التدريجي (12 أسبوع)**

### **Phase 1: Foundation (أسبوع 1-2)** 🔴 عاجل
```
Week 1: Unit Tests
- Day 1-2: Core Services (Order, Product, Payment)
- Day 3-4: Supporting Services (Inventory, Cart)
- Day 5-7: Infrastructure Services

Week 2: Service Splitting
- Day 1-2: Split ReviewService (592 → 200 lines each)
- Day 3-4: Split StoreCategoriesService (504 → 250 lines each)
- Day 5-7: Split CouponService (496 → 250 lines each)
```

### **Phase 2: Services System (أسبوع 3-6)** 🟡 مهم
```
Week 3-4: Core Services System
- Repository Pattern من البداية
- Response DTOs
- Unit Tests
- Event-Driven

Week 5-6: Services Sub-systems
- Service Providers
- Service Bookings
- Service Payments
- Service Reviews
```

### **Phase 3: Gradual Refactor (أسبوع 7-12)** 🟢 تحسينات
```
Week 7-8: Repository Pattern للأنظمة القديمة
- OrderRepository
- ProductRepository
- PaymentRepository

Week 9-10: Response DTOs للأنظمة القديمة
- Order Response DTOs
- Product Response DTOs
- User Response DTOs

Week 11-12: Documentation & Optimization
- Swagger Documentation
- Query Optimization
- Performance Tuning
```

---

## 💡 **نصائح للتطوير المستقبلي**

### **1. عند إضافة نظام جديد:**
```typescript
// ✅ استخدم هذا الهيكل
new-system/
├── new-system.module.ts
├── controllers/
│   └── new-system.controller.ts
├── services/
│   ├── new-system.service.ts        (< 300 lines)
│   └── new-system-helper.service.ts (< 300 lines)
├── repositories/                     # ✅ Repository Pattern
│   └── new-system.repository.ts
├── dto/
│   ├── requests/
│   │   └── create-new-system.dto.ts
│   └── responses/                    # ✅ Response DTOs
│       └── new-system-response.dto.ts
├── events/                           # ✅ Domain Events
│   └── new-system-created.event.ts
└── tests/                            # ✅ Unit Tests
    ├── new-system.service.spec.ts
    └── new-system.controller.spec.ts
```

### **2. قواعد الكود:**
```
✅ Service < 300 lines
✅ Repository Pattern للـ Data Access
✅ Response DTOs للـ API Responses
✅ Unit Tests لكل Service/Controller
✅ Events للتواصل بين الوحدات
✅ Validation في DTOs
✅ Business Logic في Services
```

### **3. قبل الـ Commit:**
```bash
# ✅ تأكد من:
npm run test          # All tests pass
npm run lint          # No lint errors
npm run build         # Build successful
```

---

**هل تريد أن أبدأ بـ:**
1. **إضافة Unit Tests** للأنظمة الحالية؟
2. **تقسيم الـ Services الكبيرة**؟
3. **إنشاء البنية الأساسية لنظام الخدمات** (مع Best Practices)؟
4. **إنشاء Base Repository Class** لإزالة Code Duplication؟

أخبرني بما تريد البدء به! 🚀

