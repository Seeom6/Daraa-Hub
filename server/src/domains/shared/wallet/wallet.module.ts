import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from '../../../database/schemas/wallet.schema';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from '../../../database/schemas/wallet-transaction.schema';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { WalletBalanceService } from './services/wallet-balance.service';
import { WalletOperationsService } from './services/wallet-operations.service';
import { WalletAdminService } from './services/wallet-admin.service';
import { WalletTransactionService } from './services/wallet-transaction.service';
import { WalletRepository } from './repositories/wallet.repository';
import { WalletTransactionRepository } from './repositories/wallet-transaction.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
  ],
  controllers: [WalletController],
  providers: [
    // Repositories
    WalletRepository,
    WalletTransactionRepository,
    // Specialized Services
    WalletBalanceService,
    WalletOperationsService,
    WalletAdminService,
    // Facade Service
    WalletService,
    WalletTransactionService,
  ],
  exports: [
    WalletService,
    WalletBalanceService,
    WalletOperationsService,
    WalletAdminService,
    WalletTransactionService,
    WalletRepository,
    WalletTransactionRepository,
  ],
})
export class WalletModule {}
