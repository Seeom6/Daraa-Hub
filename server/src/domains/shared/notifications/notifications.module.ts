import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import {
  Notification,
  NotificationSchema,
} from '../../../database/schemas/notification.schema';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from '../../../database/schemas/notification-template.schema';
import {
  NotificationPreference,
  NotificationPreferenceSchema,
} from '../../../database/schemas/notification-preference.schema';
import {
  DeviceToken,
  DeviceTokenSchema,
} from '../../../database/schemas/device-token.schema';
import {
  Account,
  AccountSchema,
} from '../../../database/schemas/account.schema';
import {
  CustomerProfile,
  CustomerProfileSchema,
} from '../../../database/schemas/customer-profile.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileSchema,
} from '../../../database/schemas/store-owner-profile.schema';
import {
  CourierProfile,
  CourierProfileSchema,
} from '../../../database/schemas/courier-profile.schema';
import {
  AdminProfile,
  AdminProfileSchema,
} from '../../../database/schemas/admin-profile.schema';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { DeviceTokenService } from './services/device-token.service';
import { RecipientContactResolverService } from './services/recipient-contact-resolver.service';
import { NotificationProcessor } from './processors/notification.processor';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { EmailModule } from '../../../infrastructure/email/email.module';
import { SmsModule } from '../../../infrastructure/sms/sms.module';
import { PushModule } from '../../../infrastructure/push/push.module';
import { AdminModule } from '../admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository';
import { DeviceTokenRepository } from './repositories/device-token.repository';
import { NotificationTemplateRepository } from './repositories/notification-template.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      {
        name: NotificationPreference.name,
        schema: NotificationPreferenceSchema,
      },
      { name: DeviceToken.name, schema: DeviceTokenSchema },
      { name: Account.name, schema: AccountSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
      { name: CourierProfile.name, schema: CourierProfileSchema },
      { name: AdminProfile.name, schema: AdminProfileSchema },
    ]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'default-secret',
        signOptions: {
          expiresIn: (configService.get<string>('jwt.expiresIn') ||
            '7d') as any,
        },
      }),
    }),
    EmailModule,
    SmsModule,
    PushModule,
    AdminModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationTemplateService,
    NotificationPreferenceService,
    DeviceTokenService,
    RecipientContactResolverService,
    NotificationProcessor,
    NotificationsGateway,
    NotificationRepository,
    NotificationPreferenceRepository,
    DeviceTokenRepository,
    NotificationTemplateRepository,
  ],
  exports: [
    NotificationsService,
    NotificationTemplateService,
    NotificationPreferenceService,
    DeviceTokenService,
    NotificationRepository,
    NotificationPreferenceRepository,
    DeviceTokenRepository,
    NotificationTemplateRepository,
  ],
})
export class NotificationsModule {}
