import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PointsTransaction, PointsTransactionSchema } from '../../../database/schemas/points-transaction.schema';
import { CustomerProfile, CustomerProfileSchema } from '../../../database/schemas/customer-profile.schema';
import { PointsTransactionService } from './services/points-transaction.service';
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
  providers: [PointsTransactionService, PointsTransactionRepository],
  exports: [PointsTransactionService, PointsTransactionRepository],
})
export class PointsTransactionModule {}

