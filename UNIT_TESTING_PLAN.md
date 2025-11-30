# 📋 خطة شاملة لـ Unit Testing - Daraa Platform

**تاريخ:** 2025-11-28  
**الحالة:** 🚀 **جاهز للتنفيذ**  
**الهدف:** تحقيق 80%+ Test Coverage

---

## 📊 الوضع الحالي

### **الإحصائيات:**
```
📦 Total Services: 119 services
🎮 Total Controllers: 35 controllers
📂 Total Repositories: 42 repositories
✅ Existing Tests: 0 tests
🎯 Target Coverage: 80%+
```

### **ما يجب اختباره:**
```
1. Services (119 files)
   - CRUD Services
   - Query Services
   - Validation Services
   - Business Logic Services
   - Facade Services

2. Controllers (35 files)
   - API Endpoints
   - Request Validation
   - Response Formatting
   - Error Handling

3. Repositories (42 files)
   - CRUD Operations
   - Custom Queries
   - Pagination
   - Filtering

4. DTOs & Validation
   - Input Validation
   - Transformation
   - Sanitization
```

**الوقت المتوقع:** 5-7 أيام (40-56 ساعة)

---

## 🎯 الأهداف

### **1. Coverage Goals:**
- ✅ **Services:** 85%+ coverage
- ✅ **Controllers:** 80%+ coverage
- ✅ **Repositories:** 90%+ coverage
- ✅ **Overall:** 80%+ coverage

### **2. Quality Goals:**
- ✅ جميع الـ Critical Paths مغطاة
- ✅ جميع الـ Edge Cases مختبرة
- ✅ جميع الـ Error Scenarios مختبرة
- ✅ Mocking صحيح للـ Dependencies

### **3. Performance Goals:**
- ✅ جميع الـ Tests تعمل في <5 ثواني
- ✅ Isolated Tests (لا تعتمد على بعضها)
- ✅ Fast Feedback Loop

---

## 📝 استراتيجية الاختبار

### **Testing Pyramid:**
```
        /\
       /  \      E2E Tests (10%)
      /____\     - Critical User Flows
     /      \    
    /        \   Integration Tests (20%)
   /__________\  - Service Integration
  /            \ 
 /              \ Unit Tests (70%)
/________________\ - Services, Controllers, Repositories
```

### **Test Types:**

#### **1. Unit Tests (70%)**
- **Services:** اختبار Business Logic بشكل منفصل
- **Controllers:** اختبار API Endpoints بشكل منفصل
- **Repositories:** اختبار Data Access بشكل منفصل
- **Utilities:** اختبار Helper Functions

#### **2. Integration Tests (20%)**
- **Service Integration:** اختبار تكامل Services مع بعضها
- **Database Integration:** اختبار تكامل مع MongoDB
- **External Services:** اختبار تكامل مع AWS, Redis, etc.

#### **3. E2E Tests (10%)**
- **Critical Flows:** اختبار User Flows الكاملة
- **API Flows:** اختبار API Endpoints من البداية للنهاية

---

## 🏗️ هيكل الاختبارات

### **File Structure:**
```
server/src/domains/
├── e-commerce/
│   ├── products/
│   │   ├── services/
│   │   │   ├── product.service.ts
│   │   │   ├── product.service.spec.ts          ← Unit Test
│   │   │   ├── product-crud.service.ts
│   │   │   ├── product-crud.service.spec.ts     ← Unit Test
│   │   │   ├── product-query.service.ts
│   │   │   └── product-query.service.spec.ts    ← Unit Test
│   │   ├── controllers/
│   │   │   ├── product.controller.ts
│   │   │   └── product.controller.spec.ts       ← Unit Test
│   │   └── repositories/
│   │       ├── product.repository.ts
│   │       └── product.repository.spec.ts       ← Unit Test
│   └── ...
└── shared/
    └── ...

server/test/
├── integration/                                  ← Integration Tests
│   ├── products.integration.spec.ts
│   └── ...
└── e2e/                                          ← E2E Tests
    ├── products.e2e-spec.ts
    └── ...
```

### **Naming Convention:**
```
✅ product.service.spec.ts       - Service Unit Test
✅ product.controller.spec.ts    - Controller Unit Test
✅ product.repository.spec.ts    - Repository Unit Test
✅ products.integration.spec.ts  - Integration Test
✅ products.e2e-spec.ts          - E2E Test
```

---

## 📚 Testing Tools & Libraries

