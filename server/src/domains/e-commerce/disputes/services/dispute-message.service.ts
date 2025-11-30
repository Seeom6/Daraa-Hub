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
import { AddMessageDto } from '../dto/add-message.dto';
import { DisputeRepository } from '../repositories/dispute.repository';

/**
 * Service for dispute messaging operations
 */
@Injectable()
export class DisputeMessageService {
  constructor(
    private readonly disputeRepository: DisputeRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async addMessage(
    id: string,
    addMessageDto: AddMessageDto,
    userId: string,
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
      throw new BadRequestException(
        'Cannot add message to closed or resolved dispute',
      );
    }

    dispute.messages.push({
      senderId: new Types.ObjectId(userId),
      message: addMessageDto.message,
      timestamp: new Date(),
      isAdminMessage: addMessageDto.isAdminMessage || false,
    });

    await dispute.save();

    this.eventEmitter.emit('dispute.message.added', {
      disputeId: dispute._id,
      senderId: userId,
    });

    return dispute;
  }
}
