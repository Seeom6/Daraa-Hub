import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { InventoryRepository } from '../repositories/inventory.repository';

/**
 * Service for stock reservation operations
 * Handles reserve and release operations for orders
 */
@Injectable()
export class InventoryReservationService {
  private readonly logger = new Logger(InventoryReservationService.name);

  constructor(private readonly inventoryRepository: InventoryRepository) {}

  /**
   * Reserve stock for an order
   */
  async reserveStock(
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<void> {
    const filter: any = { productId: new Types.ObjectId(productId) };
    if (variantId) {
      filter.variantId = new Types.ObjectId(variantId);
    }

    const inventory = await this.inventoryRepository.getModel().findOne(filter);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    if (inventory.availableQuantity < quantity) {
      throw new BadRequestException('Insufficient available stock');
    }

    inventory.reservedQuantity += quantity;
    await inventory.save();

    this.logger.log(
      `Stock reserved: ${quantity} units for product: ${productId}`,
    );
  }

  /**
   * Release reserved stock (e.g., when order is cancelled)
   */
  async releaseStock(
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<void> {
    const filter: any = { productId: new Types.ObjectId(productId) };
    if (variantId) {
      filter.variantId = new Types.ObjectId(variantId);
    }

    const inventory = await this.inventoryRepository.getModel().findOne(filter);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    inventory.reservedQuantity = Math.max(
      0,
      inventory.reservedQuantity - quantity,
    );
    await inventory.save();

    this.logger.log(
      `Stock released: ${quantity} units for product: ${productId}`,
    );
  }

  /**
   * Check if stock is available for reservation
   */
  async checkAvailability(
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<boolean> {
    const filter: any = { productId: new Types.ObjectId(productId) };
    if (variantId) {
      filter.variantId = new Types.ObjectId(variantId);
    }

    const inventory = await this.inventoryRepository.getModel().findOne(filter);
    if (!inventory) {
      return false;
    }

    return inventory.availableQuantity >= quantity;
  }

  /**
   * Get available quantity for a product
   */
  async getAvailableQuantity(
    productId: string,
    variantId?: string,
  ): Promise<number> {
    const filter: any = { productId: new Types.ObjectId(productId) };
    if (variantId) {
      filter.variantId = new Types.ObjectId(variantId);
    }

    const inventory = await this.inventoryRepository.getModel().findOne(filter);
    if (!inventory) {
      return 0;
    }

    return inventory.availableQuantity;
  }
}
