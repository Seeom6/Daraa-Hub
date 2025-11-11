import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Return, ReturnDocument, ReturnStatus } from '../../../../database/schemas/return.schema';
import { CreateReturnDto } from '../dto/create-return.dto';
import { UpdateReturnDto } from '../dto/update-return.dto';
import { StoreResponseDto } from '../dto/store-response.dto';
import { AdminReviewDto } from '../dto/admin-review.dto';
import { QueryReturnDto } from '../dto/query-return.dto';
import { ReturnRepository } from '../repositories/return.repository';

@Injectable()
export class ReturnService {
  constructor(
    private readonly returnRepository: ReturnRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createReturnDto: CreateReturnDto, customerId: string): Promise<Return> {
    const ReturnModel = this.returnRepository.getModel();
    const returnRequest = new ReturnModel({
      ...createReturnDto,
      customerId: new Types.ObjectId(customerId),
      orderId: new Types.ObjectId(createReturnDto.orderId),
      items: createReturnDto.items.map(item => ({
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

  async findAll(query: QueryReturnDto): Promise<{ data: Return[]; meta: any }> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    if (filters.orderId) filter.orderId = new Types.ObjectId(filters.orderId);
    if (filters.customerId) filter.customerId = new Types.ObjectId(filters.customerId);

    const [data, total] = await Promise.all([
      (this.returnRepository)
        .getModel()
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name phone')
        .populate('items.productId', 'name')
        ,
      this.returnRepository.count(filter),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Return> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID');
    }

    const returnRequest = await (this.returnRepository)
      .getModel()
      .findById(id)
      .populate('customerId', 'name phone')
      .populate('items.productId', 'name price')
      ;

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    return returnRequest;
  }

  async findByCustomer(customerId: string, query: QueryReturnDto): Promise<{ data: Return[]; meta: any }> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const filter: any = {
      customerId: new Types.ObjectId(customerId),
    };
    if (filters.status) filter.status = filters.status;

    const [data, total] = await Promise.all([
      (this.returnRepository)
        .getModel()
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.productId', 'name price')
        ,
      this.returnRepository.count(filter),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async storeRespond(id: string, storeResponseDto: StoreResponseDto, storeOwnerId: string): Promise<Return> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID');
    }

    const returnRequest = await this.returnRepository.getModel().findById(id);
    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.status !== ReturnStatus.REQUESTED) {
      throw new BadRequestException('Return request has already been processed');
    }

    returnRequest.storeResponse = {
      approved: storeResponseDto.approved,
      notes: storeResponseDto.notes || '',
      respondedAt: new Date(),
      respondedBy: new Types.ObjectId(storeOwnerId),
    };

    returnRequest.status = storeResponseDto.approved ? ReturnStatus.APPROVED : ReturnStatus.REJECTED;

    await returnRequest.save();

    this.eventEmitter.emit('return.store.responded', {
      returnId: returnRequest._id,
      approved: storeResponseDto.approved,
      storeOwnerId,
    });

    return returnRequest;
  }

  async adminReview(id: string, adminReviewDto: AdminReviewDto, adminId: string): Promise<Return> {
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

    if (adminReviewDto.approved && returnRequest.status === ReturnStatus.REJECTED) {
      returnRequest.status = ReturnStatus.APPROVED;
    } else if (!adminReviewDto.approved && returnRequest.status === ReturnStatus.APPROVED) {
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
      throw new BadRequestException('Return must be picked up before inspection');
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

  async getStatistics(filters?: any): Promise<any> {
    const matchStage: any = {};
    if (filters?.startDate || filters?.endDate) {
      matchStage.createdAt = {};
      if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
    }

    const stats = await this.returnRepository.getModel().aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          requested: { $sum: { $cond: [{ $eq: ['$status', ReturnStatus.REQUESTED] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', ReturnStatus.APPROVED] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', ReturnStatus.REJECTED] }, 1, 0] } },
          pickedUp: { $sum: { $cond: [{ $eq: ['$status', ReturnStatus.PICKED_UP] }, 1, 0] } },
          inspected: { $sum: { $cond: [{ $eq: ['$status', ReturnStatus.INSPECTED] }, 1, 0] } },
          refunded: { $sum: { $cond: [{ $eq: ['$status', ReturnStatus.REFUNDED] }, 1, 0] } },
          totalRefundAmount: { $sum: '$refundAmount' },
        },
      },
    ]);

    return stats[0] || {
      total: 0,
      requested: 0,
      approved: 0,
      rejected: 0,
      pickedUp: 0,
      inspected: 0,
      refunded: 0,
      totalRefundAmount: 0,
    };
  }
}