### **Core Testing Framework:**
```json
{
  "jest": "^30.0.0",                    // Test Runner
  "ts-jest": "^29.2.5",                 // TypeScript Support
  "@nestjs/testing": "^11.0.1",         // NestJS Testing Utilities
  "@types/jest": "^30.0.0"              // TypeScript Types
}
```

### **Mocking & Utilities:**
```json
{
  "supertest": "^7.0.0",                // HTTP Testing
  "@faker-js/faker": "^8.0.0",          // Fake Data Generation
  "mongodb-memory-server": "^9.0.0"     // In-Memory MongoDB
}
```

### **Coverage Tools:**
```json
{
  "jest": {
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!**/*.spec.ts",
      "!**/*.e2e-spec.ts"
    ],
    "coverageDirectory": "../coverage",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## 🎯 المراحل التفصيلية

---

## 🔴 **المرحلة 1: Setup & Configuration (2-3 ساعات)**

### **الخطوة 1.1: تثبيت Dependencies**
```bash
npm install --save-dev @faker-js/faker mongodb-memory-server
```

### **الخطوة 1.2: تحديث Jest Configuration**

**ملف:** `server/package.json`

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!**/*.spec.ts",
      "!**/*.e2e-spec.ts",
      "!**/node_modules/**",
      "!**/dist/**",
      "!**/coverage/**",
      "!**/*.module.ts",
      "!**/*.interface.ts",
      "!**/main.ts"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/$1"
    }
  }
}
```

### **الخطوة 1.3: إنشاء Test Utilities**

**ملف:** `server/src/domains/shared/testing/test-utils.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * Create a mock Mongoose Model
 */
export const createMockModel = <T>(): Partial<Model<T>> => ({
  new: jest.fn(),
  constructor: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
  exists: jest.fn(),
  exec: jest.fn(),
  populate: jest.fn(),
  sort: jest.fn(),
  limit: jest.fn(),
  skip: jest.fn(),
});

/**
 * Create a mock Repository
 */
export const createMockRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findWithPagination: jest.fn(),
  update: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  delete: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  exists: jest.fn(),
  getModel: jest.fn(),
});

/**
 * Create a mock EventEmitter
 */
export const createMockEventEmitter = () => ({
  emit: jest.fn(),
  on: jest.fn(),
  once: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
});

/**
 * Create a mock Logger
 */
export const createMockLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
});

/**
 * Generate fake ObjectId
 */
export const generateObjectId = (): string => {
  return '507f1f77bcf86cd799439011';
};

/**
 * Generate multiple fake ObjectIds
 */
export const generateObjectIds = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) =>
    `507f1f77bcf86cd79943${String(i).padStart(4, '0')}`
  );
};
```

**ملف:** `server/src/domains/shared/testing/mock-data.factory.ts`

```typescript
import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';

/**
 * Mock Data Factory for generating test data
 */
export class MockDataFactory {
  /**
   * Generate a fake Product
   */
  static createProduct(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
      storeId: new Types.ObjectId(),
      categoryId: new Types.ObjectId(),
      images: [faker.image.url()],
      status: 'active',
      stock: faker.number.int({ min: 0, max: 100 }),
      isFeatured: faker.datatype.boolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Order
   */
  static createOrder(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      orderNumber: faker.string.alphanumeric(10).toUpperCase(),
      customerId: new Types.ObjectId(),
      storeId: new Types.ObjectId(),
      items: [
        {
          productId: new Types.ObjectId(),
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: parseFloat(faker.commerce.price()),
        },
      ],
      totalAmount: parseFloat(faker.commerce.price({ min: 100, max: 1000 })),
      orderStatus: 'pending',
      paymentStatus: 'pending',
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake User/Account
   */
  static createAccount(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      phoneNumber: faker.phone.number('+963#########'),
      role: 'customer',
      isActive: true,
      isVerified: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Coupon
   */
  static createCoupon(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      code: faker.string.alphanumeric(8).toUpperCase(),
      type: 'percentage',
      discountValue: faker.number.int({ min: 5, max: 50 }),
      validFrom: faker.date.past(),
      validUntil: faker.date.future(),
      isActive: true,
      usageLimit: faker.number.int({ min: 10, max: 100 }),
      usedCount: 0,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Review
   */
  static createReview(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      customerId: new Types.ObjectId(),
      targetType: 'product',
      targetId: new Types.ObjectId(),
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.sentence(),
      comment: faker.lorem.paragraph(),
      status: 'approved',
      isVerifiedPurchase: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate multiple items
   */
  static createMany<T>(factory: () => T, count: number): T[] {
    return Array.from({ length: count }, factory);
  }
}
```

