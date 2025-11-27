import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Return, ReturnSchema } from '../../../database/schemas/return.schema';
import { ReturnService } from './services/return.service';
import { ReturnController } from './controllers/return.controller';
import { ReturnRepository } from './repositories/return.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Return.name, schema: ReturnSchema },
    ]),
  ],
  controllers: [ReturnController],
  providers: [ReturnService, ReturnRepository],
  exports: [ReturnService, ReturnRepository],
})
export class ReturnModule {}

