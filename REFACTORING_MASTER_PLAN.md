# 🏗️ **خطة Refactoring الشاملة - نظام Daraa**

**تاريخ الخطة:** 2025-11-11  
**الحالة الحالية:** 29 modules, 137/271 tests passing  
**الهدف:** Refactor إلى Domain-Driven Design مع Microservices-Ready Architecture

---

## 📋 **جدول المحتويات**

1. [الوضع الحالي](#الوضع-الحالي)
2. [الهدف النهائي](#الهدف-النهائي)
3. [خطة التنفيذ (6 مراحل)](#خطة-التنفيذ)
4. [التحقق من الفعالية](#التحقق-من-الفعالية)
5. [خطة الرجوع (Rollback)](#خطة-الرجوع)
6. [المخاطر والتخفيف](#المخاطر-والتخفيف)

---

## 📊 **الوضع الحالي**

### **البنية الحالية:**
```
server/src/
├── common/              # ✅ Shared utilities
├── config/              # ✅ Configuration
├── database/schemas/    # ✅ All schemas (26 schemas)
├── infrastructure/      # ✅ External services (6 services)
└── modules/             # ⚠️ 29 modules (flat structure)
    ├── account/
    ├── auth/
    ├── product/
    ├── order/
    └── ... (25 more)
```

### **المشاكل الحالية:**
1. ❌ **Flat Module Structure** - كل الـ modules في مستوى واحد
2. ❌ **No Domain Boundaries** - لا يوجد فصل واضح بين Domains
3. ❌ **Services كبيرة جداً** - 592 سطر في ReviewService
4. ❌ **No Repository Pattern** - Services تتعامل مع Models مباشرة
5. ❌ **Code Duplication** - تكرار Pagination في 10+ services
6. ❌ **No Unit Tests** - فقط E2E tests
7. ⚠️ **Circular Dependencies** - استخدام forwardRef

### **الإحصائيات:**
```
Total Modules:           29
Total Schemas:           26
Total Services:          29
Largest Service:         592 lines (ReviewService)
Average Service Size:    350 lines
Tests Passing:           137/271 (50.6%)
Code Duplication:        ~15% (Pagination, Filters)
```

---

## 🎯 **الهدف النهائي**

### **البنية المستهدفة:**
```
server/src/
├── common/                          # ✅ Shared utilities
├── config/                          # ✅ Configuration
├── infrastructure/                  # ✅ External services
│
└── domains/                         # ✅ NEW: Domain-Driven Design
    │
    ├── e-commerce/                  # Domain 1: E-commerce
    │   ├── products/
    │   │   ├── products.module.ts
    │   │   ├── controllers/
    │   │   ├── services/            # ✅ < 300 lines each
    │   │   ├── repositories/        # ✅ NEW: Repository Pattern
    │   │   ├── dto/
    │   │   │   ├── requests/
    │   │   │   └── responses/       # ✅ NEW: Response DTOs
    │   │   ├── schemas/             # ✅ Domain-specific schemas
    │   │   ├── events/              # ✅ Domain Events
    │   │   └── tests/               # ✅ NEW: Unit Tests
    │   │       ├── *.service.spec.ts
    │   │       └── *.controller.spec.ts
    │   │
    │   ├── orders/
    │   ├── payments/
    │   ├── inventory/
    │   ├── coupons/
    │   ├── offers/
    │   ├── reviews/
    │   └── analytics/
    │
    ├── services/                    # Domain 2: Services (NEW)
    │   ├── service-catalog/
    │   ├── service-bookings/
    │   ├── service-providers/
    │   └── service-payments/
    │
    └── shared/                      # Shared Domain
        ├── auth/
        ├── accounts/
        ├── notifications/
        ├── settings/
        └── verification/
```

### **الأهداف المحددة:**
1. ✅ **Domain-Driven Design** - فصل واضح بين Domains
2. ✅ **Repository Pattern** - فصل Data Access عن Business Logic
3. ✅ **Service Size < 300 lines** - تقسيم الـ Services الكبيرة
4. ✅ **Response DTOs** - التحكم في API Responses
5. ✅ **Unit Tests** - 80%+ Code Coverage
6. ✅ **Remove Code Duplication** - Base Repository, Shared Utils
7. ✅ **Remove Circular Dependencies** - استخدام Events
8. ✅ **Microservices-Ready** - سهل التحويل مستقبلاً

---

## 🚀 **خطة التنفيذ (6 مراحل)**

### **📅 Timeline Overview:**
```
Phase 0: Preparation & Backup        (1 day)    ← نحن هنا
Phase 1: Foundation                  (1 week)
Phase 2: Domain Restructuring        (2 weeks)
Phase 3: Repository Pattern          (1 week)
Phase 4: Service Splitting           (1 week)
Phase 5: Unit Tests                  (1 week)
Phase 6: Cleanup & Optimization      (3 days)

Total: 6-7 weeks
```

---

## 📦 **Phase 0: Preparation & Backup** (1 يوم)

### **الأهداف:**
1. ✅ Commit جميع التغييرات الحالية
2. ✅ إنشاء GitHub Repository
3. ✅ Push الكود الحالي
4. ✅ إنشاء Branch للـ Refactoring
5. ✅ إنشاء Backup محلي

### **الخطوات التفصيلية:**

#### **Step 1: Commit Current Changes**
```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Pre-refactoring snapshot: 29 modules, 137/271 tests passing"

# Create tag for easy rollback
git tag -a v1.0-pre-refactoring -m "Snapshot before major refactoring"
```

#### **Step 2: Create GitHub Repository**
```bash
# سيتم إنشاؤه يدوياً على GitHub
# Repository Name: daraa-ecommerce-platform
# Description: Multi-vendor E-commerce Platform with Services System
# Visibility: Private (موصى به) أو Public
```

#### **Step 3: Push to GitHub**
```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/daraa-ecommerce-platform.git

# Push master branch
git push -u origin master

# Push tags
git push origin --tags
```

#### **Step 4: Create Refactoring Branch**
```bash
# Create and switch to refactoring branch
git checkout -b refactoring/domain-driven-design

# Push branch to GitHub
git push -u origin refactoring/domain-driven-design
```

#### **Step 5: Create Local Backup**
```bash
# Create backup folder
mkdir -p ../Daraa-Backups

# Create compressed backup
tar -czf ../Daraa-Backups/daraa-backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# Or on Windows (PowerShell)
Compress-Archive -Path . -DestinationPath ..\Daraa-Backups\daraa-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip
```

### **Verification Checklist:**
- [ ] All changes committed
- [ ] Tag created (v1.0-pre-refactoring)
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Refactoring branch created
- [ ] Local backup created
- [ ] Tests still passing (137/271)

### **الوقت المتوقع:** 2-3 ساعات

---

## 🏗️ **Phase 1: Foundation** (أسبوع 1)

### **الأهداف:**
1. ✅ إنشاء البنية الأساسية للـ Domains
2. ✅ إنشاء Base Repository Class
3. ✅ إنشاء Base Service Class
4. ✅ إنشاء Shared Utils (Pagination, Filters)
5. ✅ إعداد Testing Infrastructure

### **الخطوات التفصيلية:**

#### **Day 1: Create Domain Structure**
```bash
# Create domains folder
mkdir -p server/src/domains/{e-commerce,services,shared}

# Create e-commerce subdomains
mkdir -p server/src/domains/e-commerce/{products,orders,payments,inventory,coupons,offers,reviews,analytics}

# Create services subdomains (for future)
mkdir -p server/src/domains/services/{service-catalog,service-bookings,service-providers,service-payments}

# Create shared subdomains
mkdir -p server/src/domains/shared/{auth,accounts,notifications,settings,verification}
```

#### **Day 2: Create Base Repository**
```typescript
// server/src/common/base/base.repository.ts
export abstract class BaseRepository<T> {
  constructor(protected model: Model<T>) {}
  
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }
  
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
  
  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }
  
  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
  
  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
  
  protected abstract buildFilter(query: any): any;
}
```

#### **Day 3: Create Shared Utils**
```typescript
// server/src/common/utils/pagination.util.ts
export class PaginationUtil {
  static buildPaginationQuery(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    
    return { page, limit, skip, sortBy, sortOrder };
  }
  
  static buildPaginationResponse<T>(data: T[], total: number, page: number, limit: number) {
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }
}

// server/src/common/utils/filter.util.ts
export class FilterUtil {
  static buildTextSearchFilter(search?: string) {
    return search ? { $text: { $search: search } } : {};
  }
  
  static buildDateRangeFilter(startDate?: Date, endDate?: Date) {
    const filter: any = {};
    if (startDate) filter.$gte = startDate;
    if (endDate) filter.$lte = endDate;
    return Object.keys(filter).length > 0 ? filter : null;
  }
  
  static buildPriceRangeFilter(minPrice?: number, maxPrice?: number) {
    const filter: any = {};
    if (minPrice !== undefined) filter.$gte = minPrice;
    if (maxPrice !== undefined) filter.$lte = maxPrice;
    return Object.keys(filter).length > 0 ? filter : null;
  }
}
```

#### **Day 4-5: Setup Testing Infrastructure**
```bash
# Install testing dependencies (if not already installed)
npm install --save-dev @nestjs/testing jest ts-jest @types/jest

# Create test utilities
mkdir -p server/src/common/testing
```

```typescript
// server/src/common/testing/test.utils.ts
export class TestUtils {
  static createMockRepository<T>() {
    return {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  }
  
  static createMockModel<T>() {
    return {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      countDocuments: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
    };
  }
}
```

### **Verification Checklist:**
- [ ] Domain structure created
- [ ] BaseRepository implemented
- [ ] Shared utils created (Pagination, Filter)
- [ ] Testing infrastructure ready
- [ ] All existing tests still passing

### **الوقت المتوقع:** 5-7 أيام

---

## 🔄 **Phase 2: Domain Restructuring** (أسبوع 2-3)

### **الأهداف:**
1. ✅ نقل الـ Modules إلى Domains المناسبة
2. ✅ فصل Schemas حسب Domain
3. ✅ تحديث Imports في جميع الملفات
4. ✅ التأكد من عمل النظام بعد كل نقل

### **الاستراتيجية:**
- نقل module واحد في كل مرة
- تشغيل الاختبارات بعد كل نقل
- Commit بعد كل نقل ناجح

### **Domain Mapping:**

#### **E-commerce Domain:**
```
modules/product        → domains/e-commerce/products
modules/order          → domains/e-commerce/orders
modules/payment        → domains/e-commerce/payments
modules/inventory      → domains/e-commerce/inventory
modules/coupon         → domains/e-commerce/coupons
modules/offer          → domains/e-commerce/offers
modules/review         → domains/e-commerce/reviews
modules/analytics      → domains/e-commerce/analytics
modules/cart           → domains/e-commerce/cart
modules/category       → domains/e-commerce/categories
modules/return         → domains/e-commerce/returns
modules/dispute        → domains/e-commerce/disputes
```

#### **Shared Domain:**
```
modules/auth           → domains/shared/auth
modules/account        → domains/shared/accounts
modules/notifications  → domains/shared/notifications
modules/settings       → domains/shared/settings
modules/verification   → domains/shared/verification
modules/admin          → domains/shared/admin
modules/courier        → domains/shared/courier
modules/stores         → domains/shared/stores
modules/store-settings → domains/shared/store-settings
modules/store-categories → domains/shared/store-categories
modules/subscription   → domains/shared/subscription
modules/subscription-plan → domains/shared/subscription-plan
modules/system-settings → domains/shared/system-settings
modules/points-transaction → domains/shared/points-transaction
modules/referral       → domains/shared/referral
modules/audit-logs     → domains/shared/audit-logs
modules/health         → domains/shared/health
```

### **الخطوات التفصيلية (لكل Module):**

#### **Example: Moving Product Module**
```bash
# Step 1: Create new structure
mkdir -p server/src/domains/e-commerce/products/{controllers,services,repositories,dto,schemas,events,tests}

# Step 2: Move files
mv server/src/modules/product/controllers/* server/src/domains/e-commerce/products/controllers/
mv server/src/modules/product/services/* server/src/domains/e-commerce/products/services/
mv server/src/modules/product/dto/* server/src/domains/e-commerce/products/dto/

# Step 3: Move schemas
mv server/src/database/schemas/product.schema.ts server/src/domains/e-commerce/products/schemas/
mv server/src/database/schemas/product-variant.schema.ts server/src/domains/e-commerce/products/schemas/
mv server/src/database/schemas/product-analytics.schema.ts server/src/domains/e-commerce/products/schemas/

# Step 4: Update imports in all files
# (سيتم عمله يدوياً أو بـ script)

# Step 5: Update module file
mv server/src/modules/product/product.module.ts server/src/domains/e-commerce/products/products.module.ts

# Step 6: Test
npm run test:e2e -- phase1.e2e-spec.ts

# Step 7: Commit
git add .
git commit -m "refactor: move Product module to e-commerce domain"
```

### **Verification Checklist (بعد كل Module):**
- [ ] Module moved to correct domain
- [ ] Schemas moved to domain
- [ ] All imports updated
- [ ] Module compiles without errors
- [ ] Related tests passing
- [ ] Changes committed

### **الوقت المتوقع:** 10-14 يوم (29 modules)

---

## 📚 **Phase 3: Repository Pattern** (أسبوع 4)

### **الأهداف:**
1. ✅ إنشاء Repository لكل Domain
2. ✅ نقل Data Access من Services إلى Repositories
3. ✅ تحديث Services لاستخدام Repositories
4. ✅ إضافة Unit Tests للـ Repositories

### **الخطوات التفصيلية:**

#### **Example: Product Repository**
```typescript
// server/src/domains/e-commerce/products/repositories/product.repository.ts
@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }
  
  protected buildFilter(query: QueryProductDto): any {
    const filter: any = {};
    
    if (query.search) {
      filter.$text = { $search: query.search };
    }
    
    if (query.storeId) {
      filter.storeId = new Types.ObjectId(query.storeId);
    }
    
    if (query.categoryId) {
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }
    
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }
    
    return filter;
  }
  
  async findByStore(storeId: string, options: PaginationQuery): Promise<PaginatedResult<Product>> {
    return this.findAll({ ...options, storeId });
  }
  
  async findByCategory(categoryId: string, options: PaginationQuery): Promise<PaginatedResult<Product>> {
    return this.findAll({ ...options, categoryId });
  }
}
```

#### **Update Service to use Repository**
```typescript
// Before
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}
  
  async findAll(query: QueryProductDto) {
    // 50 lines of query building and pagination logic
  }
}

// After
@Injectable()
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
  ) {}
  
  async findAll(query: QueryProductDto) {
    return this.productRepository.findAll(query);
  }
}
```

### **Verification Checklist:**
- [ ] Repository created for each domain
- [ ] Services updated to use repositories
- [ ] All tests passing
- [ ] Code duplication reduced

### **الوقت المتوقع:** 5-7 أيام

---

## ✂️ **Phase 4: Service Splitting** (أسبوع 5)

### **الأهداف:**
1. ✅ تقسيم الـ Services الكبيرة (> 300 lines)
2. ✅ فصل Validation Logic
3. ✅ فصل Business Logic
4. ✅ إنشاء Helper Services

### **Services to Split:**
```
1. ReviewService (592 lines)        → 3 services
2. StoreCategoriesService (504)     → 2 services
3. CouponService (496)              → 2 services
4. ProductService (479)             → 2 services
5. AccountService (461)             → 2 services
6. OrderService (444)               → 2 services
```

### **Example: Splitting ReviewService**
```typescript
// Before: review.service.ts (592 lines)
@Injectable()
export class ReviewService {
  // All logic in one service
}

// After: Split into 3 services

// 1. review.service.ts (200 lines) - Core logic
@Injectable()
export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private reviewValidationService: ReviewValidationService,
    private reviewStatisticsService: ReviewStatisticsService,
  ) {}
  
  async create(data: CreateReviewDto) {
    await this.reviewValidationService.validateCreate(data);
    const review = await this.reviewRepository.create(data);
    await this.reviewStatisticsService.updateProductRating(data.productId);
    return review;
  }
}

// 2. review-validation.service.ts (150 lines) - Validation
@Injectable()
export class ReviewValidationService {
  async validateCreate(data: CreateReviewDto) {
    // Validation logic
  }
}

// 3. review-statistics.service.ts (150 lines) - Statistics
@Injectable()
export class ReviewStatisticsService {
  async updateProductRating(productId: string) {
    // Statistics logic
  }
}
```

### **Verification Checklist:**
- [ ] All services < 300 lines
- [ ] Logic properly separated
- [ ] All tests passing
- [ ] No functionality lost

### **الوقت المتوقع:** 5-7 أيام

---

## ✅ **Phase 5: Unit Tests** (أسبوع 6)

### **الأهداف:**
1. ✅ إضافة Unit Tests لكل Service
2. ✅ إضافة Unit Tests لكل Repository
3. ✅ إضافة Unit Tests لكل Controller
4. ✅ استهداف 80%+ Code Coverage

### **Testing Strategy:**
```
Day 1-2: Core Services (Product, Order, Payment)
Day 3-4: Supporting Services (Inventory, Cart, Coupon)
Day 5-6: Shared Services (Auth, Account, Notification)
Day 7: Integration Tests
```

### **Example: Product Service Unit Test**
```typescript
// server/src/domains/e-commerce/products/tests/product.service.spec.ts
describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: TestUtils.createMockRepository(),
        },
      ],
    }).compile();
    
    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);
  });
  
  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1' }];
      const mockResult = { data: mockProducts, total: 1, page: 1, limit: 20 };
      
      jest.spyOn(repository, 'findAll').mockResolvedValue(mockResult);
      
      const result = await service.findAll({});
      
      expect(result).toEqual(mockResult);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });
});
```

### **Verification Checklist:**
- [ ] All services have unit tests
- [ ] All repositories have unit tests
- [ ] All controllers have unit tests
- [ ] Code coverage > 80%
- [ ] All tests passing

### **الوقت المتوقع:** 5-7 أيام

---

## 🧹 **Phase 6: Cleanup & Optimization** (3 أيام)

### **الأهداف:**
1. ✅ حذف الملفات القديمة
2. ✅ تحديث Documentation
3. ✅ إضافة Response DTOs
4. ✅ تحسين الأداء
5. ✅ Final Testing

### **الخطوات:**
```bash
# Day 1: Cleanup
- Delete old modules folder
- Delete old database/schemas folder
- Update imports
- Remove unused dependencies

# Day 2: Documentation
- Update README.md
- Add API documentation (Swagger)
- Add architecture diagrams

# Day 3: Final Testing
- Run all tests
- Performance testing
- Security audit
```

### **Verification Checklist:**
- [ ] No old files remaining
- [ ] Documentation updated
- [ ] All tests passing (271/271)
- [ ] Performance acceptable
- [ ] Ready for production

### **الوقت المتوقع:** 3 أيام

---

## ✅ **التحقق من الفعالية**

### **Metrics to Track:**

#### **Before Refactoring:**
```
✅ Modules: 29 (flat structure)
✅ Largest Service: 592 lines
✅ Average Service: 350 lines
✅ Code Duplication: ~15%
✅ Tests Passing: 137/271 (50.6%)
✅ Unit Tests: 0
✅ Repository Pattern: No
✅ Response DTOs: No
```

#### **After Refactoring (Target):**
```
✅ Domains: 3 (e-commerce, services, shared)
✅ Largest Service: < 300 lines
✅ Average Service: < 200 lines
✅ Code Duplication: < 5%
✅ Tests Passing: 271/271 (100%)
✅ Unit Tests: 200+
✅ Code Coverage: > 80%
✅ Repository Pattern: Yes
✅ Response DTOs: Yes
```

### **Success Criteria:**
- [ ] All tests passing (271/271)
- [ ] Code coverage > 80%
- [ ] No service > 300 lines
- [ ] Repository pattern implemented
- [ ] Response DTOs implemented
- [ ] Code duplication < 5%
- [ ] Build successful
- [ ] No TypeScript errors
- [ ] Performance not degraded

---

## 🔙 **خطة الرجوع (Rollback Plan)**

### **إذا حدثت مشاكل:**

#### **Option 1: Rollback to Tag**
```bash
# Rollback to pre-refactoring state
git checkout v1.0-pre-refactoring

# Create new branch from tag
git checkout -b rollback-from-refactoring

# Force push to master (if needed)
git push origin master --force
```

#### **Option 2: Rollback to Specific Commit**
```bash
# Find the commit
git log --oneline

# Rollback
git reset --hard <commit-hash>

# Force push
git push origin master --force
```

#### **Option 3: Restore from Backup**
```bash
# Extract backup
tar -xzf ../Daraa-Backups/daraa-backup-YYYYMMDD-HHMMSS.tar.gz -C ./restored

# Or on Windows
Expand-Archive -Path ..\Daraa-Backups\daraa-backup-YYYYMMDD-HHMMSS.zip -DestinationPath .\restored
```

---

## ⚠️ **المخاطر والتخفيف**

### **Risk 1: Breaking Existing Functionality**
**احتمالية:** عالية  
**التأثير:** عالي  
**التخفيف:**
- ✅ نقل module واحد في كل مرة
- ✅ تشغيل الاختبارات بعد كل نقل
- ✅ Commit بعد كل نقل ناجح

### **Risk 2: Import Path Issues**
**احتمالية:** عالية  
**التأثير:** متوسط  
**التخفيف:**
- ✅ استخدام TypeScript Path Aliases
- ✅ تحديث tsconfig.json
- ✅ استخدام Find & Replace بحذر

### **Risk 3: Test Failures**
**احتمالية:** متوسطة  
**التأثير:** عالي  
**التخفيف:**
- ✅ إصلاح الاختبارات الفاشلة أولاً (134 tests)
- ✅ تشغيل الاختبارات بعد كل تغيير
- ✅ عدم المتابعة إذا فشلت الاختبارات

### **Risk 4: Time Overrun**
**احتمالية:** متوسطة  
**التأثير:** متوسط  
**التخفيف:**
- ✅ خطة واقعية (6-7 أسابيع)
- ✅ Buffer time (أسبوع إضافي)
- ✅ يمكن إيقاف الـ Refactoring في أي مرحلة

---

## 📊 **Progress Tracking**

### **Checklist:**
```
Phase 0: Preparation & Backup
[ ] All changes committed
[ ] GitHub repository created
[ ] Code pushed to GitHub
[ ] Refactoring branch created
[ ] Local backup created
[ ] Tests passing (137/271)

Phase 1: Foundation (Week 1)
[ ] Domain structure created
[ ] BaseRepository implemented
[ ] Shared utils created
[ ] Testing infrastructure ready
[ ] Tests passing

Phase 2: Domain Restructuring (Week 2-3)
[ ] E-commerce domain (12 modules)
[ ] Shared domain (17 modules)
[ ] All imports updated
[ ] Tests passing

Phase 3: Repository Pattern (Week 4)
[ ] Repositories created
[ ] Services updated
[ ] Tests passing

Phase 4: Service Splitting (Week 5)
[ ] Large services split
[ ] Tests passing

Phase 5: Unit Tests (Week 6)
[ ] Service tests
[ ] Repository tests
[ ] Controller tests
[ ] Coverage > 80%

Phase 6: Cleanup (3 days)
[ ] Old files deleted
[ ] Documentation updated
[ ] Final testing
[ ] Ready for production
```

---

## 🎯 **Next Steps**

### **الآن:**
1. ✅ مراجعة هذه الخطة
2. ✅ التأكد من فهم جميع المراحل
3. ✅ الموافقة على الخطة

### **بعد الموافقة:**
1. ✅ تنفيذ Phase 0 (Backup & GitHub)
2. ✅ البدء في Phase 1 (Foundation)

---

**هل أنت موافق على هذه الخطة؟**
**هل تريد تعديل أي شيء قبل البدء؟**

