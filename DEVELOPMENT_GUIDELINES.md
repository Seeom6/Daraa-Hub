# 🎯 Daraa Platform - Development Guidelines & Best Practices

## 📋 Table of Contents
1. [Code Standards](#code-standards)
2. [Architecture Patterns](#architecture-patterns)
3. [Database Best Practices](#database-best-practices)
4. [API Design Guidelines](#api-design-guidelines)
5. [Error Handling](#error-handling)
6. [Security Best Practices](#security-best-practices)
7. [Performance Optimization](#performance-optimization)
8. [Testing Standards](#testing-standards)
9. [Git Workflow](#git-workflow)
10. [Documentation](#documentation)

---

## 💻 Code Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true
  }
}
```

### Naming Conventions

#### Files & Folders
```
✅ Good:
- user.service.ts
- create-user.dto.ts
- user.controller.spec.ts
- auth/

❌ Bad:
- UserService.ts
- createUserDTO.ts
- user_controller.spec.ts
- Auth/
```

#### Classes & Interfaces
```typescript
✅ Good:
class UserService {}
interface CreateUserDto {}
enum UserRole {}

❌ Bad:
class userService {}
interface createUserDto {}
enum userRole {}
```

#### Variables & Functions
```typescript
✅ Good:
const userId = '123';
function getUserById(id: string) {}
const isUserActive = true;

❌ Bad:
const UserId = '123';
function GetUserById(id: string) {}
const is_user_active = true;
```

### Code Organization

#### Module Structure
```
module-name/
├── controllers/
│   ├── module-name.controller.ts
│   └── module-name.controller.spec.ts
├── services/
│   ├── module-name.service.ts
│   └── module-name.service.spec.ts
├── repositories/
│   └── module-name.repository.ts
├── dto/
│   ├── request/
│   │   ├── create-module-name.dto.ts
│   │   └── update-module-name.dto.ts
│   └── response/
│       └── module-name-response.dto.ts
├── entities/
│   └── module-name.entity.ts
├── interfaces/
│   └── module-name.interface.ts
├── guards/
│   └── module-name.guard.ts
├── decorators/
│   └── module-name.decorator.ts
├── events/
│   ├── handlers/
│   │   └── module-name-created.handler.ts
│   └── module-name.events.ts
├── jobs/
│   └── module-name.job.ts
├── validators/
│   └── module-name.validator.ts
├── constants/
│   └── module-name.constants.ts
└── module-name.module.ts
```

---

## 🏗️ Architecture Patterns

### 1. Repository Pattern

**Why?** Separates data access logic from business logic.

```typescript
// ❌ Bad: Service directly uses Model
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  
  async findById(id: string) {
    return this.userModel.findById(id);
  }
}

// ✅ Good: Service uses Repository
@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
  
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  
  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
```

### 2. Event-Driven Architecture

**Why?** Decouples modules and enables async processing.

```typescript
// events/order-created.event.ts
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: number,
  ) {}
}

// services/order.service.ts
@Injectable()
export class OrderService {
  constructor(private eventEmitter: EventEmitter2) {}
  
  async createOrder(data: CreateOrderDto) {
    const order = await this.orderRepository.create(data);
    
    // Emit event
    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(order.id, order.customerId, order.total),
    );
    
    return order;
  }
}

// events/handlers/order-created.handler.ts
@Injectable()
export class OrderCreatedHandler {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly pointsService: PointsService,
  ) {}
  
  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    // Send notification
    await this.notificationService.sendOrderConfirmation(event.orderId);
    
    // Award points
    await this.pointsService.awardPoints(event.customerId, event.total);
  }
}
```

### 3. Background Jobs (Bull Queue)

**Why?** Offload heavy tasks from request-response cycle.

```typescript
// jobs/email.job.ts
@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  
  @Process('send-order-confirmation')
  async sendOrderConfirmation(job: Job<{ orderId: string }>) {
    this.logger.log(`Processing email job for order: ${job.data.orderId}`);
    
    try {
      // Send email
      await this.emailService.sendOrderConfirmation(job.data.orderId);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error; // Will retry based on job config
    }
  }
}

// services/order.service.ts
@Injectable()
export class OrderService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
  ) {}
  
  async createOrder(data: CreateOrderDto) {
    const order = await this.orderRepository.create(data);
    
    // Add to queue (non-blocking)
    await this.emailQueue.add('send-order-confirmation', {
      orderId: order.id,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    
    return order;
  }
}
```

### 4. CQRS Pattern (for complex modules)

**Why?** Separates read and write operations for better scalability.

```typescript
// commands/create-order.command.ts
export class CreateOrderCommand {
  constructor(public readonly data: CreateOrderDto) {}
}

// commands/handlers/create-order.handler.ts
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(private readonly orderRepository: OrderRepository) {}
  
  async execute(command: CreateOrderCommand): Promise<Order> {
    return this.orderRepository.create(command.data);
  }
}

