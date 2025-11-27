import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VerificationRequest, VerificationRequestSchema } from '../../../database/schemas/verification-request.schema';
import { StoreOwnerProfile, StoreOwnerProfileSchema } from '../../../database/schemas/store-owner-profile.schema';
import { CourierProfile, CourierProfileSchema } from '../../../database/schemas/courier-profile.schema';
import { VerificationController } from './controllers/verification.controller';
import { VerificationService } from './services/verification.service';
import { VerificationDocumentService } from './services/verification-document.service';
import { VerificationReviewService } from './services/verification-review.service';
import { StorageModule } from '../../../infrastructure/storage/storage.module';
import { AdminModule } from '../admin/admin.module';
import { VerificationRepository } from './repositories/verification.repository';

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
  providers: [
    VerificationService,
    VerificationDocumentService,
    VerificationReviewService,
    VerificationRepository,
  ],
  exports: [
    VerificationService,
    VerificationDocumentService,
    VerificationReviewService,
    VerificationRepository,
  ],
})
export class VerificationModule {}

