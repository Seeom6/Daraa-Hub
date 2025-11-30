import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { AccountProfileService } from './services/account-profile.service';
import { AccountSecurityService } from './services/account-security.service';
import {
  Account,
  AccountSchema,
  SecurityProfile,
  SecurityProfileSchema,
  CustomerProfile,
  CustomerProfileSchema,
  StoreOwnerProfile,
  StoreOwnerProfileSchema,
  CourierProfile,
  CourierProfileSchema,
} from '../../../database/schemas';
import { AccountRepository } from './repositories/account.repository';
import { CustomerProfileRepository } from './repositories/customer-profile.repository';
import { StoreOwnerProfileRepository } from './repositories/store-owner-profile.repository';
import { CourierProfileRepository } from './repositories/courier-profile.repository';
import { SecurityProfileRepository } from './repositories/security-profile.repository';
import { StoreCategoriesModule } from '../store-categories/store-categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: SecurityProfile.name, schema: SecurityProfileSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
      { name: CourierProfile.name, schema: CourierProfileSchema },
    ]),
    forwardRef(() => StoreCategoriesModule),
  ],
  controllers: [AccountController],
  providers: [
    AccountService,
    AccountProfileService,
    AccountSecurityService,
    AccountRepository,
    CustomerProfileRepository,
    StoreOwnerProfileRepository,
    CourierProfileRepository,
    SecurityProfileRepository,
  ],
  exports: [
    AccountService,
    AccountProfileService,
    AccountSecurityService,
    AccountRepository,
    CustomerProfileRepository,
    StoreOwnerProfileRepository,
    CourierProfileRepository,
    SecurityProfileRepository,
  ],
})
export class AccountModule {}
