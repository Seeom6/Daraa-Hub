import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreOwnerProfile, StoreOwnerProfileSchema } from '../../../database/schemas';
import { StoresController } from './stores.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
    ]),
  ],
  controllers: [StoresController],
})
export class StoresModule {}

