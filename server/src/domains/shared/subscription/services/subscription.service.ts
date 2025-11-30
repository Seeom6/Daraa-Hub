import { Injectable, Logger } from '@nestjs/common';
import {
  StoreSubscriptionDocument,
  SubscriptionStatus,
} from '../../../../database/schemas/store-subscription.schema';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto';
import { SubscriptionActivationService } from './subscription-activation.service';
import { SubscriptionManagementService } from './subscription-management.service';
import { SubscriptionQueryService } from './subscription-query.service';

/**
 * Subscription Service - Facade Pattern
 * Delegates operations to specialized services
 */
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly activationService: SubscriptionActivationService,
    private readonly managementService: SubscriptionManagementService,
    private readonly queryService: SubscriptionQueryService,
  ) {}

  // ===== Activation Operations (delegated to SubscriptionActivationService) =====

  async create(
    createDto: CreateSubscriptionDto,
    adminId: string,
  ): Promise<StoreSubscriptionDocument> {
    return this.activationService.create(createDto, adminId);
  }

  // ===== Management Operations (delegated to SubscriptionManagementService) =====

  async update(
    id: string,
    updateDto: UpdateSubscriptionDto,
    adminId: string,
  ): Promise<StoreSubscriptionDocument> {
    const subscription = await this.queryService.findOne(id);
    return this.managementService.update(subscription, updateDto, adminId);
  }

  async checkExpiredSubscriptions(): Promise<void> {
    return this.managementService.checkExpiredSubscriptions();
  }

  // ===== Query Operations (delegated to SubscriptionQueryService) =====

  async findOne(id: string): Promise<StoreSubscriptionDocument> {
    return this.queryService.findOne(id);
  }

  async getActiveSubscription(
    storeId: string,
  ): Promise<StoreSubscriptionDocument | null> {
    return this.queryService.getActiveSubscription(storeId);
  }

  async getStoreSubscriptions(
    storeId: string,
  ): Promise<StoreSubscriptionDocument[]> {
    return this.queryService.getStoreSubscriptions(storeId);
  }

  async findAll(filters?: {
    status?: SubscriptionStatus;
    storeId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: StoreSubscriptionDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryService.findAll(filters);
  }
}
