import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  InventoryDocument,
  MovementType,
} from '../../../../database/schemas/inventory.schema';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from '../../../../database/schemas/product.schema';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  StockMovementDto,
  QueryInventoryDto,
} from '../dto';
import { InventoryRepository } from '../repositories/inventory.repository';
import { InventoryMovementService } from './inventory-movement.service';
import { InventoryReservationService } from './inventory-reservation.service';
import { InventoryQueryService } from './inventory-query.service';

/**
 * Inventory Service - Facade Pattern
 * Delegates operations to specialized services
 */
@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly movementService: InventoryMovementService,
    private readonly reservationService: InventoryReservationService,
    private readonly queryService: InventoryQueryService,
  ) {}

  async create(
    createInventoryDto: CreateInventoryDto,
    userId: string,
  ): Promise<InventoryDocument> {
    // Check if inventory already exists for this product/variant
    const existing = await this.inventoryRepository.getModel().findOne({
      productId: createInventoryDto.productId,
      storeId: createInventoryDto.storeId,
      ...(createInventoryDto.variantId && {
        variantId: createInventoryDto.variantId,
      }),
    });
    if (existing) {
      throw new ConflictException('Inventory already exists for this product');
    }

    // Verify product exists
    const product = await this.productModel.findById(
      createInventoryDto.productId,
    );
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const InventoryModel = this.inventoryRepository.getModel();
    const inventory = new InventoryModel({
      productId: new Types.ObjectId(createInventoryDto.productId),
      storeId: new Types.ObjectId(createInventoryDto.storeId),
      ...(createInventoryDto.variantId && {
        variantId: new Types.ObjectId(createInventoryDto.variantId),
      }),
      quantity: createInventoryDto.quantity,
      lowStockThreshold: createInventoryDto.lowStockThreshold,
      reorderPoint: createInventoryDto.reorderPoint,
      reorderQuantity: createInventoryDto.reorderQuantity,
      availableQuantity: createInventoryDto.quantity,
      lastRestocked: new Date(),
      movements: [
        {
          type: MovementType.IN,
          quantity: createInventoryDto.quantity,
          reason: 'Initial stock',
          performedBy: new Types.ObjectId(userId),
          timestamp: new Date(),
        },
      ],
    });

    const saved = await inventory.save();

    // Update product status if it was out of stock
    if (
      product.status === ProductStatus.OUT_OF_STOCK &&
      saved.availableQuantity > 0
    ) {
      product.status = ProductStatus.ACTIVE;
      await product.save();
    }

    this.logger.log(
      `Inventory created for product: ${createInventoryDto.productId}`,
    );
    return saved;
  }

  // ===== Query Operations (delegated to InventoryQueryService) =====

  async findAll(query: QueryInventoryDto): Promise<{
    data: InventoryDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryService.findAll(query);
  }

  async findOne(id: string): Promise<InventoryDocument> {
    return this.queryService.findOne(id);
  }

  async findByProduct(
    productId: string,
    variantId?: string,
  ): Promise<InventoryDocument> {
    return this.queryService.findByProduct(productId, variantId);
  }

  // ===== Update with movement tracking =====

  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
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
      updateInventoryDto.quantity !== undefined &&
      updateInventoryDto.quantity !== inventory.quantity
    ) {
      const diff = updateInventoryDto.quantity - inventory.quantity;
      inventory.movements.push({
        type: diff > 0 ? MovementType.IN : MovementType.ADJUSTMENT,
        quantity: Math.abs(diff),
        reason: diff > 0 ? 'Stock added' : 'Stock adjustment',
        performedBy: new Types.ObjectId(userId),
        timestamp: new Date(),
      });
      inventory.lastRestocked = new Date();
    }

    Object.assign(inventory, updateInventoryDto);
    const updated = await inventory.save();

    await this.movementService.checkLowStockAlert(updated);
    await this.movementService.updateProductStatus(updated);

    this.logger.log(`Inventory updated: ${id}`);
    return updated;
  }

  // ===== Stock Movement Operations (delegated to InventoryMovementService) =====

  async addStock(
    id: string,
    movementDto: StockMovementDto,
    userId: string,
  ): Promise<InventoryDocument> {
    return this.movementService.addStock(id, movementDto, userId);
  }

  async removeStock(
    id: string,
    movementDto: StockMovementDto,
    userId: string,
  ): Promise<InventoryDocument> {
    return this.movementService.removeStock(id, movementDto, userId);
  }

  // ===== Reservation Operations (delegated to InventoryReservationService) =====

  async reserveStock(
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<void> {
    return this.reservationService.reserveStock(productId, quantity, variantId);
  }

  async releaseStock(
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<void> {
    return this.reservationService.releaseStock(productId, quantity, variantId);
  }

  async checkAvailability(
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<boolean> {
    return this.reservationService.checkAvailability(
      productId,
      quantity,
      variantId,
    );
  }
}
