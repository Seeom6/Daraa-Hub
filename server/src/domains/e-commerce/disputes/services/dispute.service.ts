import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Dispute, DisputeDocument, DisputeStatus } from '../../../../database/schemas/dispute.schema';
import { CreateDisputeDto } from '../dto/create-dispute.dto';
import { UpdateDisputeDto } from '../dto/update-dispute.dto';
import { AddMessageDto } from '../dto/add-message.dto';
import { ResolveDisputeDto } from '../dto/resolve-dispute.dto';
import { QueryDisputeDto } from '../dto/query-dispute.dto';

@Injectable()
export class DisputeService {
  constructor(
    @InjectModel(Dispute.name) private disputeModel: Model<DisputeDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createDisputeDto: CreateDisputeDto, userId: string): Promise<Dispute> {
    const dispute = new this.disputeModel({
      ...createDisputeDto,
      reportedBy: new Types.ObjectId(userId),
      orderId: new Types.ObjectId(createDisputeDto.orderId),
      reportedAgainst: new Types.ObjectId(createDisputeDto.reportedAgainst),
    });

    const savedDispute = await dispute.save();

    this.eventEmitter.emit('dispute.created', {
      disputeId: savedDispute._id,
      orderId: savedDispute.orderId,
      reportedBy: savedDispute.reportedBy,
      type: savedDispute.type,
    });

    return savedDispute;
  }

  async findAll(query: QueryDisputeDto): Promise<{ data: Dispute[]; meta: any }> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    if (filters.type) filter.type = filters.type;
    if (filters.priority) filter.priority = filters.priority;
    if (filters.orderId) filter.orderId = new Types.ObjectId(filters.orderId);
    if (filters.reportedBy) filter.reportedBy = new Types.ObjectId(filters.reportedBy);
    if (filters.assignedTo) filter.assignedTo = new Types.ObjectId(filters.assignedTo);

    const [data, total] = await Promise.all([
      this.disputeModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'phone')
        .populate('reportedAgainst', 'phone')
        .populate('assignedTo', 'name')
        .exec(),
      this.disputeModel.countDocuments(filter),
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

  async findById(id: string): Promise<Dispute> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid dispute ID');
    }

    const dispute = await this.disputeModel
      .findById(id)
      .populate('reportedBy', 'phone')
      .populate('reportedAgainst', 'phone')
      .populate('assignedTo', 'name')
      .exec();

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async findByUser(userId: string, query: QueryDisputeDto): Promise<{ data: Dispute[]; meta: any }> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const filter: any = {
      reportedBy: new Types.ObjectId(userId),
    };
    if (filters.status) filter.status = filters.status;
    if (filters.type) filter.type = filters.type;

    const [data, total] = await Promise.all([
      this.disputeModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reportedAgainst', 'phone')
        .populate('assignedTo', 'name')
        .exec(),
      this.disputeModel.countDocuments(filter),
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

  async update(id: string, updateDisputeDto: UpdateDisputeDto): Promise<Dispute> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid dispute ID');
    }

    const updateData: any = { ...updateDisputeDto };
    if (updateDisputeDto.assignedTo) {
      updateData.assignedTo = new Types.ObjectId(updateDisputeDto.assignedTo);
    }

    const dispute = await this.disputeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    this.eventEmitter.emit('dispute.updated', {
      disputeId: dispute._id,
      status: dispute.status,
    });

    return dispute;
  }

  async addMessage(id: string, addMessageDto: AddMessageDto, userId: string): Promise<Dispute> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid dispute ID');
    }

    const dispute = await this.disputeModel.findById(id);
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status === DisputeStatus.CLOSED || dispute.status === DisputeStatus.RESOLVED) {
      throw new BadRequestException('Cannot add message to closed or resolved dispute');
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

  async resolve(id: string, resolveDisputeDto: ResolveDisputeDto, adminId: string): Promise<Dispute> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid dispute ID');
    }

    const dispute = await this.disputeModel.findById(id);
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status === DisputeStatus.CLOSED || dispute.status === DisputeStatus.RESOLVED) {
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

    const dispute = await this.disputeModel.findById(id);
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

  async getStatistics(filters?: any): Promise<any> {
    const matchStage: any = {};
    if (filters?.startDate || filters?.endDate) {
      matchStage.createdAt = {};
      if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
    }

    const stats = await this.disputeModel.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', DisputeStatus.OPEN] }, 1, 0] } },
          investigating: { $sum: { $cond: [{ $eq: ['$status', DisputeStatus.INVESTIGATING] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', DisputeStatus.RESOLVED] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', DisputeStatus.CLOSED] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $eq: ['$status', DisputeStatus.ESCALATED] }, 1, 0] } },
        },
      },
    ]);

    return stats[0] || {
      total: 0,
      open: 0,
      investigating: 0,
      resolved: 0,
      closed: 0,
      escalated: 0,
    };
  }
}

