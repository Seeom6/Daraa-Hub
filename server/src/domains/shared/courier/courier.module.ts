import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CourierProfile,
  CourierProfileSchema,
} from '../../../database/schemas/courier-profile.schema';
import { Order, OrderSchema } from '../../../database/schemas/order.schema';
import {
  Payment,
  PaymentSchema,
} from '../../../database/schemas/payment.schema';

// Controllers
import { CourierController } from './controllers/courier.controller';
import { CourierAdminController } from './controllers/courier-admin.controller';

// Services
import { CourierService } from './services/courier.service';
import { CourierAdminService } from './services/courier-admin.service';
import { CourierProfileService } from './services/courier-profile.service';
import { CourierDeliveryService } from './services/courier-delivery.service';
import { CourierDeliveryAssignmentService } from './services/courier-delivery-assignment.service';
import { CourierDeliveryTrackingService } from './services/courier-delivery-tracking.service';
import { CourierDeliveryQueryService } from './services/courier-delivery-query.service';
import { CourierEarningsService } from './services/courier-earnings.service';
// Specialized Admin Services
import { CourierAssignmentService } from './services/courier-assignment.service';
import { CourierSuspensionService } from './services/courier-suspension.service';
import { CourierStatsService } from './services/courier-stats.service';

// Listeners
import { CourierEventsListener } from './listeners/courier-events.listener';

// External Modules
import { PaymentModule } from '../../e-commerce/payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourierProfile.name, schema: CourierProfileSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    forwardRef(() => PaymentModule),
  ],
  controllers: [CourierController, CourierAdminController],
  providers: [
    // Sub-services (order matters for dependency injection)
    CourierProfileService,
    CourierEarningsService,
    // Courier Delivery Sub-services
    CourierDeliveryAssignmentService,
    CourierDeliveryTrackingService,
    CourierDeliveryQueryService,
    CourierDeliveryService,
    // Specialized Admin Services
    CourierAssignmentService,
    CourierSuspensionService,
    CourierStatsService,
    // Facade services
    CourierService,
    CourierAdminService,
    // Listeners
    CourierEventsListener,
  ],
  exports: [
    CourierService,
    CourierAdminService,
    CourierProfileService,
    CourierDeliveryService,
    CourierDeliveryAssignmentService,
    CourierDeliveryTrackingService,
    CourierDeliveryQueryService,
    CourierEarningsService,
    CourierAssignmentService,
    CourierSuspensionService,
    CourierStatsService,
  ],
})
export class CourierModule {}
