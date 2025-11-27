import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourierProfile, CourierProfileSchema } from '../../../database/schemas/courier-profile.schema';
import { Order, OrderSchema } from '../../../database/schemas/order.schema';
import { Payment, PaymentSchema } from '../../../database/schemas/payment.schema';
import { CourierController } from './controllers/courier.controller';
import { CourierAdminController } from './controllers/courier-admin.controller';
import { CourierService } from './services/courier.service';
import { CourierAdminService } from './services/courier-admin.service';
import { CourierEventsListener } from './listeners/courier-events.listener';
import { PaymentModule } from '../../e-commerce/payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourierProfile.name, schema: CourierProfileSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    PaymentModule,
  ],
  controllers: [CourierController, CourierAdminController],
  providers: [CourierService, CourierAdminService, CourierEventsListener],
  exports: [CourierService, CourierAdminService],
})
export class CourierModule {}

