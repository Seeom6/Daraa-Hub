import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from '../../../database/schemas/review.schema';
import { Order, OrderSchema } from '../../../database/schemas/order.schema';
import { Product, ProductSchema } from '../../../database/schemas/product.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileSchema,
} from '../../../database/schemas/store-owner-profile.schema';
import {
  CourierProfile,
  CourierProfileSchema,
} from '../../../database/schemas/courier-profile.schema';
import {
  CustomerProfile,
  CustomerProfileSchema,
} from '../../../database/schemas/customer-profile.schema';
import { ReviewService } from './services/review.service';
import { ReviewRatingService } from './services/review-rating.service';
import { ReviewModerationService } from './services/review-moderation.service';
import { ReviewInteractionService } from './services/review-interaction.service';
import { ReviewController } from './controllers/review.controller';
import { ReviewAdminController } from './controllers/review-admin.controller';
import { ReviewEventsListener } from './listeners/review-events.listener';
import { ReviewRepository } from './repositories/review.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
      { name: CourierProfile.name, schema: CourierProfileSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
    ]),
  ],
  controllers: [ReviewController, ReviewAdminController],
  providers: [
    ReviewService,
    ReviewRatingService,
    ReviewModerationService,
    ReviewInteractionService,
    ReviewEventsListener,
    ReviewRepository,
  ],
  exports: [
    ReviewService,
    ReviewRatingService,
    ReviewModerationService,
    ReviewInteractionService,
    ReviewRepository,
  ],
})
export class ReviewModule {}

