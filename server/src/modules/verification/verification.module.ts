import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VerificationRequest, VerificationRequestSchema } from '../../database/schemas/verification-request.schema';
import { StoreOwnerProfile, StoreOwnerProfileSchema } from '../../database/schemas/store-owner-profile.schema';
import { CourierProfile, CourierProfileSchema } from '../../database/schemas/courier-profile.schema';
import { VerificationController } from './controllers/verification.controller';
import { VerificationService } from './services/verification.service';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VerificationRequest.name, schema: VerificationRequestSchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
      { name: CourierProfile.name, schema: CourierProfileSchema },
    ]),
    StorageModule,
    AdminModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}

