import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { AdminModule } from './modules/admin/admin.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { VerificationModule } from './modules/verification/verification.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { StoreSettingsModule } from './modules/store-settings/store-settings.module';
import { StoreCategoriesModule } from './modules/store-categories/store-categories.module';
import { StoresModule } from './modules/stores/stores.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { SubscriptionPlanModule } from './modules/subscription-plan/subscription-plan.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CourierModule } from './modules/courier/courier.module';
import { ReviewModule } from './modules/review/review.module';
import { HealthModule } from './modules/health/health.module';
import { PointsTransactionModule } from './modules/points-transaction/points-transaction.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { OfferModule } from './modules/offer/offer.module';
import { ReferralModule } from './modules/referral/referral.module';
import { DisputeModule } from './modules/dispute/dispute.module';
import { ReturnModule } from './modules/return/return.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SmsModule } from './infrastructure/sms/sms.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { EmailModule } from './infrastructure/email/email.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { EventsModule } from './infrastructure/events/events.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: (configService.get<number>('rateLimit.ttl') || 60) * 1000, // Convert to milliseconds
            limit: configService.get<number>('rateLimit.limit') || 100,
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Infrastructure Modules
    RedisModule,
    QueueModule,
    EmailModule,
    StorageModule,
    EventsModule,
    SmsModule,

    // Feature Modules
    AuthModule,
    AccountModule,
    AdminModule,
    SettingsModule,
    AuditLogsModule,
    NotificationsModule,
    VerificationModule,
    StoreCategoriesModule,
    StoresModule,
    CategoryModule,
    ProductModule,
    InventoryModule,
    StoreSettingsModule,
    SubscriptionModule,
    SubscriptionPlanModule,
    SystemSettingsModule,
    CartModule,
    OrderModule,
    PaymentModule,
    CourierModule,
    ReviewModule,
    PointsTransactionModule,
    CouponModule,
    OfferModule,
    ReferralModule,
    DisputeModule,
    ReturnModule,
    AnalyticsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
