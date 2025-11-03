# Detailed Migration Plan - Folder Structure Refactoring

**Date:** November 3, 2025  
**Estimated Time:** 4-6 hours  
**Risk Level:** Medium (requires careful execution)  
**Rollback Strategy:** Git commit before each phase

---

## Table of Contents
1. [Before You Start](#before-you-start)
2. [Phase-by-Phase Migration](#phase-by-phase-migration)
3. [File Movement Mapping](#file-movement-mapping)
4. [Import Update Guide](#import-update-guide)
5. [Testing Checklist](#testing-checklist)
6. [Rollback Procedure](#rollback-procedure)

---

## Before You Start

### Prerequisites

✅ **Checklist:**
- [ ] All current code is committed to git
- [ ] All tests are passing
- [ ] Docker containers are running
- [ ] Create a new branch: `git checkout -b refactor/folder-structure`
- [ ] Backup database (optional but recommended)

### Safety Measures

```bash
# 1. Create backup branch
git checkout -b backup/before-refactor
git push origin backup/before-refactor

# 2. Create working branch
git checkout -b refactor/folder-structure

# 3. Commit after each phase
git add .
git commit -m "Phase X: [description]"
```

---

## Phase-by-Phase Migration

### Phase 1: Create New Folder Structure (15 minutes)

**Goal:** Create all new folders without moving any files yet.

**Commands:**
```bash
cd server/src

# Create core folders
mkdir -p core/database core/cache core/logger core/security

# Create common subfolders
mkdir -p common/constants common/enums common/decorators common/guards
mkdir -p common/interceptors common/filters common/pipes common/middlewares
mkdir -p common/interfaces common/types common/dto common/utils

# Create infrastructure folders
mkdir -p infrastructure/sms/providers infrastructure/email/providers infrastructure/email/templates
mkdir -p infrastructure/storage/providers infrastructure/payment/providers
mkdir -p infrastructure/notification/providers infrastructure/queue/processors

# Create modules folders
mkdir -p modules/auth/controllers modules/auth/services modules/auth/strategies
mkdir -p modules/auth/dto modules/auth/entities modules/auth/tests

mkdir -p modules/account/controllers modules/account/services
mkdir -p modules/account/dto modules/account/entities modules/account/tests

mkdir -p modules/product/controllers modules/product/services
mkdir -p modules/product/dto modules/product/entities modules/product/tests

mkdir -p modules/order/controllers modules/order/services
mkdir -p modules/order/dto modules/order/entities modules/order/tests

mkdir -p modules/delivery/controllers modules/delivery/services
mkdir -p modules/delivery/dto modules/delivery/entities modules/delivery/tests

mkdir -p modules/store/controllers modules/store/services
mkdir -p modules/store/dto modules/store/entities modules/store/tests

mkdir -p modules/review/controllers modules/review/services
mkdir -p modules/review/dto modules/review/entities modules/review/tests

mkdir -p modules/address/controllers modules/address/services
mkdir -p modules/address/dto modules/address/entities modules/address/tests

mkdir -p modules/admin/controllers modules/admin/services
mkdir -p modules/admin/dto modules/admin/tests

# Create database folders
mkdir -p database/schemas database/migrations database/seeders
```

**Commit:**
```bash
git add .
git commit -m "Phase 1: Create new folder structure"
```

---

### Phase 2: Move Common Code (30 minutes)

**Goal:** Move guards, interceptors, filters, and create constants/enums.

#### Step 2.1: Move Guards

```bash
# Move JWT guard
mv auth/guards/jwt-auth.guard.ts common/guards/

# Create index file
cat > common/guards/index.ts << 'EOF'
export * from './jwt-auth.guard';
EOF
```

**Update `common/guards/jwt-auth.guard.ts`:**
- Update imports to use new paths
- No logic changes needed

#### Step 2.2: Guards Already in Place

```bash
# Interceptors and filters are already in common/
# Just create index files

cat > common/interceptors/index.ts << 'EOF'
export * from './logging.interceptor';
EOF

cat > common/filters/index.ts << 'EOF'
export * from './http-exception.filter';
EOF
```

#### Step 2.3: Create Constants

**Create `common/constants/roles.constant.ts`:**
```typescript
export const ROLES = {
  CUSTOMER: 'customer',
  STORE_OWNER: 'store_owner',
  COURIER: 'courier',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
```

**Create `common/constants/index.ts`:**
```typescript
export * from './roles.constant';
```

#### Step 2.4: Create Enums

**Create `common/enums/user-role.enum.ts`:**
```typescript
export enum UserRole {
  CUSTOMER = 'customer',
  STORE_OWNER = 'store_owner',
  COURIER = 'courier',
  ADMIN = 'admin',
}
```

**Create `common/enums/index.ts`:**
```typescript
export * from './user-role.enum';
```

#### Step 2.5: Create Common DTOs

**Create `common/dto/pagination.dto.ts`:**
```typescript
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

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

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
```

**Create `common/dto/index.ts`:**
```typescript
export * from './pagination.dto';
```

#### Step 2.6: Create Decorators

**Create `common/decorators/current-user.decorator.ts`:**
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**Create `common/decorators/index.ts`:**
```typescript
export * from './current-user.decorator';
```

**Commit:**
```bash
git add .
git commit -m "Phase 2: Move common code and create constants/enums/decorators"
```

---

### Phase 3: Move Infrastructure (45 minutes)

**Goal:** Move SMS module to infrastructure and prepare for other services.

#### Step 3.1: Move SMS Module

```bash
# Move SMS files
mv sms/sms.module.ts infrastructure/sms/
mv sms/sms.service.ts infrastructure/sms/providers/twilio.provider.ts
```

**Create `infrastructure/sms/sms.interface.ts`:**
```typescript
export interface ISmsService {
  sendOtp(phoneNumber: string, otp: string): Promise<void>;
  sendMessage(phoneNumber: string, message: string): Promise<void>;
}
```

**Create `infrastructure/sms/providers/mock.provider.ts`:**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ISmsService } from '../sms.interface';

@Injectable()
export class MockSmsProvider implements ISmsService {
  private readonly logger = new Logger(MockSmsProvider.name);

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    this.logger.log(`[MOCK SMS] Sending OTP to ${phoneNumber}: ${otp}`);
  }

  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    this.logger.log(`[MOCK SMS] Sending message to ${phoneNumber}: ${message}`);
  }
}
```

**Update `infrastructure/sms/providers/twilio.provider.ts`:**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { ISmsService } from '../sms.interface';

@Injectable()
export class TwilioSmsProvider implements ISmsService {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('sms.accountSid');
    const authToken = this.configService.get<string>('sms.authToken');
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    const message = `Your verification code is: ${otp}`;
    await this.sendMessage(phoneNumber, message);
  }

  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    const from = this.configService.get<string>('sms.phoneNumber');
    await this.twilioClient.messages.create({
      body: message,
      from,
      to: phoneNumber,
    });
  }
}
```

**Update `infrastructure/sms/sms.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioSmsProvider } from './providers/twilio.provider';
import { MockSmsProvider } from './providers/mock.provider';

@Module({
  providers: [
    {
      provide: 'SMS_SERVICE',
      useFactory: (configService: ConfigService) => {
        const useMock = configService.get<boolean>('sms.useMock');
        return useMock ? new MockSmsProvider() : new TwilioSmsProvider(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SMS_SERVICE'],
})
export class SmsModule {}
```

**Delete old SMS folder:**
```bash
rm -rf sms/
```

**Commit:**
```bash
git add .
git commit -m "Phase 3: Move SMS to infrastructure with provider pattern"
```

---

### Phase 4: Reorganize Auth Module (60 minutes)

**Goal:** Restructure auth module with new folder organization.

#### Step 4.1: Move Controllers

```bash
mv auth/auth.controller.ts modules/auth/controllers/
```

#### Step 4.2: Move Services

```bash
mv auth/auth.service.ts modules/auth/services/
```

**Create `modules/auth/services/otp.service.ts`:**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Otp, OtpDocument } from '../entities/otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, 12);
  }

  async verifyOtp(otp: string, hashedOtp: string): Promise<boolean> {
    return bcrypt.compare(otp, hashedOtp);
  }

  async createOtp(phoneNumber: string, otp: string, type: string): Promise<void> {
    const hashedOtp = await this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.otpModel.create({
      phoneNumber,
      otp: hashedOtp,
      type,
      expiresAt,
      attempts: 0,
    });
  }

  async findOtp(phoneNumber: string, type: string): Promise<OtpDocument | null> {
    return this.otpModel.findOne({
      phoneNumber,
      type,
      expiresAt: { $gt: new Date() },
    });
  }

  async incrementAttempts(otpId: string): Promise<void> {
    await this.otpModel.findByIdAndUpdate(otpId, {
      $inc: { attempts: 1 },
    });
  }

  async deleteOtp(phoneNumber: string, type: string): Promise<void> {
    await this.otpModel.deleteMany({ phoneNumber, type });
  }
}
```

**Create `modules/auth/services/token.service.ts`:**
```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });
  }

  generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });
  }

  verifyToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('jwt.secret'),
    });
  }
}
```

#### Step 4.3: Move DTOs

```bash
mv auth/dto/* modules/auth/dto/
```

#### Step 4.4: Move Strategies

```bash
mv auth/strategies/* modules/auth/strategies/
```

#### Step 4.5: Create Entities

```bash
# Move schema to database
mv auth/schemas/otp.schema.ts database/schemas/
```

**Create `modules/auth/entities/otp.entity.ts`:**
```typescript
export { Otp, OtpDocument, OtpSchema } from '@/database/schemas/otp.schema';
```

**Create `modules/auth/entities/index.ts`:**
```typescript
export * from './otp.entity';
```

#### Step 4.6: Update Auth Module

**Update `modules/auth/auth.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Otp, OtpSchema } from './entities/otp.entity';
import { AccountModule } from '../account/account.module';
import { SmsModule } from '@/infrastructure/sms/sms.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    AccountModule,
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, TokenService, JwtStrategy],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
```

**Delete old auth folder:**
```bash
rm -rf auth/
```

**Commit:**
```bash
git add .
git commit -m "Phase 4: Reorganize auth module with new structure"
```

---

### Phase 5: Reorganize Account Module (60 minutes)

**Goal:** Restructure account module and merge users module.

#### Step 5.1: Move Controllers

```bash
mv account/account.controller.ts modules/account/controllers/
```

#### Step 5.2: Move Services

```bash
mv account/account.service.ts modules/account/services/
```

#### Step 5.3: Move DTOs

```bash
mv account/dto/* modules/account/dto/
```

#### Step 5.4: Move Schemas to Database

```bash
mv account/schemas/*.ts database/schemas/
```

#### Step 5.5: Create Entities

**Create entity files in `modules/account/entities/`:**

```typescript
// modules/account/entities/account.entity.ts
export { Account, AccountDocument, AccountSchema } from '@/database/schemas/account.schema';

// modules/account/entities/security-profile.entity.ts
export { SecurityProfile, SecurityProfileDocument, SecurityProfileSchema } from '@/database/schemas/security-profile.schema';

// modules/account/entities/customer-profile.entity.ts
export { CustomerProfile, CustomerProfileDocument, CustomerProfileSchema } from '@/database/schemas/customer-profile.schema';

// modules/account/entities/store-owner-profile.entity.ts
export { StoreOwnerProfile, StoreOwnerProfileDocument, StoreOwnerProfileSchema } from '@/database/schemas/store-owner-profile.schema';

// modules/account/entities/courier-profile.entity.ts
export { CourierProfile, CourierProfileDocument, CourierProfileSchema } from '@/database/schemas/courier-profile.schema';

// modules/account/entities/index.ts
export * from './account.entity';
export * from './security-profile.entity';
export * from './customer-profile.entity';
export * from './store-owner-profile.entity';
export * from './courier-profile.entity';
```

#### Step 5.6: Update Account Module

**Update `modules/account/account.module.ts`** - similar pattern to auth module

#### Step 5.7: Delete Old Folders

```bash
rm -rf account/
rm -rf users/  # Merge users functionality into account
```

**Commit:**
```bash
git add .
git commit -m "Phase 5: Reorganize account module and remove users module"
```

---

## File Movement Mapping

### Summary Table

| Old Path | New Path | Notes |
|----------|----------|-------|
| `auth/guards/jwt-auth.guard.ts` | `common/guards/jwt-auth.guard.ts` | Shared guard |
| `sms/*` | `infrastructure/sms/*` | Infrastructure service |
| `auth/auth.controller.ts` | `modules/auth/controllers/auth.controller.ts` | Feature module |
| `auth/auth.service.ts` | `modules/auth/services/auth.service.ts` | Business logic |
| `auth/dto/*` | `modules/auth/dto/*` | DTOs stay with module |
| `auth/schemas/otp.schema.ts` | `database/schemas/otp.schema.ts` | Centralized schemas |
| `account/schemas/*.ts` | `database/schemas/*.ts` | Centralized schemas |
| `users/*` | DELETED | Merged into account |

---

## Testing Checklist

After each phase:

```bash
# 1. Build the application
npm run build

# 2. Check for TypeScript errors
npm run lint

# 3. Run tests (if any)
npm run test

# 4. Start the application
docker-compose up --build

# 5. Test key endpoints
curl -X POST http://localhost:3001/api/auth/register/step1 \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","phoneNumber":"+96550000999","countryCode":"+965"}'
```

---

## Rollback Procedure

If something goes wrong:

```bash
# 1. Stop the application
docker-compose down

# 2. Discard all changes
git reset --hard HEAD

# 3. Or go back to backup branch
git checkout backup/before-refactor

# 4. Restart
docker-compose up
```

---

**Next:** Review this plan and approve before execution.

