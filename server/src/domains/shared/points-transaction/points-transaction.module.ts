import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PointsTransaction,
  PointsTransactionSchema,
} from '../../../database/schemas/points-transaction.schema';
import {
  CustomerProfile,
  CustomerProfileSchema,
} from '../../../database/schemas/customer-profile.schema';
import { PointsTransactionService } from './services/points-transaction.service';
import { PointsEarningService } from './services/points-earning.service';
import { PointsRedemptionService } from './services/points-redemption.service';
import { PointsQueryService } from './services/points-query.service';
import { PointsTransactionController } from './controllers/points-transaction.controller';
import { PointsTransactionRepository } from './repositories/points-transaction.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PointsTransaction.name, schema: PointsTransactionSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
    ]),
  ],
  controllers: [PointsTransactionController],
  providers: [
    // Repository
    PointsTransactionRepository,
    // Specialized Services
    PointsEarningService,
    PointsRedemptionService,
    PointsQueryService,
    // Facade Service
    PointsTransactionService,
  ],
  exports: [
    PointsTransactionService,
    PointsEarningService,
    PointsRedemptionService,
    PointsQueryService,
    PointsTransactionRepository,
  ],
})
export class PointsTransactionModule {}
