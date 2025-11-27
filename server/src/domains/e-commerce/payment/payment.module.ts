import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../../../database/schemas/payment.schema';
import { Order, OrderSchema } from '../../../database/schemas/order.schema';
import { Account, AccountSchema } from '../../../database/schemas/account.schema';
import { CustomerProfile, CustomerProfileSchema } from '../../../database/schemas/customer-profile.schema';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './payment.controller';
import { PaymentEventsListener } from './listeners/payment-events.listener';
import { NotificationsModule } from '../../shared/notifications/notifications.module';
import { PaymentRepository } from './repositories/payment.repository';

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
  providers: [PaymentService, PaymentEventsListener, PaymentRepository],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}

