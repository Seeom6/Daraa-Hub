import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreSettings, StoreSettingsSchema } from '../../../database/schemas/store-settings.schema';
import { StoreSettingsService } from './services/store-settings.service';
import { StoreSettingsController } from './controllers/store-settings.controller';
import { StoreSettingsRepository } from './repositories/store-settings.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreSettings.name, schema: StoreSettingsSchema },
    ]),
  ],
  controllers: [StoreSettingsController],
  providers: [StoreSettingsService, StoreSettingsRepository],
  exports: [StoreSettingsService, StoreSettingsRepository],
})
export class StoreSettingsModule {}

