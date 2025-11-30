import { Injectable } from '@nestjs/common';
import { Return } from '../../../../database/schemas/return.schema';
import { CreateReturnDto } from '../dto/create-return.dto';
import { UpdateReturnDto } from '../dto/update-return.dto';
import { StoreResponseDto } from '../dto/store-response.dto';
import { AdminReviewDto } from '../dto/admin-review.dto';
import { QueryReturnDto } from '../dto/query-return.dto';
import { ReturnRequestService } from './return-request.service';
import { ReturnProcessingService } from './return-processing.service';
import { ReturnQueryService } from './return-query.service';

/**
 * Return Service - Facade Pattern
 * Delegates operations to specialized services
 */
@Injectable()
export class ReturnService {
  constructor(
    private readonly requestService: ReturnRequestService,
    private readonly processingService: ReturnProcessingService,
    private readonly queryService: ReturnQueryService,
  ) {}

  // ===== Request Operations (delegated to ReturnRequestService) =====

  async create(
    createReturnDto: CreateReturnDto,
    customerId: string,
  ): Promise<Return> {
    return this.requestService.create(createReturnDto, customerId);
  }

  async update(id: string, updateReturnDto: UpdateReturnDto): Promise<Return> {
    return this.requestService.update(id, updateReturnDto);
  }

  async storeRespond(
    id: string,
    storeResponseDto: StoreResponseDto,
    storeOwnerId: string,
  ): Promise<Return> {
    return this.requestService.storeRespond(id, storeResponseDto, storeOwnerId);
  }

  async adminReview(
    id: string,
    adminReviewDto: AdminReviewDto,
    adminId: string,
  ): Promise<Return> {
    return this.requestService.adminReview(id, adminReviewDto, adminId);
  }

  // ===== Processing Operations (delegated to ReturnProcessingService) =====

  async markAsPickedUp(id: string): Promise<Return> {
    return this.processingService.markAsPickedUp(id);
  }

  async markAsInspected(id: string): Promise<Return> {
    return this.processingService.markAsInspected(id);
  }

  async processRefund(id: string): Promise<Return> {
    return this.processingService.processRefund(id);
  }

  // ===== Query Operations (delegated to ReturnQueryService) =====

  async findAll(query: QueryReturnDto): Promise<{ data: Return[]; meta: any }> {
    return this.queryService.findAll(query);
  }

  async findById(id: string): Promise<Return> {
    return this.queryService.findById(id);
  }

  async findByCustomer(
    customerId: string,
    query: QueryReturnDto,
  ): Promise<{ data: Return[]; meta: any }> {
    return this.queryService.findByCustomer(customerId, query);
  }

  async getStatistics(filters?: any): Promise<any> {
    return this.queryService.getStatistics(filters);
  }
}
