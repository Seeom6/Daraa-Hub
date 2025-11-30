import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Dispute } from '../../../../database/schemas/dispute.schema';
import { CreateDisputeDto } from '../dto/create-dispute.dto';
import { UpdateDisputeDto } from '../dto/update-dispute.dto';
import { AddMessageDto } from '../dto/add-message.dto';
import { ResolveDisputeDto } from '../dto/resolve-dispute.dto';
import { QueryDisputeDto } from '../dto/query-dispute.dto';
import { DisputeRepository } from '../repositories/dispute.repository';
import { DisputeResolutionService } from './dispute-resolution.service';
import { DisputeMessageService } from './dispute-message.service';
import { DisputeQueryService } from './dispute-query.service';

/**
 * Dispute Service - Facade Pattern
 * Delegates operations to specialized services
 */
@Injectable()
export class DisputeService {
  constructor(
    private readonly disputeRepository: DisputeRepository,
    private readonly resolutionService: DisputeResolutionService,
    private readonly messageService: DisputeMessageService,
    private readonly queryService: DisputeQueryService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createDisputeDto: CreateDisputeDto,
    userId: string,
  ): Promise<Dispute> {
    const DisputeModel = this.disputeRepository.getModel();
    const dispute = new DisputeModel({
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

  async update(
    id: string,
    updateDisputeDto: UpdateDisputeDto,
  ): Promise<Dispute> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid dispute ID');
    }

    const updateData: any = { ...updateDisputeDto };
    if (updateDisputeDto.assignedTo) {
      updateData.assignedTo = new Types.ObjectId(updateDisputeDto.assignedTo);
    }

    const dispute = await this.disputeRepository
      .getModel()
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

  // ===== Resolution Operations (delegated to DisputeResolutionService) =====

  async resolve(
    id: string,
    resolveDisputeDto: ResolveDisputeDto,
    adminId: string,
  ): Promise<Dispute> {
    return this.resolutionService.resolve(id, resolveDisputeDto, adminId);
  }

  async close(id: string, adminId: string): Promise<Dispute> {
    return this.resolutionService.close(id, adminId);
  }

  // ===== Message Operations (delegated to DisputeMessageService) =====

  async addMessage(
    id: string,
    addMessageDto: AddMessageDto,
    userId: string,
  ): Promise<Dispute> {
    return this.messageService.addMessage(id, addMessageDto, userId);
  }

  // ===== Query Operations (delegated to DisputeQueryService) =====

  async findAll(
    query: QueryDisputeDto,
  ): Promise<{ data: Dispute[]; meta: any }> {
    return this.queryService.findAll(query);
  }

  async findById(id: string): Promise<Dispute> {
    return this.queryService.findById(id);
  }

  async findByUser(
    userId: string,
    query: QueryDisputeDto,
  ): Promise<{ data: Dispute[]; meta: any }> {
    return this.queryService.findByUser(userId, query);
  }

  async getStatistics(filters?: any): Promise<any> {
    return this.queryService.getStatistics(filters);
  }
}
