import { Injectable } from '@nestjs/common';
import { OrderDocument } from '../../../../database/schemas/order.schema';
import { UpdateDeliveryStatusDto } from '../dto';
import { CourierDeliveryAssignmentService } from './courier-delivery-assignment.service';
import { CourierDeliveryTrackingService } from './courier-delivery-tracking.service';
import { CourierDeliveryQueryService } from './courier-delivery-query.service';

/**
 * Courier Delivery Service - Facade
 * Delegates to specialized services for separation of concerns
 */
@Injectable()
export class CourierDeliveryService {
  constructor(
    private readonly assignmentService: CourierDeliveryAssignmentService,
    private readonly trackingService: CourierDeliveryTrackingService,
    private readonly queryService: CourierDeliveryQueryService,
  ) {}

  // ==================== Query Operations ====================

  async getActiveDeliveries(accountId: string): Promise<OrderDocument[]> {
    return this.queryService.getActiveDeliveries(accountId);
  }

  async getDeliveryHistory(
    accountId: string,
    limit: number = 50,
  ): Promise<OrderDocument[]> {
    return this.queryService.getDeliveryHistory(accountId, limit);
  }

  // ==================== Assignment Operations ====================

  async acceptOrder(
    accountId: string,
    orderId: string,
    notes?: string,
  ): Promise<OrderDocument> {
    return this.assignmentService.acceptOrder(accountId, orderId, notes);
  }

  async rejectOrder(
    accountId: string,
    orderId: string,
    reason: string,
  ): Promise<void> {
    return this.assignmentService.rejectOrder(accountId, orderId, reason);
  }

  // ==================== Tracking Operations ====================

  async updateDeliveryStatus(
    accountId: string,
    orderId: string,
    updateDto: UpdateDeliveryStatusDto,
  ): Promise<OrderDocument> {
    return this.trackingService.updateDeliveryStatus(
      accountId,
      orderId,
      updateDto,
    );
  }
}
