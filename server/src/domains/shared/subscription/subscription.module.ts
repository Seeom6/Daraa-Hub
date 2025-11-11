import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import {
  StoreSubscription,
  StoreSubscriptionSchema,
} from '../../../database/schemas/store-subscription.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from '../../../database/schemas/subscription-plan.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileSchema,
} from '../../../database/schemas/store-owner-profile.schema';
import {
  SystemSettings,
  SystemSettingsSchema,
} from '../../../database/schemas/system-settings.schema';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionCronService } from './services/subscription-cron.service';
import { SubscriptionEventsListener } from './listeners/subscription-events.listener';
import { SubscriptionController } from './controllers/subscription.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreSubscription.name, schema: StoreSubscriptionSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
      { name: SystemSettings.name, schema: SystemSettingsSchema },
    ]),
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionCronService, SubscriptionEventsListener],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

