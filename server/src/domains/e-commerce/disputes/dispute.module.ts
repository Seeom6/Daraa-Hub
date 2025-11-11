import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dispute, DisputeSchema } from '../../../database/schemas/dispute.schema';
import { DisputeService } from './services/dispute.service';
import { DisputeController } from './controllers/dispute.controller';
import { DisputeRepository } from './repositories/dispute.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dispute.name, schema: DisputeSchema },
    ]),
  ],
  controllers: [DisputeController],
  providers: [DisputeService, DisputeRepository],
  exports: [DisputeService, DisputeRepository],
})
export class DisputeModule {}

