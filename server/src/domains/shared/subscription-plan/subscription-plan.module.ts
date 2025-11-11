import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from '../../../database/schemas/subscription-plan.schema';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SubscriptionPlanController } from './controllers/subscription-plan.controller';
import { SubscriptionPlanRepository } from './repositories/subscription-plan.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
    ]),
  ],
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService, SubscriptionPlanRepository],
  exports: [SubscriptionPlanService, SubscriptionPlanRepository],
})
export class SubscriptionPlanModule {}

