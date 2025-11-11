import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemSettings, SystemSettingsSchema } from '../../database/schemas/system-settings.schema';
import { SettingsController } from './controllers/settings.controller';
import { SettingsService } from './services/settings.service';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemSettings.name, schema: SystemSettingsSchema },
    ]),
    RedisModule,
    AdminModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}

