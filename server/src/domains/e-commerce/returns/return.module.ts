import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Return, ReturnSchema } from '../../../database/schemas/return.schema';
import { ReturnService } from './services/return.service';
import { ReturnRequestService } from './services/return-request.service';
import { ReturnProcessingService } from './services/return-processing.service';
import { ReturnQueryService } from './services/return-query.service';
import { ReturnController } from './controllers/return.controller';
import { ReturnRepository } from './repositories/return.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Return.name, schema: ReturnSchema }]),
  ],
  controllers: [ReturnController],
  providers: [
    // Repository
    ReturnRepository,
    // Specialized Services
    ReturnRequestService,
    ReturnProcessingService,
    ReturnQueryService,
    // Facade Service
    ReturnService,
  ],
  exports: [
    ReturnService,
    ReturnRequestService,
    ReturnProcessingService,
    ReturnQueryService,
    ReturnRepository,
  ],
})
export class ReturnModule {}
