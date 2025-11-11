import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
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
  StoreCategory,
  StoreCategorySchema,
} from '../../../database/schemas';
import { AccountRepository } from './repositories/account.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: SecurityProfile.name, schema: SecurityProfileSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
      { name: CourierProfile.name, schema: CourierProfileSchema },
      { name: StoreCategory.name, schema: StoreCategorySchema },
    ]),
  ],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  exports: [AccountService, AccountRepository],
})
export class AccountModule {}

