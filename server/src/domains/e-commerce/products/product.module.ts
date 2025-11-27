import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../../../database/schemas/product.schema';
import { ProductVariant, ProductVariantSchema } from '../../../database/schemas/product-variant.schema';
import { StoreSubscription, StoreSubscriptionSchema } from '../../../database/schemas/store-subscription.schema';
import { StoreOwnerProfile, StoreOwnerProfileSchema } from '../../../database/schemas/store-owner-profile.schema';
import { SystemSettings, SystemSettingsSchema } from '../../../database/schemas/system-settings.schema';
import { ProductService } from './services/product.service';
import { ProductVariantService } from './services/product-variant.service';
import { ProductMediaService } from './services/product-media.service';
import { ProductSubscriptionService } from './services/product-subscription.service';
import { ProductController } from './controllers/product.controller';
import { ProductRepository } from './repositories/product.repository';
import { ProductVariantRepository } from './repositories/product-variant.repository';
import { StorageModule } from '../../../infrastructure/storage/storage.module';
import { CategoryModule } from '../categories/category.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: StoreSubscription.name, schema: StoreSubscriptionSchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
      { name: SystemSettings.name, schema: SystemSettingsSchema },
    ]),
    StorageModule,
    CategoryModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductVariantService,
    ProductMediaService,
    ProductSubscriptionService,
    ProductRepository,
    ProductVariantRepository,
  ],
  exports: [
    ProductService,
    ProductVariantService,
    ProductMediaService,
    ProductSubscriptionService,
    ProductRepository,
    ProductVariantRepository,
  ],
})
export class ProductModule {}

