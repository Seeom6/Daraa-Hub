import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreCategory, StoreCategorySchema } from '../../../database/schemas/store-category.schema';
import { StoreOwnerProfile, StoreOwnerProfileSchema } from '../../../database/schemas/store-owner-profile.schema';
import { StoreCategoriesService } from './services/store-categories.service';
import { StoreCategoriesController } from './controllers/store-categories.controller';
import { RedisModule } from '../../../infrastructure/redis/redis.module';
import { StoreCategoryRepository } from './repositories/store-category.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreCategory.name, schema: StoreCategorySchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
    ]),
    RedisModule,
  ],
  controllers: [StoreCategoriesController],
  providers: [StoreCategoriesService, StoreCategoryRepository],
  exports: [StoreCategoriesService, StoreCategoryRepository],
})
export class StoreCategoriesModule {}

