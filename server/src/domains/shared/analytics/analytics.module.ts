import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserActivity,
  UserActivitySchema,
} from '../../../database/schemas/user-activity.schema';
import {
  ProductAnalytics,
  ProductAnalyticsSchema,
} from '../../../database/schemas/product-analytics.schema';
import {
  StoreAnalytics,
  StoreAnalyticsSchema,
} from '../../../database/schemas/store-analytics.schema';

// Controllers
import { AnalyticsController } from './controllers/analytics.controller';

// Repositories
import {
  ProductAnalyticsRepository,
  StoreAnalyticsRepository,
} from './repositories/analytics.repository';
import { UserActivityRepository } from './repositories/user-activity.repository';

// Services
import { AnalyticsService } from './services/analytics.service';
import { UserActivityService } from './services/user-activity.service';
import { ProductAnalyticsService } from './services/product-analytics.service';
import { StoreAnalyticsService } from './services/store-analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: ProductAnalytics.name, schema: ProductAnalyticsSchema },
      { name: StoreAnalytics.name, schema: StoreAnalyticsSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [
    // Repositories
    ProductAnalyticsRepository,
    StoreAnalyticsRepository,
    UserActivityRepository,
    // Services
    UserActivityService,
    ProductAnalyticsService,
    StoreAnalyticsService,
    AnalyticsService, // Facade
  ],
  exports: [
    // Export all services for use in other modules
    AnalyticsService,
    UserActivityService,
    ProductAnalyticsService,
    StoreAnalyticsService,
    // Export repositories
    ProductAnalyticsRepository,
    StoreAnalyticsRepository,
    UserActivityRepository,
  ],
})
export class AnalyticsModule {}
