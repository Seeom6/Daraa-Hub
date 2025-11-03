# Quick Reference Guide - New Folder Structure

**Purpose:** Quick lookup for where to put new code

---

## 🗂️ Where Do I Put...?

### New Feature/Module
```
📁 modules/[feature-name]/
├── [feature].module.ts
├── controllers/
├── services/
├── dto/
├── entities/
└── tests/
```

**Example:** Adding a "Wishlist" feature
```
modules/wishlist/
├── wishlist.module.ts
├── controllers/wishlist.controller.ts
├── services/wishlist.service.ts
├── dto/add-to-wishlist.dto.ts
├── entities/wishlist.entity.ts
└── tests/wishlist.service.spec.ts
```

---

### Database Schema
```
📁 database/schemas/[schema-name].schema.ts
```

**Example:**
```typescript
// database/schemas/wishlist.schema.ts
@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  products: Types.ObjectId[];
}
```

Then reference it in module:
```typescript
// modules/wishlist/entities/wishlist.entity.ts
export { Wishlist, WishlistDocument, WishlistSchema } from '@/database/schemas/wishlist.schema';
```

---

### Guard (Authentication/Authorization)
```
📁 common/guards/[guard-name].guard.ts
```

**Example:**
```typescript
// common/guards/ownership.guard.ts
@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Check if user owns the resource
  }
}
```

---

### Decorator
```
📁 common/decorators/[decorator-name].decorator.ts
```

**Example:**
```typescript
// common/decorators/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

---

### Interceptor
```
📁 common/interceptors/[interceptor-name].interceptor.ts
```

**Example:**
```typescript
// common/interceptors/timeout.interceptor.ts
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(timeout(5000));
  }
}
```

---

### Pipe
```
📁 common/pipes/[pipe-name].pipe.ts
```

**Example:**
```typescript
// common/pipes/parse-object-id.pipe.ts
@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid ID');
    }
    return new Types.ObjectId(value);
  }
}
```

---

### Filter (Exception Handler)
```
📁 common/filters/[filter-name].filter.ts
```

**Example:**
```typescript
// common/filters/validation-exception.filter.ts
@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    // Handle validation errors
  }
}
```

---

### Constant
```
📁 common/constants/[constant-name].constant.ts
```

**Example:**
```typescript
// common/constants/order-status.constant.ts
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;
```

---

### Enum
```
📁 common/enums/[enum-name].enum.ts
```

**Example:**
```typescript
// common/enums/payment-method.enum.ts
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  WALLET = 'wallet',
}
```

---

### Interface
```
📁 common/interfaces/[interface-name].interface.ts
```

**Example:**
```typescript
// common/interfaces/paginated-result.interface.ts
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

### Shared DTO
```
📁 common/dto/[dto-name].dto.ts
```

**Example:**
```typescript
// common/dto/date-range.dto.ts
export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
```

---

### Utility Function
```
📁 common/utils/[util-name].util.ts
```

**Example:**
```typescript
// common/utils/pagination.util.ts
export function calculatePagination(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    limit,
  };
}
```

---

### External Service Integration
```
📁 infrastructure/[service-name]/
├── [service].module.ts
├── [service].service.ts
├── [service].interface.ts
└── providers/
    ├── [provider1].provider.ts
    └── [provider2].provider.ts
```

**Example:** Adding Stripe payment
```
infrastructure/payment/
├── payment.module.ts
├── payment.service.ts
├── payment.interface.ts
└── providers/
    ├── stripe.provider.ts
    ├── tap.provider.ts
    └── mock.provider.ts
```

---

### Configuration
```
📁 config/[config-name].config.ts
```

**Example:**
```typescript
// config/payment.config.ts
export default registerAs('payment', () => ({
  stripe: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  tap: {
    apiKey: process.env.TAP_API_KEY,
  },
}));
```

---

### Core Service (Singleton)
```
📁 core/[service-name]/
├── [service].module.ts
└── [service].service.ts
```

**Example:**
```
core/logger/
├── logger.module.ts
├── logger.service.ts
└── winston.config.ts
```

---

## 📝 Import Patterns

### From Database
```typescript
import { Product, ProductSchema } from '@/database/schemas';
```

### From Common
```typescript
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';
import { PaginationDto } from '@/common/dto';
import { UserRole } from '@/common/enums';
```

### From Infrastructure
```typescript
import { SmsModule } from '@/infrastructure/sms/sms.module';
import { StorageService } from '@/infrastructure/storage/storage.service';
```

### From Other Modules
```typescript
import { AccountModule } from '@/modules/account/account.module';
import { ProductService } from '@/modules/product/services/product.service';
```

---

## 🎯 Module Template

When creating a new module, follow this template:

```typescript
// modules/[feature]/[feature].module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FeatureController } from './controllers/feature.controller';
import { FeatureService } from './services/feature.service';
import { Feature, FeatureSchema } from './entities/feature.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feature.name, schema: FeatureSchema },
    ]),
    // Other module dependencies
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService], // Export if other modules need it
})
export class FeatureModule {}
```

---

## 🔍 Finding Files

### By Type
- **Controllers:** `modules/*/controllers/*.controller.ts`
- **Services:** `modules/*/services/*.service.ts`
- **DTOs:** `modules/*/dto/*.dto.ts` or `common/dto/*.dto.ts`
- **Schemas:** `database/schemas/*.schema.ts`
- **Guards:** `common/guards/*.guard.ts`
- **Tests:** `modules/*/tests/*.spec.ts`

### By Feature
All files for a feature are in: `modules/[feature]/`

---

## ✅ Checklist for New Feature

When adding a new feature:

- [ ] Create module folder: `modules/[feature]/`
- [ ] Create module file: `[feature].module.ts`
- [ ] Create controller: `controllers/[feature].controller.ts`
- [ ] Create service: `services/[feature].service.ts`
- [ ] Create DTOs: `dto/create-[feature].dto.ts`, `dto/update-[feature].dto.ts`
- [ ] Create schema: `database/schemas/[feature].schema.ts`
- [ ] Create entity reference: `entities/[feature].entity.ts`
- [ ] Add to app.module.ts imports
- [ ] Create tests: `tests/[feature].service.spec.ts`
- [ ] Update documentation

---

## 🚫 Common Mistakes to Avoid

### ❌ Don't Do This
```typescript
// Don't use relative paths
import { Product } from '../../../database/schemas/product.schema';

// Don't put business logic in controllers
@Controller('products')
export class ProductController {
  @Get()
  async findAll() {
    // ❌ Business logic here
    const products = await this.productModel.find();
    return products;
  }
}

// Don't create circular dependencies
// Module A imports Module B
// Module B imports Module A
```

### ✅ Do This Instead
```typescript
// Use path aliases
import { Product } from '@/database/schemas';

// Put business logic in services
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async findAll() {
    return this.productService.findAll();
  }
}

// Use forwardRef() for circular dependencies (or better, refactor)
@Module({
  imports: [forwardRef(() => ModuleB)],
})
```

---

## 📚 Additional Resources

- **PROPOSED_FOLDER_STRUCTURE.md** - Complete structure explanation
- **MIGRATION_PLAN.md** - Step-by-step migration guide
- **REFACTORING_SUMMARY.md** - Executive summary
- **NestJS Documentation** - https://docs.nestjs.com

---

**Questions?** Refer to the detailed documentation or ask!