// queries/get-order.query.ts
export class GetOrderQuery {
  constructor(public readonly orderId: string) {}
}

// queries/handlers/get-order.handler.ts
@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery> {
  constructor(private readonly orderRepository: OrderRepository) {}
  
  async execute(query: GetOrderQuery): Promise<Order> {
    return this.orderRepository.findById(query.orderId);
  }
}
```

---

## 🗄️ Database Best Practices

### 1. Indexing Strategy

```typescript
// ✅ Good: Proper indexing
@Schema()
export class Product {
  @Prop({ required: true, index: true })  // Single field index
  storeId: ObjectId;
  
  @Prop({ required: true })
  name: string;
  
  @Prop({ required: true })
  price: number;
}

// Compound indexes
ProductSchema.index({ storeId: 1, status: 1 });
ProductSchema.index({ categoryId: 1, price: 1 });

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Geospatial index
ProductSchema.index({ location: '2dsphere' });

// TTL index for auto-deletion
ProductSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 2. Query Optimization

```typescript
// ❌ Bad: N+1 query problem
async getOrdersWithProducts(userId: string) {
  const orders = await this.orderModel.find({ userId });
  
  for (const order of orders) {
    order.products = await this.productModel.find({ 
      _id: { $in: order.productIds } 
    });
  }
  
  return orders;
}

// ✅ Good: Use populate
async getOrdersWithProducts(userId: string) {
  return this.orderModel
    .find({ userId })
    .populate('products')
    .exec();
}

// ✅ Better: Use aggregation for complex queries
async getOrdersWithProducts(userId: string) {
  return this.orderModel.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'products',
        localField: 'productIds',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $project: {
        orderNumber: 1,
        total: 1,
        products: { name: 1, price: 1, image: 1 },
      },
    },
  ]);
}
```

### 3. Pagination

```typescript
// ✅ Good: Cursor-based pagination for large datasets
interface PaginationOptions {
  limit: number;
  cursor?: string;  // Last document ID
}

async findWithPagination(options: PaginationOptions) {
  const query = options.cursor 
    ? { _id: { $gt: new Types.ObjectId(options.cursor) } }
    : {};
  
  const items = await this.model
    .find(query)
    .limit(options.limit + 1)  // Fetch one extra to check if there's more
    .sort({ _id: 1 })
    .exec();
  
  const hasMore = items.length > options.limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length - 1]._id.toString() : null;
  
  return {
    data,
    pagination: {
      nextCursor,
      hasMore,
    },
  };
}
```

### 4. Transactions

```typescript
// ✅ Good: Use transactions for multi-document operations
async createOrderWithInventoryUpdate(orderData: CreateOrderDto) {
  const session = await this.connection.startSession();
  session.startTransaction();
  
  try {
    // Create order
    const order = await this.orderModel.create([orderData], { session });
    
    // Update inventory
    for (const item of orderData.items) {
      await this.inventoryModel.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { quantity: -item.quantity, reservedQuantity: -item.quantity } },
        { session },
      );
    }
    
    await session.commitTransaction();
    return order[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## 🌐 API Design Guidelines

### 1. RESTful Endpoints

```typescript
// ✅ Good: RESTful design
GET    /api/products              // List products
GET    /api/products/:id          // Get product
POST   /api/products              // Create product
PUT    /api/products/:id          // Update product (full)
PATCH  /api/products/:id          // Update product (partial)
DELETE /api/products/:id          // Delete product

// Nested resources
GET    /api/stores/:id/products   // Get store's products
POST   /api/stores/:id/products   // Create product for store

// Actions
POST   /api/orders/:id/cancel     // Cancel order
POST   /api/orders/:id/confirm    // Confirm order

// ❌ Bad: Non-RESTful
GET    /api/getProducts
POST   /api/createProduct
GET    /api/product/delete/:id
```

### 2. Response Format

```typescript
// ✅ Good: Consistent response format
export class ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Success response
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Product Name"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 123 not found",
    "details": {
      "productId": "123"
    }
  }
}

