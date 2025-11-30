import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Return,
  ReturnStatus,
} from '../../../../database/schemas/return.schema';
import { ReturnRepository } from '../repositories/return.repository';

/**
 * Service for return processing operations
 * Handles pickup, inspection, and refund processing
 */
@Injectable()
export class ReturnProcessingService {
  constructor(
    private readonly returnRepository: ReturnRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async markAsPickedUp(id: string): Promise<Return> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID');
    }

    const returnRequest = await this.returnRepository.getModel().findById(id);
    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.status !== ReturnStatus.APPROVED) {
      throw new BadRequestException('Return must be approved before pickup');
    }

    returnRequest.status = ReturnStatus.PICKED_UP;
    returnRequest.pickedUpAt = new Date();

    await returnRequest.save();

    this.eventEmitter.emit('return.picked.up', {
      returnId: returnRequest._id,
    });

    return returnRequest;
  }

  async markAsInspected(id: string): Promise<Return> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID');
    }

    const returnRequest = await this.returnRepository.getModel().findById(id);
    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.status !== ReturnStatus.PICKED_UP) {
      throw new BadRequestException(
        'Return must be picked up before inspection',
      );
    }

    returnRequest.status = ReturnStatus.INSPECTED;
    returnRequest.inspectedAt = new Date();

    await returnRequest.save();

    this.eventEmitter.emit('return.inspected', {
      returnId: returnRequest._id,
    });

    return returnRequest;
  }

  async processRefund(id: string): Promise<Return> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID');
    }

    const returnRequest = await this.returnRepository.getModel().findById(id);
    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.status !== ReturnStatus.INSPECTED) {
      throw new BadRequestException('Return must be inspected before refund');
    }

    returnRequest.status = ReturnStatus.REFUNDED;
    returnRequest.refundedAt = new Date();

    await returnRequest.save();

    this.eventEmitter.emit('return.refunded', {
      returnId: returnRequest._id,
      refundAmount: returnRequest.refundAmount,
      refundMethod: returnRequest.refundMethod,
    });

    return returnRequest;
  }
}
