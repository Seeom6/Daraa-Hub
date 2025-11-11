import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreSettings, StoreSettingsSchema } from '../../../database/schemas/store-settings.schema';
import { StoreSettingsService } from './services/store-settings.service';
import { StoreSettingsController } from './controllers/store-settings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreSettings.name, schema: StoreSettingsSchema },
    ]),
  ],
  controllers: [StoreSettingsController],
  providers: [StoreSettingsService],
  exports: [StoreSettingsService],
})
export class StoreSettingsModule {}

