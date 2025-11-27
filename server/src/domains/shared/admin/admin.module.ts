import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminProfile, AdminProfileSchema } from '../../../database/schemas/admin-profile.schema';
import { Account, AccountSchema } from '../../../database/schemas/account.schema';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { UserManagementService } from './services/user-management.service';
import { AdminGuard } from './guards/admin.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminProfile.name, schema: AdminProfileSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, UserManagementService, AdminGuard, PermissionsGuard],
  exports: [AdminService, UserManagementService],
})
export class AdminModule {}

