import { Injectable, Logger } from '@nestjs/common';
import { CourierProfileDocument } from '../../../../database/schemas/courier-profile.schema';
import { OrderDocument } from '../../../../database/schemas/order.schema';
import { CourierAssignmentService } from './courier-assignment.service';
import { CourierSuspensionService } from './courier-suspension.service';
import { CourierStatsService } from './courier-stats.service';

/**
 * Courier Admin Service - Facade Pattern
 * Delegates to specialized services: CourierAssignmentService, CourierSuspensionService, CourierStatsService
 */
@Injectable()
export class CourierAdminService {
  private readonly logger = new Logger(CourierAdminService.name);

  constructor(
    private readonly assignmentService: CourierAssignmentService,
    private readonly suspensionService: CourierSuspensionService,
    private readonly statsService: CourierStatsService,
  ) {}

  // ==================== Query Operations (delegated to StatsService) ====================

  async getAllCouriers(filters: {
    status?: string;
    verificationStatus?: string;
    limit?: number;
  }): Promise<CourierProfileDocument[]> {
    return this.statsService.getAllCouriers(filters);
  }

  async getCourierStatistics(courierId: string): Promise<any> {
    return this.statsService.getCourierStatistics(courierId);
  }

  // ==================== Assignment Operations (delegated to AssignmentService) ====================

  async assignOrderToCourier(
    orderId: string,
    courierId: string,
    assignedBy: string,
  ): Promise<OrderDocument> {
    return this.assignmentService.assignOrderToCourier(
      orderId,
      courierId,
      assignedBy,
    );
  }

  async findAvailableCouriersForOrder(
    orderId: string,
  ): Promise<CourierProfileDocument[]> {
    return this.assignmentService.findAvailableCouriersForOrder(orderId);
  }

  // ==================== Suspension Operations (delegated to SuspensionService) ====================

  async suspendCourier(
    courierId: string,
    suspendedBy: string,
    reason: string,
  ): Promise<CourierProfileDocument> {
    return this.suspensionService.suspendCourier(
      courierId,
      suspendedBy,
      reason,
    );
  }

  async unsuspendCourier(courierId: string): Promise<CourierProfileDocument> {
    return this.suspensionService.unsuspendCourier(courierId);
  }

  async updateCommissionRate(
    courierId: string,
    commissionRate: number,
  ): Promise<CourierProfileDocument> {
    return this.suspensionService.updateCommissionRate(
      courierId,
      commissionRate,
    );
  }
}