### **الخطوة 1.4: إنشاء Test Setup File**

**ملف:** `server/src/domains/shared/testing/setup-tests.ts`

```typescript
// Global test setup
beforeAll(() => {
  // Setup global mocks
  jest.setTimeout(10000);
});

afterAll(() => {
  // Cleanup
  jest.clearAllMocks();
});

afterEach(() => {
  // Clear mocks after each test
  jest.clearAllMocks();
});
```

**الوقت المتوقع:** 2-3 ساعات

---

## 🟡 **المرحلة 2: Repository Tests (8-10 ساعات)**

### **الهدف:** اختبار جميع الـ 42 Repositories

### **Template للـ Repository Test:**

**ملف:** `server/src/domains/e-commerce/products/repositories/product.repository.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductRepository } from './product.repository';
import { Product, ProductDocument } from '../../../../database/schemas/product.schema';
import { createMockModel, generateObjectId } from '../../../shared/testing/test-utils';
import { MockDataFactory } from '../../../shared/testing/mock-data.factory';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let model: Model<ProductDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getModelToken(Product.name),
          useValue: createMockModel<ProductDocument>(),
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
    model = module.get<Model<ProductDocument>>(getModelToken(Product.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      // Arrange
      const productData = MockDataFactory.createProduct();
      const mockProduct = { ...productData, save: jest.fn().mockResolvedValue(productData) };
      (model as any).mockImplementation(() => mockProduct);

      // Act
      const result = await repository.create(productData);

      // Assert
      expect(result).toEqual(productData);
      expect(mockProduct.save).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a product by id', async () => {
      // Arrange
      const productId = generateObjectId();
      const mockProduct = MockDataFactory.createProduct({ _id: productId });
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any);

      // Act
      const result = await repository.findById(productId);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(model.findById).toHaveBeenCalledWith(productId);
    });

    it('should return null if product not found', async () => {
      // Arrange
      const productId = generateObjectId();
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act
      const result = await repository.findById(productId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      // Arrange
      const mockProducts = MockDataFactory.createMany(() => MockDataFactory.createProduct(), 3);
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProducts),
      } as any);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual(mockProducts);
      expect(result).toHaveLength(3);
    });

    it('should filter products by criteria', async () => {
      // Arrange
      const storeId = generateObjectId();
      const mockProducts = MockDataFactory.createMany(
        () => MockDataFactory.createProduct({ storeId }),
        2
      );
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProducts),
      } as any);

      // Act
      const result = await repository.findAll({ storeId });

      // Assert
      expect(result).toEqual(mockProducts);
      expect(model.find).toHaveBeenCalledWith({ storeId });
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      // Arrange
      const productId = generateObjectId();
      const updateData = { name: 'Updated Product' };
      const mockProduct = MockDataFactory.createProduct({ _id: productId, ...updateData });
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any);

      // Act
      const result = await repository.update(productId, updateData);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        updateData,
        { new: true }
      );
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      // Arrange
      const productId = generateObjectId();
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: productId }),
      } as any);

      // Act
      const result = await repository.delete(productId);

      // Assert
      expect(result).toBe(true);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(productId);
    });

    it('should return false if product not found', async () => {
      // Arrange
      const productId = generateObjectId();
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act
      const result = await repository.delete(productId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count products', async () => {
      // Arrange
      jest.spyOn(model, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      } as any);

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(10);
    });
  });

  describe('exists', () => {
    it('should return true if product exists', async () => {
      // Arrange
      const filter = { sku: 'TEST-SKU' };
      jest.spyOn(model, 'exists').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: generateObjectId() }),
      } as any);

      // Act
      const result = await repository.exists(filter);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if product does not exist', async () => {
      // Arrange
      const filter = { sku: 'NON-EXISTENT' };
      jest.spyOn(model, 'exists').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act
      const result = await repository.exists(filter);

      // Assert
      expect(result).toBe(false);
    });
  });
});
```

### **Repositories للاختبار (42 repositories):**

**E-commerce Domain:**
1. ProductRepository
2. OrderRepository
3. CartRepository
4. CouponRepository
5. ReviewRepository
6. CategoryRepository
7. InventoryRepository
8. PaymentRepository
9. ReturnRepository
10. OfferRepository
11. DisputeRepository

