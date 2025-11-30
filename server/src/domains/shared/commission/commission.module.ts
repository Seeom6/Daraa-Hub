import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Commission,
  CommissionSchema,
} from '../../../database/schemas/commission.schema';
import {
  CommissionConfig,
  CommissionConfigSchema,
} from '../../../database/schemas/commission-config.schema';
import { CommissionController } from './controllers/commission.controller';
import { CommissionService } from './services/commission.service';
import { CommissionCalculationService } from './services/commission-calculation.service';
import { CommissionPayoutService } from './services/commission-payout.service';
import { CommissionQueryService } from './services/commission-query.service';
import { CommissionRepository } from './repositories/commission.repository';
import { CommissionConfigRepository } from './repositories/commission-config.repository';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema },
      { name: CommissionConfig.name, schema: CommissionConfigSchema },
    ]),
    WalletModule,
  ],
  controllers: [CommissionController],
  providers: [
    // Repositories
    CommissionRepository,
    CommissionConfigRepository,
    // Specialized Services
    CommissionCalculationService,
    CommissionPayoutService,
    CommissionQueryService,
    // Facade Service
    CommissionService,
  ],
  exports: [
    CommissionService,
    CommissionCalculationService,
    CommissionPayoutService,
    CommissionQueryService,
    CommissionRepository,
    CommissionConfigRepository,
  ],
})
export class CommissionModule {}
