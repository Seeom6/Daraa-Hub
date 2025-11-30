import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  InventoryDocument,
  MovementType,
} from '../../../../database/schemas/inventory.schema';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from '../../../../database/schemas/product.schema';
import { StockMovementDto } from '../dto';
import { InventoryRepository } from '../repositories/inventory.repository';

@Injectable()
export class InventoryMovementService {
  private readonly logger = new Logger(InventoryMovementService.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addStock(
    id: string,
    movementDto: StockMovementDto,
    userId: string,
  ): Promise<InventoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid inventory ID');
    }

    const inventory = await this.inventoryRepository.getModel().findById(id);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    if (
      movementDto.type !== MovementType.IN &&
      movementDto.type !== MovementType.RETURN
    ) {
      throw new BadRequestException('Invalid movement type for adding stock');
    }

    inventory.quantity += movementDto.quantity;
    inventory.lastRestocked = new Date();

    inventory.movements.push({
      type: movementDto.type,
      quantity: movementDto.quantity,
      reason: movementDto.reason,
      orderId: movementDto.orderId
        ? new Types.ObjectId(movementDto.orderId)
        : undefined,
      performedBy: new Types.ObjectId(userId),
      timestamp: new Date(),
      notes: movementDto.notes,
    });

    const updated = await inventory.save();
    await this.updateProductStatus(updated);

    this.logger.log(
      `Stock added to inventory: ${id}, quantity: ${movementDto.quantity}`,
    );
    return updated;
  }

  async removeStock(
    id: string,
    movementDto: StockMovementDto,
    userId: string,
  ): Promise<InventoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid inventory ID');
    }

    const inventory = await this.inventoryRepository.getModel().findById(id);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    if (
      movementDto.type !== MovementType.OUT &&
      movementDto.type !== MovementType.ADJUSTMENT
    ) {
      throw new BadRequestException('Invalid movement type for removing stock');
    }

    if (inventory.quantity < movementDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    inventory.quantity -= movementDto.quantity;

    inventory.movements.push({
      type: movementDto.type,
      quantity: movementDto.quantity,
      reason: movementDto.reason,
      orderId: movementDto.orderId
        ? new Types.ObjectId(movementDto.orderId)
        : undefined,
      performedBy: new Types.ObjectId(userId),
      timestamp: new Date(),
      notes: movementDto.notes,
    });

    const updated = await inventory.save();
    await this.checkLowStockAlert(updated);
    await this.updateProductStatus(updated);

    this.logger.log(
      `Stock removed from inventory: ${id}, quantity: ${movementDto.quantity}`,
    );
    return updated;
  }

  async checkLowStockAlert(inventory: InventoryDocument): Promise<void> {
    if (inventory.availableQuantity <= inventory.lowStockThreshold) {
      this.eventEmitter.emit('inventory.low-stock', {
        inventoryId: inventory._id,
        productId: inventory.productId,
        storeId: inventory.storeId,
        availableQuantity: inventory.availableQuantity,
        lowStockThreshold: inventory.lowStockThreshold,
      });

      this.logger.warn(
        `Low stock alert: Product ${inventory.productId}, Available: ${inventory.availableQuantity}, Threshold: ${inventory.lowStockThreshold}`,
      );
    }
  }

  async updateProductStatus(inventory: InventoryDocument): Promise<void> {
    const product = await this.productModel.findById(inventory.productId);
    if (!product) return;

    if (
      inventory.availableQuantity === 0 &&
      product.status === ProductStatus.ACTIVE
    ) {
      product.status = ProductStatus.OUT_OF_STOCK;
      await product.save();
      this.logger.log(`Product ${product._id} marked as out of stock`);
    } else if (
      inventory.availableQuantity > 0 &&
      product.status === ProductStatus.OUT_OF_STOCK
    ) {
      product.status = ProductStatus.ACTIVE;
      await product.save();
      this.logger.log(`Product ${product._id} marked as active`);
    }
  }
}
