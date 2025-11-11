# Domain-Driven Design Structure

This directory contains the domain-driven design structure for the Daraa platform.

## 📁 Directory Structure

```
domains/
├── e-commerce/          # E-commerce Domain
│   ├── products/        # Product Management
│   ├── orders/          # Order Management
│   ├── stores/          # Store Management
│   ├── inventory/       # Inventory Management
│   ├── categories/      # Category Management
│   ├── coupons/         # Coupon Management
│   ├── offers/          # Offer Management
│   ├── reviews/         # Review & Rating
│   ├── cart/            # Shopping Cart
│   ├── payment/         # Payment Processing
│   ├── returns/         # Return Management
│   └── disputes/        # Dispute Management
│
├── services/            # Services Domain (Future)
│   ├── service-catalog/ # Service Catalog
│   ├── bookings/        # Service Bookings
│   └── providers/       # Service Providers
│
└── shared/              # Shared Domain
    ├── auth/            # Authentication
    ├── accounts/        # Account Management
    ├── notifications/   # Notifications
    ├── analytics/       # Analytics
    ├── settings/        # Settings
    ├── base/            # Base Classes
    ├── dto/             # Shared DTOs
    ├── utils/           # Shared Utilities
    └── testing/         # Testing Utilities
```

## 🏗️ Module Structure

Each module follows this structure:

```
module-name/
├── controllers/         # HTTP Controllers
│   └── module.controller.ts
├── services/            # Business Logic (< 300 lines)
│   └── module.service.ts
├── repositories/        # Data Access Layer
│   └── module.repository.ts
├── dto/                 # Data Transfer Objects
│   ├── requests/        # Request DTOs
│   │   ├── create-module.dto.ts
│   │   └── update-module.dto.ts
│   └── responses/       # Response DTOs
│       └── module-response.dto.ts
├── schemas/             # Mongoose Schemas
│   └── module.schema.ts
├── events/              # Domain Events
│   ├── module.events.ts
│   └── module.event-handlers.ts
├── tests/               # Unit Tests
│   ├── module.service.spec.ts
│   ├── module.repository.spec.ts
│   └── module.controller.spec.ts
├── module.module.ts     # NestJS Module
└── index.ts             # Exports
```

## 📚 Base Classes

### BaseRepository

All repositories should extend `BaseRepository` for common CRUD operations:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/base/base.repository';
import { Product } from '../schemas/product.schema';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(@InjectModel(Product.name) productModel: Model<Product>) {
    super(productModel);
  }

  // Add custom methods here
  async findByStoreId(storeId: string): Promise<Product[]> {
    return this.findAll({ store: storeId, isDeleted: false });
  }
}
```

### Response DTOs

All API responses should use `BaseResponseDto` or `PaginatedResponseDto`:

```typescript
import { ResponseBuilder } from '../../shared/dto/base-response.dto';

// Success response
return ResponseBuilder.success('Product created successfully', product);

// Paginated response
return ResponseBuilder.paginated(
  'Products retrieved successfully',
  products,
  total,
  page,
  limit,
);

// Error response
return ResponseBuilder.error('Product not found');
```

## 🛠️ Utilities

### PaginationUtil

```typescript
import { PaginationUtil } from '../../shared/utils/pagination.util';

const { page, limit } = PaginationUtil.normalize(paginationDto);
const skip = PaginationUtil.calculateSkip(page, limit);
const result = PaginationUtil.buildResult(data, total, page, limit);
```

### FilterBuilderUtil

```typescript
import { FilterBuilderUtil } from '../../shared/utils/filter-builder.util';

// Text search
const nameFilter = FilterBuilderUtil.buildTextSearch('name', 'samsung');

// Range filter
const priceFilter = FilterBuilderUtil.buildRange('price', 100, 500);

// Date range
const dateFilter = FilterBuilderUtil.buildDateRange('createdAt', startDate, endDate);

// Merge filters
const filter = FilterBuilderUtil.mergeFilters(
  nameFilter,
  priceFilter,
  dateFilter,
  FilterBuilderUtil.buildSoftDeleteFilter(),
);
```

## 🧪 Testing

### Test Utilities

```typescript
import {
  MockRepositoryFactory,
  MockModelFactory,
  TestModuleBuilder,
  MockDataFactory,
} from '../../shared/testing/test-utils';

// Create mock repository
const mockRepository = MockRepositoryFactory.create();

// Create mock model
const mockModel = MockModelFactory.create();

// Create test module
const { module, repository, mockModel } = await TestModuleBuilder.createWithRepository(
  ProductRepository,
  'Product',
);

// Create mock data
const mockProduct = MockDataFactory.createMockProduct();
```

## 📋 Best Practices

### 1. Service Size
- Keep services under 300 lines
- Split large services into multiple smaller services
- Use composition over inheritance

### 2. Repository Pattern
- All data access should go through repositories
- Services should NOT inject Mongoose models directly
- Use BaseRepository for common operations

### 3. Response DTOs
- Always use Response DTOs to prevent data leakage
- Never return raw Mongoose documents
- Use ResponseBuilder for consistent responses

### 4. Testing
- Write unit tests for all services and repositories
- Aim for 80%+ code coverage
- Use test utilities for consistent mocking

### 5. Events
- Use events for cross-domain communication
- Keep domains loosely coupled
- Use EventEmitter2 for event handling

### 6. Validation
- Use class-validator for DTO validation
- Validate at the controller level
- Use custom validators when needed

## 🔄 Migration Guide

### From Old Structure to New Structure

1. **Create Repository**
   ```typescript
   // Old: Service injects Model directly
   constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

   // New: Service injects Repository
   constructor(private readonly productRepository: ProductRepository) {}
   ```

2. **Update Service Methods**
   ```typescript
   // Old
   const product = await this.productModel.findById(id).exec();

   // New
   const product = await this.productRepository.findById(id);
   ```

3. **Add Response DTOs**
   ```typescript
   // Old
   return product;

   // New
   return ResponseBuilder.success('Product retrieved successfully', product);
   ```

4. **Add Unit Tests**
   ```typescript
   // Create test for service
   describe('ProductService', () => {
     let service: ProductService;
     let repository: ProductRepository;

     beforeEach(async () => {
       const { module } = await TestModuleBuilder.createWithRepository(
         ProductRepository,
         'Product',
         [ProductService],
       );

       service = module.get<ProductService>(ProductService);
       repository = module.get<ProductRepository>(ProductRepository);
     });

     it('should create a product', async () => {
       const mockProduct = MockDataFactory.createMockProduct();
       jest.spyOn(repository, 'create').mockResolvedValue(mockProduct);

       const result = await service.create(createProductDto);
       expect(result).toEqual(mockProduct);
     });
   });
   ```

## 🚀 Next Steps

1. **Phase 2**: Migrate existing modules to domain structure
2. **Phase 3**: Implement Repository Pattern for all modules
3. **Phase 4**: Split large services (> 300 lines)
4. **Phase 5**: Add unit tests (80%+ coverage)
5. **Phase 6**: Cleanup and optimization

