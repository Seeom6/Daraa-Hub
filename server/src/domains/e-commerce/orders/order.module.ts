import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../../../database/schemas/order.schema';
import { OrderService } from './services/order.service';
import { OrderController } from './order.controller';
import { OrderEventsListener } from './listeners/order-events.listener';
import { NotificationsModule } from '../../shared/notifications/notifications.module';
import { PaymentModule } from '../payment/payment.module';
import { StoreSettingsModule } from '../../shared/store-settings/store-settings.module';
import { OrderRepository } from './repositories/order.repository';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../products/product.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AccountModule } from '../../shared/accounts/account.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),
    CartModule,
    ProductModule,
    InventoryModule,
    AccountModule,
    NotificationsModule,
    StoreSettingsModule,
    forwardRef(() => PaymentModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderEventsListener, OrderRepository],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}

