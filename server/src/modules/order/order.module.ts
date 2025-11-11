import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../../database/schemas/order.schema';
import { Cart, CartSchema } from '../../database/schemas/cart.schema';
import { Product, ProductSchema } from '../../database/schemas/product.schema';
import { ProductVariant, ProductVariantSchema } from '../../database/schemas/product-variant.schema';
import { Inventory, InventorySchema } from '../../database/schemas/inventory.schema';
import { StoreOwnerProfile, StoreOwnerProfileSchema } from '../../database/schemas/store-owner-profile.schema';
import { CustomerProfile, CustomerProfileSchema } from '../../database/schemas/customer-profile.schema';
import { Account, AccountSchema } from '../../database/schemas/account.schema';
import { OrderService } from './services/order.service';
import { OrderController } from './order.controller';
import { OrderEventsListener } from './listeners/order-events.listener';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentModule } from '../payment/payment.module';
import { StoreSettingsModule } from '../store-settings/store-settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
    NotificationsModule,
    StoreSettingsModule,
    forwardRef(() => PaymentModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderEventsListener],
  exports: [OrderService],
})
export class OrderModule {}

