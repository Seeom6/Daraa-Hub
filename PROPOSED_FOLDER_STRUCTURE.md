# Proposed Enterprise-Grade Folder Structure for Daraa E-commerce

**Date:** November 3, 2025  
**Purpose:** Scalable, maintainable architecture for large-scale e-commerce application  
**Status:** 📋 PROPOSAL - Awaiting Approval

---

## Table of Contents
1. [Current Structure Analysis](#current-structure-analysis)
2. [Proposed New Structure](#proposed-new-structure)
3. [Detailed Folder Explanations](#detailed-folder-explanations)
4. [Migration Strategy](#migration-strategy)
5. [Naming Conventions](#naming-conventions)
6. [Best Practices](#best-practices)

---

## Current Structure Analysis

### ✅ What's Working Well

1. **Modular Organization** - Auth and Account modules are well-separated
2. **DTOs Separation** - Each module has its own DTOs
3. **Schema Organization** - Schemas are grouped within modules
4. **Common Folder** - Started organizing shared code (filters, interceptors)
5. **Config Separation** - Configuration is separated from business logic

### ⚠️ What Needs Improvement

1. **Users Module Redundancy** - Overlaps with Account module (should be merged or removed)
2. **Flat Module Structure** - No clear separation between feature modules, core modules, and shared modules
3. **Schema Organization** - All schemas in one folder per module (will become messy with growth)
4. **Missing Infrastructure** - No clear place for database, cache, queue, email, etc.
5. **No Domain Separation** - Auth concerns mixed with account management
6. **Missing Testing Structure** - No clear test organization
7. **No Constants/Enums** - Magic strings scattered in code
8. **No Shared Types** - Type definitions not centralized

### 🚨 Critical Issues

1. **Users module** duplicates Account functionality
2. **OTP schema** in auth module (should be in infrastructure/cache)
3. **SMS module** is infrastructure but treated as feature module
4. **No clear separation** between business logic and infrastructure

---

## Proposed New Structure

```
server/src/
│
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── app.controller.ts                # Health check endpoint
├── app.service.ts                   # App-level services
│
├── core/                            # Core module (singleton services, global setup)
│   ├── core.module.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   ├── database.service.ts
│   │   └── database.providers.ts
│   ├── cache/
│   │   ├── cache.module.ts
│   │   ├── cache.service.ts
│   │   └── redis.provider.ts
│   ├── logger/
│   │   ├── logger.module.ts
│   │   ├── logger.service.ts
│   │   └── winston.config.ts
│   └── security/
│       ├── encryption.service.ts
│       ├── hashing.service.ts
│       └── security.module.ts
│
├── config/                          # Configuration management
│   ├── configuration.ts             # Main config loader
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   ├── sms.config.ts
│   ├── email.config.ts
│   ├── payment.config.ts
│   └── validation.schema.ts         # Joi validation for env vars
│
├── common/                          # Shared utilities, decorators, guards, etc.
│   ├── constants/
│   │   ├── index.ts
│   │   ├── roles.constant.ts
│   │   ├── order-status.constant.ts
│   │   ├── payment-status.constant.ts
│   │   └── error-codes.constant.ts
│   ├── enums/
│   │   ├── index.ts
│   │   ├── user-role.enum.ts
│   │   ├── order-status.enum.ts
│   │   ├── payment-method.enum.ts
│   │   └── delivery-status.enum.ts
│   ├── decorators/
│   │   ├── index.ts
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── api-paginated-response.decorator.ts
│   ├── guards/
│   │   ├── index.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── throttle.guard.ts
│   │   └── ownership.guard.ts
│   ├── interceptors/
│   │   ├── index.ts
│   │   ├── logging.interceptor.ts
│   │   ├── transform.interceptor.ts
│   │   ├── timeout.interceptor.ts
│   │   └── cache.interceptor.ts
│   ├── filters/
│   │   ├── index.ts
│   │   ├── http-exception.filter.ts
│   │   ├── validation-exception.filter.ts
│   │   └── all-exceptions.filter.ts
│   ├── pipes/
│   │   ├── index.ts
│   │   ├── validation.pipe.ts
│   │   ├── parse-object-id.pipe.ts
│   │   └── trim.pipe.ts
│   ├── middlewares/
│   │   ├── index.ts
│   │   ├── logger.middleware.ts
│   │   ├── correlation-id.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── interfaces/
│   │   ├── index.ts
│   │   ├── paginated-result.interface.ts
│   │   ├── jwt-payload.interface.ts
│   │   ├── request-with-user.interface.ts
│   │   └── api-response.interface.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── location.type.ts
│   │   └── file-upload.type.ts
│   ├── dto/
│   │   ├── index.ts
│   │   ├── pagination.dto.ts
│   │   ├── id-param.dto.ts
│   │   └── date-range.dto.ts
│   └── utils/
│       ├── index.ts
│       ├── pagination.util.ts
│       ├── date.util.ts
│       ├── string.util.ts
│       └── validation.util.ts
│
├── infrastructure/                  # External services and integrations
│   ├── sms/
│   │   ├── sms.module.ts
│   │   ├── sms.service.ts
│   │   ├── sms.interface.ts
│   │   └── providers/
│   │       ├── twilio.provider.ts
│   │       └── mock.provider.ts
│   ├── email/
│   │   ├── email.module.ts
│   │   ├── email.service.ts
│   │   ├── email.interface.ts
│   │   ├── templates/
│   │   │   ├── welcome.template.ts
│   │   │   ├── otp.template.ts
│   │   │   └── order-confirmation.template.ts
│   │   └── providers/
│   │       ├── sendgrid.provider.ts
│   │       └── mock.provider.ts
│   ├── storage/
│   │   ├── storage.module.ts
│   │   ├── storage.service.ts
│   │   ├── storage.interface.ts
│   │   └── providers/
│   │       ├── s3.provider.ts
│   │       ├── cloudinary.provider.ts
│   │       └── local.provider.ts
│   ├── payment/
│   │   ├── payment.module.ts
│   │   ├── payment.service.ts
│   │   ├── payment.interface.ts
│   │   └── providers/
│   │       ├── stripe.provider.ts
│   │       ├── tap.provider.ts
│   │       └── mock.provider.ts
│   ├── notification/
│   │   ├── notification.module.ts
│   │   ├── notification.service.ts
│   │   ├── notification.interface.ts
│   │   └── providers/
│   │       ├── fcm.provider.ts
│   │       ├── onesignal.provider.ts
│   │       └── mock.provider.ts
│   └── queue/
│       ├── queue.module.ts
│       ├── queue.service.ts
│       └── processors/
│           ├── email.processor.ts
│           ├── notification.processor.ts
│           └── order.processor.ts
│
├── modules/                         # Feature modules (business logic)
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── otp.service.ts
│   │   │   └── token.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── refresh-token.strategy.ts
│   │   ├── dto/
│   │   │   ├── register-step1.dto.ts
│   │   │   ├── verify-otp.dto.ts
│   │   │   ├── complete-profile.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── forgot-password.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   ├── entities/
│   │   │   ├── otp.entity.ts
│   │   │   └── session.entity.ts
│   │   └── tests/
│   │       ├── auth.controller.spec.ts
│   │       └── auth.service.spec.ts
│   │
│   ├── account/
│   │   ├── account.module.ts
│   │   ├── controllers/
│   │   │   └── account.controller.ts
│   │   ├── services/
│   │   │   ├── account.service.ts
│   │   │   └── profile.service.ts
│   │   ├── dto/
│   │   │   ├── update-account.dto.ts
│   │   │   ├── upgrade-role.dto.ts
│   │   │   └── update-profile.dto.ts
│   │   ├── entities/
│   │   │   ├── account.entity.ts
│   │   │   ├── security-profile.entity.ts
│   │   │   ├── customer-profile.entity.ts
│   │   │   ├── store-owner-profile.entity.ts
│   │   │   └── courier-profile.entity.ts
│   │   └── tests/
│   │       ├── account.controller.spec.ts
│   │       └── account.service.spec.ts
│   │
│   ├── product/
│   │   ├── product.module.ts
│   │   ├── controllers/
│   │   │   ├── product.controller.ts
│   │   │   └── category.controller.ts
│   │   ├── services/
│   │   │   ├── product.service.ts
│   │   │   ├── category.service.ts
│   │   │   └── inventory.service.ts
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   ├── filter-product.dto.ts
│   │   │   └── create-category.dto.ts
│   │   ├── entities/
│   │   │   ├── product.entity.ts
│   │   │   ├── category.entity.ts
│   │   │   ├── variant.entity.ts
│   │   │   └── inventory.entity.ts
│   │   └── tests/
│   │
│   ├── order/
│   │   ├── order.module.ts
│   │   ├── controllers/
│   │   │   ├── order.controller.ts
│   │   │   └── cart.controller.ts
│   │   ├── services/
│   │   │   ├── order.service.ts
│   │   │   ├── cart.service.ts
│   │   │   └── order-tracking.service.ts
│   │   ├── dto/
│   │   │   ├── create-order.dto.ts
│   │   │   ├── update-order.dto.ts
│   │   │   ├── add-to-cart.dto.ts
│   │   │   └── checkout.dto.ts
│   │   ├── entities/
│   │   │   ├── order.entity.ts
│   │   │   ├── order-item.entity.ts
│   │   │   ├── cart.entity.ts
│   │   │   └── cart-item.entity.ts
│   │   └── tests/
│   │
│   ├── delivery/
│   │   ├── delivery.module.ts
│   │   ├── controllers/
│   │   │   └── delivery.controller.ts
│   │   ├── services/
│   │   │   ├── delivery.service.ts
│   │   │   ├── tracking.service.ts
│   │   │   └── assignment.service.ts
│   │   ├── dto/
│   │   │   ├── create-delivery.dto.ts
│   │   │   ├── update-delivery-status.dto.ts
│   │   │   └── update-location.dto.ts
│   │   ├── entities/
│   │   │   ├── delivery.entity.ts
│   │   │   └── delivery-tracking.entity.ts
│   │   └── tests/
│   │
│   ├── store/
│   │   ├── store.module.ts
│   │   ├── controllers/
│   │   │   └── store.controller.ts
│   │   ├── services/
│   │   │   ├── store.service.ts
│   │   │   └── store-analytics.service.ts
│   │   ├── dto/
│   │   │   ├── create-store.dto.ts
│   │   │   ├── update-store.dto.ts
│   │   │   └── store-settings.dto.ts
│   │   ├── entities/
│   │   │   ├── store.entity.ts
│   │   │   └── store-settings.entity.ts
│   │   └── tests/
│   │
│   ├── review/
│   │   ├── review.module.ts
│   │   ├── controllers/
│   │   │   └── review.controller.ts
│   │   ├── services/
│   │   │   └── review.service.ts
│   │   ├── dto/
│   │   │   ├── create-review.dto.ts
│   │   │   └── update-review.dto.ts
│   │   ├── entities/
│   │   │   └── review.entity.ts
│   │   └── tests/
│   │
│   ├── address/
│   │   ├── address.module.ts
│   │   ├── controllers/
│   │   │   └── address.controller.ts
│   │   ├── services/
│   │   │   └── address.service.ts
│   │   ├── dto/
│   │   │   ├── create-address.dto.ts
│   │   │   └── update-address.dto.ts
│   │   ├── entities/
│   │   │   └── address.entity.ts
│   │   └── tests/
│   │
│   └── admin/
│       ├── admin.module.ts
│       ├── controllers/
│       │   ├── admin-user.controller.ts
│       │   ├── admin-order.controller.ts
│       │   ├── admin-store.controller.ts
│       │   └── admin-analytics.controller.ts
│       ├── services/
│       │   ├── admin-user.service.ts
│       │   ├── admin-order.service.ts
│       │   ├── admin-store.service.ts
│       │   └── admin-analytics.service.ts
│       ├── dto/
│       └── tests/
│
└── database/                        # Database schemas and migrations
    ├── schemas/
    │   ├── index.ts                 # Export all schemas
    │   ├── account.schema.ts
    │   ├── security-profile.schema.ts
    │   ├── customer-profile.schema.ts
    │   ├── store-owner-profile.schema.ts
    │   ├── courier-profile.schema.ts
    │   ├── product.schema.ts
    │   ├── category.schema.ts
    │   ├── order.schema.ts
    │   ├── order-item.schema.ts
    │   ├── delivery.schema.ts
    │   ├── review.schema.ts
    │   ├── address.schema.ts
    │   ├── cart.schema.ts
    │   └── session.schema.ts
    ├── migrations/                  # Database migrations (if needed)
    │   └── .gitkeep
    └── seeders/                     # Database seeders
        ├── admin.seeder.ts
        ├── categories.seeder.ts
        └── test-data.seeder.ts
```

---

## Key Architectural Decisions

### 1. **Three-Layer Architecture**

```
┌─────────────────────────────────────────┐
│           PRESENTATION LAYER            │
│  (Controllers, DTOs, Guards, Pipes)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          BUSINESS LOGIC LAYER           │
│     (Services, Domain Logic, Use Cases) │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           DATA ACCESS LAYER             │
│  (Repositories, Schemas, Database)      │
└─────────────────────────────────────────┘
```

### 2. **Module Categories**

- **Core Modules** (`core/`) - Singleton services, loaded once
- **Infrastructure Modules** (`infrastructure/`) - External integrations
- **Feature Modules** (`modules/`) - Business logic, lazy-loaded
- **Shared Modules** (`common/`) - Reusable across features

### 3. **Separation of Concerns**

- **Entities** (formerly schemas) - Database models
- **DTOs** - Data transfer objects for API
- **Services** - Business logic
- **Controllers** - HTTP request handling
- **Tests** - Co-located with features

---

## Benefits of This Structure

### ✅ Scalability
- Easy to add new features without affecting existing code
- Clear boundaries between modules
- Supports microservices migration if needed

### ✅ Maintainability
- Consistent structure across all modules
- Easy to find files (predictable locations)
- Clear separation of concerns

### ✅ Testability
- Tests co-located with code
- Easy to mock dependencies
- Clear interfaces between layers

### ✅ Team Collaboration
- Multiple developers can work on different modules
- Reduced merge conflicts
- Clear ownership of modules

### ✅ Performance
- Lazy loading of feature modules
- Shared modules loaded once
- Optimized imports

---

---

## Detailed Folder Explanations

### 📁 `core/` - Core Infrastructure

**Purpose:** Singleton services that are instantiated once and shared globally.

**Contents:**
- **database/** - MongoDB connection, connection pooling
- **cache/** - Redis connection and caching strategies
- **logger/** - Winston logger configuration
- **security/** - Encryption, hashing utilities

**When to use:**
- Services needed by multiple modules
- Infrastructure that should be initialized once
- Global configuration

**Example:**
```typescript
// core/database/database.module.ts
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

---

### 📁 `config/` - Configuration Management

**Purpose:** Centralized configuration with type safety and validation.

**Contents:**
- Environment-specific configurations
- Joi validation schemas
- Type-safe config interfaces

**Best Practices:**
```typescript
// config/database.config.ts
export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI,
  options: {
    maxPoolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 10,
  },
}));

// config/validation.schema.ts
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test'),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
});
```

---

### 📁 `common/` - Shared Code

**Purpose:** Reusable code shared across multiple modules.

**Key Subdirectories:**

#### `constants/`
- Immutable values used across the app
- Error codes, status codes, default values
```typescript
// common/constants/roles.constant.ts
export const ROLES = {
  CUSTOMER: 'customer',
  STORE_OWNER: 'store_owner',
  COURIER: 'courier',
  ADMIN: 'admin',
} as const;
```

#### `enums/`
- TypeScript enums for type safety
```typescript
// common/enums/order-status.enum.ts
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}
```

#### `decorators/`
- Custom decorators for controllers and routes
```typescript
// common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

#### `guards/`
- Authentication and authorization guards
```typescript
// common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Check user roles
  }
}
```

#### `interceptors/`
- Request/response transformation
```typescript
// common/interceptors/transform.interceptor.ts
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(data => ({ success: true, data }))
    );
  }
}
```

#### `pipes/`
- Data validation and transformation
```typescript
// common/pipes/parse-object-id.pipe.ts
@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid ObjectId');
    }
    return new Types.ObjectId(value);
  }
}
```

#### `interfaces/`
- TypeScript interfaces for type safety
```typescript
// common/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
  iat?: number;
  exp?: number;
}
```

#### `dto/`
- Shared DTOs used across modules
```typescript
// common/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
```

---

### 📁 `infrastructure/` - External Services

**Purpose:** Abstraction layer for external services and integrations.

**Key Principles:**
1. **Interface-based** - Define interfaces for each service
2. **Provider pattern** - Multiple implementations (Twilio, SendGrid, Mock)
3. **Dependency injection** - Easy to swap providers

**Example Structure:**
```typescript
// infrastructure/sms/sms.interface.ts
export interface ISmsService {
  sendOtp(phone: string, code: string): Promise<void>;
  sendMessage(phone: string, message: string): Promise<void>;
}

// infrastructure/sms/providers/twilio.provider.ts
@Injectable()
export class TwilioSmsProvider implements ISmsService {
  async sendOtp(phone: string, code: string): Promise<void> {
    // Twilio implementation
  }
}

// infrastructure/sms/providers/mock.provider.ts
@Injectable()
export class MockSmsProvider implements ISmsService {
  async sendOtp(phone: string, code: string): Promise<void> {
    console.log(`Mock SMS to ${phone}: ${code}`);
  }
}

// infrastructure/sms/sms.module.ts
@Module({
  providers: [
    {
      provide: 'SMS_SERVICE',
      useClass: process.env.NODE_ENV === 'production'
        ? TwilioSmsProvider
        : MockSmsProvider,
    },
  ],
  exports: ['SMS_SERVICE'],
})
export class SmsModule {}
```

**Benefits:**
- Easy to test (use mock providers)
- Easy to switch providers
- Clear separation from business logic

---

### 📁 `modules/` - Feature Modules

**Purpose:** Business logic organized by domain/feature.

**Standard Module Structure:**
```
modules/[feature]/
├── [feature].module.ts          # Module definition
├── controllers/                 # HTTP endpoints
│   └── [feature].controller.ts
├── services/                    # Business logic
│   └── [feature].service.ts
├── dto/                         # Data transfer objects
│   ├── create-[feature].dto.ts
│   └── update-[feature].dto.ts
├── entities/                    # Database models (references to schemas)
│   └── [feature].entity.ts
└── tests/                       # Unit and integration tests
    ├── [feature].controller.spec.ts
    └── [feature].service.spec.ts
```

**Module Organization Principles:**

1. **Single Responsibility** - Each module handles one domain
2. **Loose Coupling** - Modules communicate through well-defined interfaces
3. **High Cohesion** - Related functionality grouped together

**Example Module:**
```typescript
// modules/product/product.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    StorageModule, // Infrastructure dependency
  ],
  controllers: [ProductController, CategoryController],
  providers: [ProductService, CategoryService, InventoryService],
  exports: [ProductService], // Export for other modules
})
export class ProductModule {}
```

---

### 📁 `database/` - Database Layer

**Purpose:** Centralized database schemas and migrations.

**Why Separate from Modules?**
1. **Single Source of Truth** - All schemas in one place
2. **Easier Migrations** - Clear view of all database changes
3. **Relationship Management** - Easy to see all relationships
4. **Reusability** - Schemas can be used by multiple modules

**Structure:**
```typescript
// database/schemas/product.schema.ts
@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Store', required: true })
  storeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ name: 'text' });
ProductSchema.index({ storeId: 1, isActive: 1 });
ProductSchema.index({ categoryId: 1 });

// database/schemas/index.ts
export * from './account.schema';
export * from './product.schema';
export * from './order.schema';
// ... all schemas
```

**Entity Pattern in Modules:**
```typescript
// modules/product/entities/product.entity.ts
import { Product, ProductDocument } from '@/database/schemas';

export { Product, ProductDocument };

// This allows modules to import entities without knowing schema details
```

---

## Migration Strategy

### Phase 1: Preparation (30 minutes)

1. **Create new folder structure** (empty folders)
2. **Create index files** for exports
3. **Backup current code** (git commit)

### Phase 2: Move Common Code (1 hour)

1. **Move guards** from `auth/guards` to `common/guards`
2. **Move interceptors** from `common/interceptors` (already there)
3. **Move filters** from `common/filters` (already there)
4. **Create constants and enums** from magic strings in code

### Phase 3: Move Infrastructure (1 hour)

1. **Move SMS module** to `infrastructure/sms`
2. **Create email module** in `infrastructure/email`
3. **Create storage module** in `infrastructure/storage`
4. **Update imports** in dependent modules

### Phase 4: Reorganize Feature Modules (2 hours)

1. **Merge Users into Account** module
2. **Restructure Auth module** with controllers/services/dto/entities
3. **Restructure Account module** with controllers/services/dto/entities
4. **Move schemas** to `database/schemas`
5. **Update all imports**

### Phase 5: Create Core Modules (30 minutes)

1. **Create database module** in `core/database`
2. **Create logger module** in `core/logger`
3. **Update app.module.ts** to use core modules

### Phase 6: Testing & Validation (1 hour)

1. **Run build** - Fix any import errors
2. **Run tests** - Ensure nothing broke
3. **Test API endpoints** - Verify functionality
4. **Update documentation**

---

## Naming Conventions

### Files
- **Modules:** `[feature].module.ts`
- **Controllers:** `[feature].controller.ts`
- **Services:** `[feature].service.ts`
- **DTOs:** `[action]-[feature].dto.ts` (e.g., `create-product.dto.ts`)
- **Schemas:** `[feature].schema.ts`
- **Entities:** `[feature].entity.ts`
- **Interfaces:** `[name].interface.ts`
- **Enums:** `[name].enum.ts`
- **Constants:** `[name].constant.ts`
- **Guards:** `[name].guard.ts`
- **Interceptors:** `[name].interceptor.ts`
- **Pipes:** `[name].pipe.ts`
- **Decorators:** `[name].decorator.ts`

### Classes
- **PascalCase** for all classes
- **Suffix with type:** `ProductService`, `CreateProductDto`, `ProductSchema`

### Variables & Functions
- **camelCase** for variables and functions
- **Descriptive names:** `findProductById`, `calculateTotalPrice`

### Constants
- **UPPER_SNAKE_CASE** for constants
- **Group related constants:** `ORDER_STATUS`, `PAYMENT_METHODS`

---

## Best Practices

### 1. Module Organization

✅ **DO:**
- Keep modules focused on single domain
- Export only what's needed by other modules
- Use barrel exports (`index.ts`) for clean imports

❌ **DON'T:**
- Create circular dependencies between modules
- Export internal implementation details
- Mix business logic with infrastructure

### 2. Dependency Injection

✅ **DO:**
```typescript
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly storageService: StorageService,
  ) {}
}
```

❌ **DON'T:**
```typescript
// Don't import services directly
import { StorageService } from '../../../infrastructure/storage/storage.service';
const storageService = new StorageService(); // ❌
```

### 3. DTOs and Validation

✅ **DO:**
```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}
```

❌ **DON'T:**
```typescript
// Don't skip validation
export class CreateProductDto {
  name: string; // ❌ No validation
  price: number; // ❌ No validation
}
```

### 4. Error Handling

✅ **DO:**
```typescript
async findById(id: string): Promise<Product> {
  const product = await this.productModel.findById(id);
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }
  return product;
}
```

### 5. Imports

✅ **DO:**
```typescript
// Use path aliases
import { Product } from '@/database/schemas';
import { PaginationDto } from '@/common/dto';
import { CurrentUser } from '@/common/decorators';
```

❌ **DON'T:**
```typescript
// Avoid relative paths
import { Product } from '../../../database/schemas/product.schema';
```

**Configure path aliases in `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@/common/*": ["src/common/*"],
      "@/modules/*": ["src/modules/*"],
      "@/database/*": ["src/database/*"],
      "@/infrastructure/*": ["src/infrastructure/*"],
      "@/config/*": ["src/config/*"],
      "@/core/*": ["src/core/*"]
    }
  }
}
```

---

**Next Steps:**
1. ✅ Review and approve this structure
2. ⏳ Create detailed migration plan
3. ⏳ Execute migration in phases
4. ⏳ Update documentation

**Estimated Migration Time:** 4-6 hours (with careful planning)

