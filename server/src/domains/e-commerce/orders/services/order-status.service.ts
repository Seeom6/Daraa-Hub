import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { OrderDocument, OrderStatus, PaymentStatus } from '../../../../database/schemas/order.schema';
import { MovementType } from '../../../../database/schemas/inventory.schema';
import { UpdateOrderStatusDto, CancelOrderDto } from '../dto';
import { OrderRepository } from '../repositories/order.repository';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';

/**
 * Service responsible for order status management
 * Handles status transitions, cancellations, and inventory updates
 */
@Injectable()
export class OrderStatusService {
  private readonly logger = new Logger(OrderStatusService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly inventoryRepository: InventoryRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    updateDto: UpdateOrderStatusDto,
    updatedBy: string,
  ): Promise<OrderDocument> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    this.validateStatusTransition(order.orderStatus, updateDto.status);

    // Update status
    order.orderStatus = updateDto.status;

    // Add status history
    order.statusHistory.push({
      status: updateDto.status,
      timestamp: new Date(),
      updatedBy: new Types.ObjectId(updatedBy),
      notes: updateDto.notes,
    } as any);

    await order.save();

    this.logger.log(`Order ${orderId} status updated to ${updateDto.status} by ${updatedBy}`);

    // Emit event
    this.eventEmitter.emit('order.status_updated', {
      orderId,
      status: updateDto.status,
      updatedBy,
    });

    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(
    orderId: string,
    cancelDto: CancelOrderDto,
    cancelledBy: string,
  ): Promise<OrderDocument> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order can be cancelled
    if (
      order.orderStatus === OrderStatus.DELIVERED ||
      order.orderStatus === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    // Release reserved inventory
    for (const item of order.items) {
      const inventory = await this.inventoryRepository
        .getModel()
        .findOne({
          productId: item.productId,
          ...(item.variantId && { variantId: item.variantId }),
        })
        .exec();

      if (inventory) {
        // Release reserved quantity
        inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - item.quantity);
        inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;

        // Add movement record
        inventory.movements.push({
          type: MovementType.RETURN,
          quantity: item.quantity,
          reason: 'Order Cancelled',
          orderId: new Types.ObjectId(orderId),
          notes: `Order cancelled: ${cancelDto.reason}`,
          performedBy: new Types.ObjectId(cancelledBy),
          timestamp: new Date(),
        } as any);

        await inventory.save();
      }
    }

    // Update order status
    order.orderStatus = OrderStatus.CANCELLED;
    order.cancellationReason = cancelDto.reason;
    order.cancelledBy = new Types.ObjectId(cancelledBy);
    order.cancelledAt = new Date();

    // Add to status history
    order.statusHistory.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      updatedBy: new Types.ObjectId(cancelledBy),
      notes: `Cancelled: ${cancelDto.reason}`,
    } as any);

    await order.save();

    this.logger.log(`Order ${orderId} cancelled by ${cancelledBy}. Reason: ${cancelDto.reason}`);

    // Emit event
    this.eventEmitter.emit('order.cancelled', {
      orderId,
      reason: cancelDto.reason,
      cancelledBy,
    });

    return order;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKED_UP]: [OrderStatus.DELIVERING],
      [OrderStatus.DELIVERING]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}

