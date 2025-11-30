import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// E-commerce Domain Modules
import { ProductModule } from './domains/e-commerce/products/product.module';
import { OrderModule } from './domains/e-commerce/orders/order.module';
import { StoresModule } from './domains/e-commerce/stores/stores.module';
import { InventoryModule } from './domains/e-commerce/inventory/inventory.module';
import { CategoryModule } from './domains/e-commerce/categories/category.module';
import { CouponModule } from './domains/e-commerce/coupons/coupon.module';
import { OfferModule } from './domains/e-commerce/offers/offer.module';
import { ReviewModule } from './domains/e-commerce/reviews/review.module';
import { CartModule } from './domains/e-commerce/cart/cart.module';
import { PaymentModule } from './domains/e-commerce/payment/payment.module';
import { ReturnModule } from './domains/e-commerce/returns/return.module';
import { DisputeModule } from './domains/e-commerce/disputes/dispute.module';

// Shared Domain Modules
import { AuthModule } from './domains/shared/auth/auth.module';
import { AccountModule } from './domains/shared/accounts/account.module';
import { NotificationsModule } from './domains/shared/notifications/notifications.module';
import { AnalyticsModule } from './domains/shared/analytics/analytics.module';
import { SettingsModule } from './domains/shared/settings/settings.module';
import { StoreSettingsModule } from './domains/shared/store-settings/store-settings.module';
import { SystemSettingsModule } from './domains/shared/system-settings/system-settings.module';
import { VerificationModule } from './domains/shared/verification/verification.module';
import { AdminModule } from './domains/shared/admin/admin.module';
import { CourierModule } from './domains/shared/courier/courier.module';
import { HealthModule } from './domains/shared/health/health.module';
import { AuditLogsModule } from './domains/shared/audit-logs/audit-logs.module';
import { PointsTransactionModule } from './domains/shared/points-transaction/points-transaction.module';
import { ReferralModule } from './domains/shared/referral/referral.module';
import { SubscriptionModule } from './domains/shared/subscription/subscription.module';
import { SubscriptionPlanModule } from './domains/shared/subscription-plan/subscription-plan.module';
import { StoreCategoriesModule } from './domains/shared/store-categories/store-categories.module';
import { AddressModule } from './domains/shared/addresses/address.module';
import { WalletModule } from './domains/shared/wallet/wallet.module';
import { CommissionModule } from './domains/shared/commission/commission.module';
import { DeliveryZoneModule } from './domains/shared/delivery-zones/delivery-zone.module';
import { SmsModule } from './infrastructure/sms/sms.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { EmailModule } from './infrastructure/email/email.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { EventsModule } from './infrastructure/events/events.module';
import { JobsModule } from './infrastructure/jobs/jobs.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // MongoDB Connection with Optimized Settings
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        // Connection Pool Settings
        maxPoolSize: configService.get<number>('database.maxPoolSize'),
        minPoolSize: configService.get<number>('database.minPoolSize'),
        maxIdleTimeMS: configService.get<number>('database.maxIdleTimeMS'),
        serverSelectionTimeoutMS: configService.get<number>(
          'database.serverSelectionTimeoutMS',
        ),
        socketTimeoutMS: configService.get<number>('database.socketTimeoutMS'),
        connectTimeoutMS: configService.get<number>(
          'database.connectTimeoutMS',
        ),
        // Write Concern
        retryWrites: configService.get<boolean>('database.retryWrites'),
        w: configService.get<string>('database.w') as 'majority' | number,
        // Read Preference (cast to valid type)
        readPreference: configService.get<string>('database.readPreference') as
          | 'primary'
          | 'primaryPreferred'
          | 'secondary'
          | 'secondaryPreferred'
          | 'nearest',
        // Auto Index (disable in production for performance)
        autoIndex: configService.get<string>('nodeEnv') !== 'production',
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
    JobsModule,

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
    AddressModule,
    WalletModule,
    CommissionModule,
    DeliveryZoneModule,
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
