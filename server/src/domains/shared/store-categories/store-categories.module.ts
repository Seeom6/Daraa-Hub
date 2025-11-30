import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StoreCategory,
  StoreCategorySchema,
} from '../../../database/schemas/store-category.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileSchema,
} from '../../../database/schemas/store-owner-profile.schema';
import { StoreCategoriesService } from './services/store-categories.service';
import { StoreCategoriesCrudService } from './services/store-categories-crud.service';
import { StoreCategoriesQueryService } from './services/store-categories-query.service';
import { StoreCategoriesHierarchyService } from './services/store-categories-hierarchy.service';
import { StoreCategoryCacheService } from './services/store-category-cache.service';
import { StoreCategoryStatisticsService } from './services/store-category-statistics.service';
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
  providers: [
    StoreCategoriesService,
    StoreCategoriesCrudService,
    StoreCategoriesQueryService,
    StoreCategoriesHierarchyService,
    StoreCategoryCacheService,
    StoreCategoryStatisticsService,
    StoreCategoryRepository,
  ],
  exports: [
    StoreCategoriesService,
    StoreCategoriesCrudService,
    StoreCategoriesQueryService,
    StoreCategoriesHierarchyService,
    StoreCategoryCacheService,
    StoreCategoryStatisticsService,
    StoreCategoryRepository,
  ],
})
export class StoreCategoriesModule {}
