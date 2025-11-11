import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Return, ReturnSchema } from '../../database/schemas/return.schema';
import { ReturnService } from './services/return.service';
import { ReturnController } from './controllers/return.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Return.name, schema: ReturnSchema },
    ]),
  ],
  controllers: [ReturnController],
  providers: [ReturnService],
  exports: [ReturnService],
})
export class ReturnModule {}

