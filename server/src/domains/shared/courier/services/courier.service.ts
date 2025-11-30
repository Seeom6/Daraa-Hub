import { Injectable } from '@nestjs/common';
import { CourierProfileDocument } from '../../../../database/schemas/courier-profile.schema';
import { OrderDocument } from '../../../../database/schemas/order.schema';
import {
  UpdateCourierProfileDto,
  UpdateCourierStatusDto,
  UpdateLocationDto,
  UpdateDeliveryStatusDto,
} from '../dto';
import { CourierProfileService } from './courier-profile.service';
import { CourierDeliveryService } from './courier-delivery.service';
import { CourierEarningsService } from './courier-earnings.service';

/**
 * Courier Facade Service
 * Provides unified access to all courier sub-services
 * Maintains backward compatibility with existing code
 */
@Injectable()
export class CourierService {
  constructor(
    private readonly courierProfileService: CourierProfileService,
    private readonly courierDeliveryService: CourierDeliveryService,
    private readonly courierEarningsService: CourierEarningsService,
  ) {}

  // ==================== Profile Management ====================

  /**
   * Get courier profile by account ID
   */
  async getProfileByAccountId(
    accountId: string,
  ): Promise<CourierProfileDocument> {
    return this.courierProfileService.getProfileByAccountId(accountId);
  }

  /**
   * Get courier profile by courier ID
   */
  async getProfileById(courierId: string): Promise<CourierProfileDocument> {
    return this.courierProfileService.getProfileById(courierId);
  }

  /**
   * Update courier profile
   */
  async updateProfile(
    accountId: string,
    updateDto: UpdateCourierProfileDto,
  ): Promise<CourierProfileDocument> {
    return this.courierProfileService.updateProfile(accountId, updateDto);
  }

  /**
   * Update courier status (online/offline/busy/on_break)
   */
  async updateStatus(
    accountId: string,
    updateDto: UpdateCourierStatusDto,
  ): Promise<CourierProfileDocument> {
    return this.courierProfileService.updateStatus(accountId, updateDto);
  }

  /**
   * Update courier location
   */
  async updateLocation(
    accountId: string,
    updateDto: UpdateLocationDto,
  ): Promise<CourierProfileDocument> {
    return this.courierProfileService.updateLocation(accountId, updateDto);
  }

  // ==================== Delivery Management ====================

  /**
   * Get courier's active deliveries
   */
  async getActiveDeliveries(accountId: string): Promise<OrderDocument[]> {
    return this.courierDeliveryService.getActiveDeliveries(accountId);
  }

  /**
   * Get courier's delivery history
   */
  async getDeliveryHistory(
    accountId: string,
    limit: number = 50,
  ): Promise<OrderDocument[]> {
    return this.courierDeliveryService.getDeliveryHistory(accountId, limit);
  }

  /**
   * Accept assigned order
   */
  async acceptOrder(
    accountId: string,
    orderId: string,
    notes?: string,
  ): Promise<OrderDocument> {
    return this.courierDeliveryService.acceptOrder(accountId, orderId, notes);
  }

  /**
   * Reject assigned order
   */
  async rejectOrder(
    accountId: string,
    orderId: string,
    reason: string,
  ): Promise<void> {
    return this.courierDeliveryService.rejectOrder(accountId, orderId, reason);
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    accountId: string,
    orderId: string,
    updateDto: UpdateDeliveryStatusDto,
  ): Promise<OrderDocument> {
    return this.courierDeliveryService.updateDeliveryStatus(
      accountId,
      orderId,
      updateDto,
    );
  }

  // ==================== Earnings ====================

  /**
   * Get courier's earnings summary
   */
  async getEarningsSummary(accountId: string): Promise<any> {
    return this.courierEarningsService.getEarningsSummary(accountId);
  }

  // ==================== Discovery ====================

  /**
   * Find available couriers near a location
   */
  async findAvailableCouriers(
    longitude: number,
    latitude: number,
    maxDistance: number = 10000,
  ): Promise<CourierProfileDocument[]> {
    return this.courierProfileService.findAvailableCouriers(
      longitude,
      latitude,
      maxDistance,
    );
  }
}
