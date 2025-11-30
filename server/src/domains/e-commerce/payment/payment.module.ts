import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Payment,
  PaymentSchema,
} from '../../../database/schemas/payment.schema';
import { Order, OrderSchema } from '../../../database/schemas/order.schema';
import {
  Account,
  AccountSchema,
} from '../../../database/schemas/account.schema';
import {
  CustomerProfile,
  CustomerProfileSchema,
} from '../../../database/schemas/customer-profile.schema';

// Controllers
import { PaymentController } from './payment.controller';

// Services
import { PaymentService } from './services/payment.service';
import { PaymentProcessingService } from './services/payment-processing.service';
import { PaymentRefundService } from './services/payment-refund.service';
import { PaymentQueryService } from './services/payment-query.service';

// Listeners
import { PaymentEventsListener } from './listeners/payment-events.listener';

// Repositories
import { PaymentRepository } from './repositories/payment.repository';

// External Modules
import { NotificationsModule } from '../../shared/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Account.name, schema: AccountSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [PaymentController],
  providers: [
    // Repository
    PaymentRepository,
    // Sub-services
    PaymentProcessingService,
    PaymentRefundService,
    PaymentQueryService,
    // Facade service
    PaymentService,
    // Listeners
    PaymentEventsListener,
  ],
  exports: [
    PaymentService,
    PaymentProcessingService,
    PaymentRefundService,
    PaymentQueryService,
    PaymentRepository,
  ],
})
export class PaymentModule {}
