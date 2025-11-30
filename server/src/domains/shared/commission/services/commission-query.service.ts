import { Injectable } from '@nestjs/common';
import {
  CommissionDocument,
  CommissionStatus,
} from '../../../../database/schemas/commission.schema';
import { CommissionConfigDocument } from '../../../../database/schemas/commission-config.schema';
import { CommissionRepository } from '../repositories/commission.repository';
import { CommissionConfigRepository } from '../repositories/commission-config.repository';
import {
  CreateCommissionConfigDto,
  UpdateCommissionConfigDto,
} from '../dto/commission.dto';

/**
 * Service for commission query and config operations
 * Handles queries, reports, and configuration management
 */
@Injectable()
export class CommissionQueryService {
  constructor(
    private readonly commissionRepo: CommissionRepository,
    private readonly configRepo: CommissionConfigRepository,
  ) {}

  // ==================== Queries ====================

  async getCommissionByOrderId(
    orderId: string,
  ): Promise<CommissionDocument | null> {
    return this.commissionRepo.findByOrderId(orderId);
  }

  async getStoreCommissions(
    storeAccountId: string,
    status?: CommissionStatus,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const commissions = await this.commissionRepo.findByStoreAccountId(
      storeAccountId,
      status,
      limit,
      skip,
    );
    return { data: commissions, page, limit };
  }

  async getStoreSummary(
    storeAccountId: string,
    startDate?: string,
    endDate?: string,
  ) {
    return this.commissionRepo.getStoreSummary(
      storeAccountId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  async getPlatformSummary(startDate?: string, endDate?: string) {
    return this.commissionRepo.getPlatformSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // ==================== Config Management ====================

  async createConfig(
    dto: CreateCommissionConfigDto,
    createdBy: string,
  ): Promise<CommissionConfigDocument> {
    return this.configRepo.create({
      ...dto,
      entityId: dto.entityId as any,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      createdBy: createdBy as any,
    });
  }

  async updateConfig(
    id: string,
    dto: UpdateCommissionConfigDto,
    updatedBy: string,
  ): Promise<CommissionConfigDocument | null> {
    return this.configRepo.update(id, {
      ...dto,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      updatedBy: updatedBy as any,
    });
  }

  async getConfig(id: string) {
    return this.configRepo.findById(id);
  }

  async getAllConfigs() {
    return this.configRepo.getAllActive();
  }

  async getGlobalConfig() {
    return this.configRepo.getGlobalConfig();
  }
}