**Shared Domain:**
12. AccountRepository
13. CustomerProfileRepository
14. StoreOwnerProfileRepository
15. CourierProfileRepository
16. AdminProfileRepository
17. AddressRepository
18. NotificationRepository
19. WalletRepository
20. WalletTransactionRepository
21. ReferralRepository
22. CommissionRepository
23. PointsTransactionRepository
24. SubscriptionRepository
25. SubscriptionPlanRepository
26. SettingsRepository
27. StoreCategoryRepository
28. StoreSettingsRepository
29. SystemSettingsRepository
30. VerificationRepository
31. AuditLogRepository
32. DeliveryZoneRepository
33. NotificationTemplateRepository
34. NotificationPreferenceRepository
35. StoreRepository
36. StoreSubscriptionRepository
37. StoreAnalyticsRepository
38. OrderAnalyticsRepository
39. ProductAnalyticsRepository
40. CustomerAnalyticsRepository
41. CourierAnalyticsRepository
42. SystemAnalyticsRepository

**الوقت المتوقع:** 8-10 ساعات (15 دقيقة لكل repository)

---

## 🟢 **المرحلة 3: Service Tests (15-20 ساعات)**

### **الهدف:** اختبار جميع الـ 119 Services

### **3.1: CRUD Services Tests**

**Template للـ CRUD Service Test:**

**ملف:** `server/src/domains/e-commerce/products/services/product-crud.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { ProductCrudService } from './product-crud.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductValidationService } from './product-validation.service';
import { ProductSubscriptionService } from './product-subscription.service';
import { CategoryService } from '../../categories/services/category.service';
import { createMockRepository, createMockEventEmitter, generateObjectId } from '../../../shared/testing/test-utils';
import { MockDataFactory } from '../../../shared/testing/mock-data.factory';
import { CreateProductDto } from '../dto';

describe('ProductCrudService', () => {
  let service: ProductCrudService;
  let productRepository: jest.Mocked<ProductRepository>;
  let validationService: jest.Mocked<ProductValidationService>;
  let subscriptionService: jest.Mocked<ProductSubscriptionService>;
  let categoryService: jest.Mocked<CategoryService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCrudService,
        {
          provide: ProductRepository,
          useValue: createMockRepository(),
        },
        {
          provide: ProductValidationService,
          useValue: {
            validateSlugUniqueness: jest.fn(),
            validateSkuUniqueness: jest.fn(),
            validateCategory: jest.fn(),
          },
        },
        {
          provide: ProductSubscriptionService,
          useValue: {
            checkSubscriptionLimits: jest.fn(),
            incrementDailyUsage: jest.fn(),
          },
        },
        {
          provide: CategoryService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: createMockEventEmitter(),
        },
      ],
    }).compile();

    service = module.get<ProductCrudService>(ProductCrudService);
    productRepository = module.get(ProductRepository);
    validationService = module.get(ProductValidationService);
    subscriptionService = module.get(ProductSubscriptionService);
    categoryService = module.get(CategoryService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product successfully', async () => {
      // Arrange
      const userId = generateObjectId();
      const createDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        sku: 'TEST-SKU',
        slug: 'test-product',
        storeId: generateObjectId(),
        categoryId: generateObjectId(),
        images: ['image1.jpg'],
      };
      const mockProduct = MockDataFactory.createProduct(createDto);

      subscriptionService.checkSubscriptionLimits.mockResolvedValue(undefined);
      validationService.validateSlugUniqueness.mockResolvedValue(undefined);
      validationService.validateSkuUniqueness.mockResolvedValue(undefined);
      categoryService.findOne.mockResolvedValue({ _id: createDto.categoryId } as any);
      productRepository.create.mockResolvedValue(mockProduct as any);
      subscriptionService.incrementDailyUsage.mockResolvedValue(undefined);

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(subscriptionService.checkSubscriptionLimits).toHaveBeenCalledWith(
        createDto.storeId,
        createDto.images.length
      );
      expect(validationService.validateSlugUniqueness).toHaveBeenCalledWith(createDto.slug);
      expect(validationService.validateSkuUniqueness).toHaveBeenCalledWith(createDto.sku);
      expect(categoryService.findOne).toHaveBeenCalledWith(createDto.categoryId);
      expect(productRepository.create).toHaveBeenCalled();
      expect(subscriptionService.incrementDailyUsage).toHaveBeenCalledWith(createDto.storeId);
    });

    it('should throw ConflictException if slug already exists', async () => {
      // Arrange
      const userId = generateObjectId();
      const createDto: CreateProductDto = {
        name: 'Test Product',
        slug: 'existing-slug',
        storeId: generateObjectId(),
      } as any;

      subscriptionService.checkSubscriptionLimits.mockResolvedValue(undefined);
      validationService.validateSlugUniqueness.mockRejectedValue(
        new ConflictException('Slug already exists')
      );

      // Act & Assert
      await expect(service.create(createDto, userId)).rejects.toThrow(ConflictException);
      expect(productRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      // Arrange
      const userId = generateObjectId();
      const createDto: CreateProductDto = {
        name: 'Test Product',
        slug: 'test-product',
        storeId: generateObjectId(),
        categoryId: generateObjectId(),
      } as any;

      subscriptionService.checkSubscriptionLimits.mockResolvedValue(undefined);
      validationService.validateSlugUniqueness.mockResolvedValue(undefined);
      validationService.validateSkuUniqueness.mockResolvedValue(undefined);
      categoryService.findOne.mockRejectedValue(new NotFoundException('Category not found'));

      // Act & Assert
      await expect(service.create(createDto, userId)).rejects.toThrow(NotFoundException);
      expect(productRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      // Arrange
      const productId = generateObjectId();
      const userId = generateObjectId();
      const updateDto = { name: 'Updated Product' };
      const existingProduct = MockDataFactory.createProduct({ _id: productId });
      const updatedProduct = { ...existingProduct, ...updateDto };

      productRepository.findById.mockResolvedValue(existingProduct as any);
      productRepository.update.mockResolvedValue(updatedProduct as any);

      // Act
      const result = await service.update(productId, updateDto, userId);

      // Assert
      expect(result).toEqual(updatedProduct);
      expect(productRepository.findById).toHaveBeenCalledWith(productId);
      expect(productRepository.update).toHaveBeenCalledWith(productId, updateDto);
    });

    it('should throw NotFoundException if product not found', async () => {
      // Arrange
      const productId = generateObjectId();
      const userId = generateObjectId();
      const updateDto = { name: 'Updated Product' };

      productRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(productId, updateDto, userId)).rejects.toThrow(
        NotFoundException
      );
      expect(productRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a product successfully', async () => {
      // Arrange
      const productId = generateObjectId();
      const mockProduct = MockDataFactory.createProduct({ _id: productId });

      productRepository.findById.mockResolvedValue(mockProduct as any);
      productRepository.delete.mockResolvedValue(true);

      // Act
      await service.delete(productId);

      // Assert
      expect(productRepository.findById).toHaveBeenCalledWith(productId);
      expect(productRepository.delete).toHaveBeenCalledWith(productId);
      expect(eventEmitter.emit).toHaveBeenCalledWith('product.deleted', {
        productId,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      // Arrange
      const productId = generateObjectId();

      productRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete(productId)).rejects.toThrow(NotFoundException);
      expect(productRepository.delete).not.toHaveBeenCalled();
    });
  });
});
```

