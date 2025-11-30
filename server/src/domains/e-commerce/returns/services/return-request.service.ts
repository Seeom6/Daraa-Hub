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
import { CreateReturnDto } from '../dto/create-return.dto';
import { UpdateReturnDto } from '../dto/update-return.dto';
import { StoreResponseDto } from '../dto/store-response.dto';
import { AdminReviewDto } from '../dto/admin-review.dto';
import { ReturnRepository } from '../repositories/return.repository';

/**
 * Service for return request operations
 * Handles creation, updates, and responses
 */
@Injectable()
export class ReturnRequestService {
  constructor(
    private readonly returnRepository: ReturnRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createReturnDto: CreateReturnDto,
    customerId: string,
  ): Promise<Return> {
    const ReturnModel = this.returnRepository.getModel();
    const returnRequest = new ReturnModel({
      ...createReturnDto,
      customerId: new Types.ObjectId(customerId),
      orderId: new Types.ObjectId(createReturnDto.orderId),
      items: createReturnDto.items.map((item) => ({
        ...item,
        productId: new Types.ObjectId(item.productId),
      })),
    });

    const savedReturn = await returnRequest.save();

    this.eventEmitter.emit('return.created', {
      returnId: savedReturn._id,
      orderId: savedReturn.orderId,
      customerId: savedReturn.customerId,
    });

    return savedReturn;
  }

  async update(id: string, updateReturnDto: UpdateReturnDto): Promise<Return> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID');
    }

    const returnRequest = await this.returnRepository
      .getModel()
      .findByIdAndUpdate(id, updateReturnDto, { new: true })
      .exec();

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    this.eventEmitter.emit('return.updated', {
      returnId: returnRequest._id,
      status: returnRequest.status,
    });

    return returnRequest;
  }

  async storeRespond(
    id: string,
    storeResponseDto: StoreResponseDto,
    storeOwnerId: string,
  ): Promise<Return> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID');
    }

    const returnRequest = await this.returnRepository.getModel().findById(id);
    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.status !== ReturnStatus.REQUESTED) {
      throw new BadRequestException(
        'Return request has already been processed',
      );
    }

    returnRequest.storeResponse = {
      approved: storeResponseDto.approved,
      notes: storeResponseDto.notes || '',
      respondedAt: new Date(),
      respondedBy: new Types.ObjectId(storeOwnerId),
    };

    returnRequest.status = storeResponseDto.approved
      ? ReturnStatus.APPROVED
      : ReturnStatus.REJECTED;

    await returnRequest.save();

    this.eventEmitter.emit('return.store.responded', {
      returnId: returnRequest._id,
      approved: storeResponseDto.approved,
      storeOwnerId,
    });

    return returnRequest;
  }

  async adminReview(
    id: string,
    adminReviewDto: AdminReviewDto,
    adminId: string,
  ): Promise<Return> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID');
    }

    const returnRequest = await this.returnRepository.getModel().findById(id);
    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    returnRequest.adminReview = {
      approved: adminReviewDto.approved,
      notes: adminReviewDto.notes || '',
      reviewedAt: new Date(),
      reviewedBy: new Types.ObjectId(adminId),
    };

    if (
      adminReviewDto.approved &&
      returnRequest.status === ReturnStatus.REJECTED
    ) {
      returnRequest.status = ReturnStatus.APPROVED;
    } else if (
      !adminReviewDto.approved &&
      returnRequest.status === ReturnStatus.APPROVED
    ) {
      returnRequest.status = ReturnStatus.REJECTED;
    }

    await returnRequest.save();

    this.eventEmitter.emit('return.admin.reviewed', {
      returnId: returnRequest._id,
      approved: adminReviewDto.approved,
      adminId,
    });

    return returnRequest;
  }
}
