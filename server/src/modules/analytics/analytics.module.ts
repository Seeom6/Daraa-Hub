import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserActivity, UserActivitySchema } from '../../database/schemas/user-activity.schema';
import { ProductAnalytics, ProductAnalyticsSchema } from '../../database/schemas/product-analytics.schema';
import { StoreAnalytics, StoreAnalyticsSchema } from '../../database/schemas/store-analytics.schema';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: ProductAnalytics.name, schema: ProductAnalyticsSchema },
      { name: StoreAnalytics.name, schema: StoreAnalyticsSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