### **3.2: Query Services Tests**

**Template للـ Query Service Test:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProductQueryService } from './product-query.service';
import { ProductRepository } from '../repositories/product.repository';
import { createMockRepository, generateObjectId } from '../../../shared/testing/test-utils';
import { MockDataFactory } from '../../../shared/testing/mock-data.factory';

describe('ProductQueryService', () => {
  let service: ProductQueryService;
  let productRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductQueryService,
        {
          provide: ProductRepository,
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ProductQueryService>(ProductQueryService);
    productRepository = module.get(ProductRepository);
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      // Arrange
      const mockProducts = MockDataFactory.createMany(() => MockDataFactory.createProduct(), 10);
      const query = { page: 1, limit: 10 };

      productRepository.findWithPagination.mockResolvedValue({
        data: mockProducts as any,
        total: 10,
        page: 1,
        limit: 10,
      });

      // Act
      const result = await service.findAll(query);

      // Assert
      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter products by storeId', async () => {
      // Arrange
      const storeId = generateObjectId();
      const mockProducts = MockDataFactory.createMany(
        () => MockDataFactory.createProduct({ storeId }),
        5
      );
      const query = { storeId, page: 1, limit: 10 };

      productRepository.findWithPagination.mockResolvedValue({
        data: mockProducts as any,
        total: 5,
        page: 1,
        limit: 10,
      });

      // Act
      const result = await service.findAll(query);

      // Assert
      expect(result.data).toHaveLength(5);
      expect(productRepository.findWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({ storeId: expect.any(Object) }),
        expect.any(Object)
      );
    });
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      // Arrange
      const productId = generateObjectId();
      const mockProduct = MockDataFactory.createProduct({ _id: productId });

      productRepository.findById.mockResolvedValue(mockProduct as any);

      // Act
      const result = await service.findById(productId);

      // Assert
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      // Arrange
      const productId = generateObjectId();

      productRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(productId)).rejects.toThrow();
    });
  });
});
```

### **3.3: Validation Services Tests**

**Template للـ Validation Service Test:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { ProductValidationService } from './product-validation.service';
import { ProductRepository } from '../repositories/product.repository';
import { createMockRepository, generateObjectId } from '../../../shared/testing/test-utils';
import { MockDataFactory } from '../../../shared/testing/mock-data.factory';

describe('ProductValidationService', () => {
  let service: ProductValidationService;
  let productRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductValidationService,
        {
          provide: ProductRepository,
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ProductValidationService>(ProductValidationService);
    productRepository = module.get(ProductRepository);
  });

  describe('validateSlugUniqueness', () => {
    it('should pass if slug is unique', async () => {
      // Arrange
      const slug = 'unique-slug';
      productRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateSlugUniqueness(slug)).resolves.not.toThrow();
    });

    it('should throw ConflictException if slug exists', async () => {
      // Arrange
      const slug = 'existing-slug';
      const existingProduct = MockDataFactory.createProduct({ slug });
      productRepository.findOne.mockResolvedValue(existingProduct as any);

      // Act & Assert
      await expect(service.validateSlugUniqueness(slug)).rejects.toThrow(ConflictException);
    });

    it('should pass if slug exists but belongs to the same product', async () => {
      // Arrange
      const productId = generateObjectId();
      const slug = 'existing-slug';
      const existingProduct = MockDataFactory.createProduct({ _id: productId, slug });
      productRepository.findOne.mockResolvedValue(existingProduct as any);

      // Act & Assert
      await expect(service.validateSlugUniqueness(slug, productId)).resolves.not.toThrow();
    });
  });

  describe('validateSkuUniqueness', () => {
    it('should pass if SKU is unique', async () => {
      // Arrange
      const sku = 'UNIQUE-SKU';
      productRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateSkuUniqueness(sku)).resolves.not.toThrow();
    });

    it('should throw ConflictException if SKU exists', async () => {
      // Arrange
      const sku = 'EXISTING-SKU';
      const existingProduct = MockDataFactory.createProduct({ sku });
      productRepository.findOne.mockResolvedValue(existingProduct as any);

      // Act & Assert
      await expect(service.validateSkuUniqueness(sku)).rejects.toThrow(ConflictException);
    });
  });
});
```

