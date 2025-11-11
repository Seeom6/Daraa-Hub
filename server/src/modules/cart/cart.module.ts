import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from '../../database/schemas/cart.schema';
import { Product, ProductSchema } from '../../database/schemas/product.schema';
import { ProductVariant, ProductVariantSchema } from '../../database/schemas/product-variant.schema';
import { Inventory, InventorySchema } from '../../database/schemas/inventory.schema';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: Inventory.name, schema: InventorySchema },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}