// Paginated response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 3. DTOs & Validation

```typescript
// ✅ Good: Comprehensive validation
export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;
  
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;
  
  @IsNotEmpty()
  @IsMongoId()
  categoryId: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
  
  @IsOptional()
  @IsUrl()
  image?: string;
  
  // Custom validation
  @Validate(PriceComparisonValidator)
  priceComparison?: any;
}

// Custom validator
@ValidatorConstraint({ name: 'priceComparison', async: false })
export class PriceComparisonValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const dto = args.object as CreateProductDto;
    if (dto.compareAtPrice && dto.price >= dto.compareAtPrice) {
      return false;
    }
    return true;
  }
  
  defaultMessage(args: ValidationArguments) {
    return 'Compare at price must be greater than price';
  }
}
```

---

## 🔒 Security Best Practices

### 1. Authentication & Authorization

```typescript
// ✅ Good: Role-based access control
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin', 'super_admin')
  async getUsers() {
    // Only admins can access
  }
  
  @Delete('users/:id')
  @Roles('super_admin')
  @RequirePermission('users.delete')
  async deleteUser(@Param('id') id: string) {
    // Only super_admin with delete permission
  }
}

// Custom decorator for permissions
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// Permission guard
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    
    if (!requiredPermissions) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return requiredPermissions.every(permission =>
      user.permissions?.includes(permission),
    );
  }
}
```

### 2. Input Sanitization

```typescript
// ✅ Good: Sanitize user input
import { sanitize } from 'class-sanitizer';

export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => sanitize(value))  // Remove HTML tags
  title: string;
  
  @IsString()
  @Transform(({ value }) => value.trim())     // Trim whitespace
  content: string;
}
```

### 3. Rate Limiting

```typescript
// ✅ Good: Implement rate limiting
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Post('login')
  @Throttle(5, 60)  // 5 requests per 60 seconds
  async login(@Body() loginDto: LoginDto) {
    // Login logic
  }
}
```

---

## 6. Error Handling 🚨

### Standard Error Response Format

```typescript
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2025-11-09T10:30:00.000Z",
  "path": "/api/products",
  "details": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

### Custom Exception Filters

```typescript
// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log error
    console.error('Exception caught:', exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message,
      ...(typeof message === 'object' && message),
    });
  }
}
```

### Custom Business Exceptions

```typescript
// src/common/exceptions/business.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientStockException extends HttpException {
  constructor(productName: string, available: number, requested: number) {
    super(
      {
        message: `Insufficient stock for ${productName}`,
        available,
        requested,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InsufficientPointsException extends HttpException {
  constructor(required: number, available: number) {
    super(
      {
        message: 'Insufficient loyalty points',
        required,
        available,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class OrderNotCancellableException extends HttpException {
  constructor(status: string) {
    super(
      {
        message: `Order cannot be cancelled in ${status} status`,
        currentStatus: status,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

### Usage in Services

```typescript
@Injectable()
export class OrderService {
  async createOrder(customerId: string, dto: CreateOrderDto) {
    // Check inventory
    for (const item of dto.items) {
      const inventory = await this.inventoryRepository.findByProduct(item.productId);

      if (inventory.availableQuantity < item.quantity) {
        throw new InsufficientStockException(
          item.productName,
          inventory.availableQuantity,
          item.quantity,
        );
      }
    }

    // Check points if paying with points
    if (dto.paymentMethod === 'points') {
      const customer = await this.customerRepository.findById(customerId);

      if (customer.loyaltyPoints < dto.pointsRequired) {
        throw new InsufficientPointsException(
          dto.pointsRequired,
          customer.loyaltyPoints,
        );
      }
    }

    // Create order...
  }
}
```

---

## 7. Performance Optimization ⚡

### Database Query Optimization

```typescript
// ❌ Bad: N+1 Query Problem
async getOrdersWithProducts(customerId: string) {
  const orders = await this.orderModel.find({ customerId });

  for (const order of orders) {
    for (const item of order.items) {
      item.product = await this.productModel.findById(item.productId); // N+1!
    }
  }

  return orders;
}

// ✅ Good: Use aggregation or populate
async getOrdersWithProducts(customerId: string) {
  return this.orderModel
    .find({ customerId })
    .populate({
      path: 'items.productId',
      select: 'name images price',
    })
    .lean()
    .exec();
}
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-09
**Status**: Complete