### **3.4: Facade Services Tests**

**Template للـ Facade Service Test:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductCrudService } from './product-crud.service';
import { ProductQueryService } from './product-query.service';
import { ProductValidationService } from './product-validation.service';
import { generateObjectId } from '../../../shared/testing/test-utils';
import { MockDataFactory } from '../../../shared/testing/mock-data.factory';

describe('ProductService (Facade)', () => {
  let service: ProductService;
  let crudService: jest.Mocked<ProductCrudService>;
  let queryService: jest.Mocked<ProductQueryService>;
  let validationService: jest.Mocked<ProductValidationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductCrudService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ProductQueryService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findBySlug: jest.fn(),
          },
        },
        {
          provide: ProductValidationService,
          useValue: {
            validateSlugUniqueness: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    crudService = module.get(ProductCrudService);
    queryService = module.get(ProductQueryService);
    validationService = module.get(ProductValidationService);
  });

  describe('create', () => {
    it('should delegate to crudService.create', async () => {
      // Arrange
      const userId = generateObjectId();
      const createDto = { name: 'Test Product' } as any;
      const mockProduct = MockDataFactory.createProduct(createDto);

      crudService.create.mockResolvedValue(mockProduct as any);

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(crudService.create).toHaveBeenCalledWith(createDto, userId);
    });
  });

  describe('findAll', () => {
    it('should delegate to queryService.findAll', async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      const mockResult = {
        data: MockDataFactory.createMany(() => MockDataFactory.createProduct(), 10),
        total: 10,
        page: 1,
        limit: 10,
      };

      queryService.findAll.mockResolvedValue(mockResult as any);

      // Act
      const result = await service.findAll(query);

      // Assert
      expect(result).toEqual(mockResult);
      expect(queryService.findAll).toHaveBeenCalledWith(query);
    });
  });
});
```

**الوقت المتوقع:** 15-20 ساعات (10-15 دقيقة لكل service)

---

## 🔵 **المرحلة 4: Controller Tests (10-12 ساعات)**

### **الهدف:** اختبار جميع الـ 35 Controllers

### **Template للـ Controller Test:**

**ملف:** `server/src/domains/e-commerce/products/controllers/product.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from '../services/product.service';
import { ProductVariantService } from '../services/product-variant.service';
import { ProductMediaService } from '../services/product-media.service';
import { StorageService } from '../../../../infrastructure/storage/storage.service';
import { generateObjectId } from '../../../shared/testing/test-utils';
import { MockDataFactory } from '../../../shared/testing/mock-data.factory';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: jest.Mocked<ProductService>;
  let variantService: jest.Mocked<ProductVariantService>;
  let mediaService: jest.Mocked<ProductMediaService>;
  let storageService: jest.Mocked<StorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ProductVariantService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: ProductMediaService,
          useValue: {
            uploadImages: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get(ProductService);
    variantService = module.get(ProductVariantService);
    mediaService = module.get(ProductMediaService);
    storageService = module.get(StorageService);
  });

  describe('create', () => {
    it('should create a new product', async () => {
      // Arrange
      const userId = generateObjectId();
      const createDto = { name: 'Test Product', storeId: generateObjectId() } as any;
      const mockProduct = MockDataFactory.createProduct(createDto);
      const user = { userId, role: 'store_owner' };

      productService.create.mockResolvedValue(mockProduct as any);

      // Act
      const result = await controller.create(createDto, user);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(productService.create).toHaveBeenCalledWith(createDto, userId);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      const mockResult = {
        data: MockDataFactory.createMany(() => MockDataFactory.createProduct(), 10),
        total: 10,
        page: 1,
        limit: 10,
      };

      productService.findAll.mockResolvedValue(mockResult as any);

      // Act
      const result = await controller.findAll(query);

      // Assert
      expect(result).toEqual(mockResult);
      expect(productService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      // Arrange
      const productId = generateObjectId();
      const mockProduct = MockDataFactory.createProduct({ _id: productId });

      productService.findById.mockResolvedValue(mockProduct as any);

      // Act
      const result = await controller.findOne(productId);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(productService.findById).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException if product not found', async () => {
      // Arrange
      const productId = generateObjectId();

      productService.findById.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne(productId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      // Arrange
      const productId = generateObjectId();
      const userId = generateObjectId();
      const updateDto = { name: 'Updated Product' };
      const mockProduct = MockDataFactory.createProduct({ _id: productId, ...updateDto });
      const user = { userId, role: 'store_owner' };

      productService.update.mockResolvedValue(mockProduct as any);

      // Act
      const result = await controller.update(productId, updateDto, user);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(productService.update).toHaveBeenCalledWith(productId, updateDto, userId);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      // Arrange
      const productId = generateObjectId();
      const userId = generateObjectId();
      const user = { userId, role: 'store_owner' };

      productService.delete.mockResolvedValue(undefined);

      // Act
      await controller.delete(productId, user);

      // Assert
      expect(productService.delete).toHaveBeenCalledWith(productId);
    });
  });
});
```

**الوقت المتوقع:** 10-12 ساعات (20-25 دقيقة لكل controller)

---

## 🟣 **المرحلة 5: Integration Tests (6-8 ساعات)**

### **الهدف:** اختبار تكامل Services مع بعضها

### **Template للـ Integration Test:**

**ملف:** `server/test/integration/products.integration.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { ProductModule } from '../../src/domains/e-commerce/products/product.module';
import { ProductService } from '../../src/domains/e-commerce/products/services/product.service';
import { ProductRepository } from '../../src/domains/e-commerce/products/repositories/product.repository';
import { MockDataFactory } from '../../src/domains/shared/testing/mock-data.factory';

