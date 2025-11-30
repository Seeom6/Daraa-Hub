import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Dispute,
  DisputeSchema,
} from '../../../database/schemas/dispute.schema';
import { DisputeService } from './services/dispute.service';
import { DisputeResolutionService } from './services/dispute-resolution.service';
import { DisputeMessageService } from './services/dispute-message.service';
import { DisputeQueryService } from './services/dispute-query.service';
import { DisputeController } from './controllers/dispute.controller';
import { DisputeRepository } from './repositories/dispute.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Dispute.name, schema: DisputeSchema }]),
  ],
  controllers: [DisputeController],
  providers: [
    // Repository
    DisputeRepository,
    // Specialized Services
    DisputeResolutionService,
    DisputeMessageService,
    DisputeQueryService,
    // Facade Service
    DisputeService,
  ],
  exports: [
    DisputeService,
    DisputeResolutionService,
    DisputeMessageService,
    DisputeQueryService,
    DisputeRepository,
  ],
})
export class DisputeModule {}
