import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Dispute,
  DisputeStatus,
} from '../../../../database/schemas/dispute.schema';
import { ResolveDisputeDto } from '../dto/resolve-dispute.dto';
import { DisputeRepository } from '../repositories/dispute.repository';

/**
 * Service for dispute resolution operations
 */
@Injectable()
export class DisputeResolutionService {
  constructor(
    private readonly disputeRepository: DisputeRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async resolve(
    id: string,
    resolveDisputeDto: ResolveDisputeDto,
    adminId: string,
  ): Promise<Dispute> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid dispute ID');
    }

    const dispute = await this.disputeRepository.getModel().findById(id);
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (
      dispute.status === DisputeStatus.CLOSED ||
      dispute.status === DisputeStatus.RESOLVED
    ) {
      throw new BadRequestException('Dispute is already resolved or closed');
    }

    dispute.resolution = {
      action: resolveDisputeDto.action,
      amount: resolveDisputeDto.amount || 0,
      notes: resolveDisputeDto.notes || '',
    };
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolvedAt = new Date();

    await dispute.save();

    this.eventEmitter.emit('dispute.resolved', {
      disputeId: dispute._id,
      orderId: dispute.orderId,
      resolution: dispute.resolution,
      resolvedBy: adminId,
    });

    return dispute;
  }

  async close(id: string, adminId: string): Promise<Dispute> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid dispute ID');
    }

    const dispute = await this.disputeRepository.getModel().findById(id);
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status === DisputeStatus.CLOSED) {
      throw new BadRequestException('Dispute is already closed');
    }

    dispute.status = DisputeStatus.CLOSED;
    await dispute.save();

    this.eventEmitter.emit('dispute.closed', {
      disputeId: dispute._id,
      closedBy: adminId,
    });

    return dispute;
  }
}