describe('Products Integration Tests', () => {
  let mongod: MongoMemoryServer;
  let moduleRef: TestingModule;
  let productService: ProductService;
  let productRepository: ProductRepository;
  let mongoConnection: Connection;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        ProductModule,
      ],
    }).compile();

    productService = moduleRef.get<ProductService>(ProductService);
    productRepository = moduleRef.get<ProductRepository>(ProductRepository);
    mongoConnection = moduleRef.get(Connection);
  });

  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
    await moduleRef.close();
  });

  afterEach(async () => {
    // Clear database after each test
    const collections = mongoConnection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('Product CRUD Operations', () => {
    it('should create, read, update, and delete a product', async () => {
      // Create
      const createDto = MockDataFactory.createProduct();
      const created = await productService.create(createDto as any, 'user-id');
      expect(created).toBeDefined();
      expect(created.name).toBe(createDto.name);

      // Read
      const found = await productService.findById(created._id.toString());
      expect(found).toBeDefined();
      expect(found._id).toEqual(created._id);

      // Update
      const updateDto = { name: 'Updated Product' };
      const updated = await productService.update(
        created._id.toString(),
        updateDto,
        'user-id'
      );
      expect(updated.name).toBe('Updated Product');

      // Delete
      await productService.delete(created._id.toString());
      const deleted = await productRepository.findById(created._id.toString());
      expect(deleted).toBeNull();
    });
  });

  describe('Product Query Operations', () => {
    it('should filter products by storeId', async () => {
      // Arrange
      const storeId = 'store-123';
      const products = await Promise.all([
        productService.create(MockDataFactory.createProduct({ storeId }) as any, 'user-id'),
        productService.create(MockDataFactory.createProduct({ storeId }) as any, 'user-id'),
        productService.create(MockDataFactory.createProduct({ storeId: 'other-store' }) as any, 'user-id'),
      ]);

      // Act
      const result = await productService.findAll({ storeId, page: 1, limit: 10 });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});
```

**الوقت المتوقع:** 6-8 ساعات

---

## 🎯 خطة التنفيذ الموصى بها

### **الأسبوع 1: (40 ساعات)**

**اليوم 1-2: Setup & Repositories (10-13 ساعات)**
- ✅ Setup & Configuration (2-3 ساعات)
- ✅ Repository Tests (8-10 ساعات)

**اليوم 3-5: Services (15-20 ساعات)**
- ✅ CRUD Services Tests (6-8 ساعات)
- ✅ Query Services Tests (4-6 ساعات)
- ✅ Validation Services Tests (3-4 ساعات)
- ✅ Facade Services Tests (2-2 ساعات)

**اليوم 6-7: Controllers & Integration (16-20 ساعات)**
- ✅ Controller Tests (10-12 ساعات)
- ✅ Integration Tests (6-8 ساعات)

---

## ✅ معايير النجاح

### **Coverage Metrics:**
```bash
npm run test:cov
```

**الأهداف:**
- ✅ **Overall Coverage:** 80%+
- ✅ **Services Coverage:** 85%+
- ✅ **Controllers Coverage:** 80%+
- ✅ **Repositories Coverage:** 90%+

### **Test Quality:**
- ✅ جميع Tests تعمل بنجاح
- ✅ لا توجد Flaky Tests
- ✅ Tests معزولة (Isolated)
- ✅ Fast execution (<5 seconds)

---

## 🚀 الأوامر المفيدة

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm run test -- product.service.spec.ts

# Run tests for specific domain
npm run test -- --testPathPattern=e-commerce/products

# Run integration tests
npm run test -- --testPathPattern=integration

# Debug tests
npm run test:debug
```

---

## 📊 تتبع التقدم

### **Checklist:**

**Phase 1: Setup**
- [ ] Install dependencies
- [ ] Update Jest config
- [ ] Create test utilities
- [ ] Create mock data factory

**Phase 2: Repositories (42 tests)**
- [ ] E-commerce repositories (11)
- [ ] Shared repositories (31)

**Phase 3: Services (119 tests)**
- [ ] CRUD services
- [ ] Query services
- [ ] Validation services
- [ ] Facade services

**Phase 4: Controllers (35 tests)**
- [ ] E-commerce controllers
- [ ] Shared controllers

**Phase 5: Integration (10-15 tests)**
- [ ] Product integration
- [ ] Order integration
- [ ] Payment integration
- [ ] etc.

---

## 💡 نصائح مهمة

### **Best Practices:**

1. **AAA Pattern:**
   ```typescript
   // Arrange - Setup test data
   // Act - Execute the code
   // Assert - Verify results
   ```

2. **Test Naming:**
   ```typescript
   describe('ServiceName', () => {
     describe('methodName', () => {
       it('should do something when condition', () => {
         // test
       });
     });
   });
   ```

3. **Mocking:**
   - Mock external dependencies
   - Don't mock the system under test
   - Use jest.fn() for simple mocks

4. **Isolation:**
   - Each test should be independent
   - Clear mocks after each test
   - Don't share state between tests

5. **Coverage:**
   - Focus on critical paths first
   - Test edge cases
   - Test error scenarios

---

**📄 تم إنشاء:** `UNIT_TESTING_PLAN.md`
**🎯 الهدف:** 80%+ Test Coverage
**⏱️ الوقت المتوقع:** 5-7 أيام (40-56 ساعة)

