import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inventory, InventoryDocument, MovementType } from '../../../database/schemas/inventory.schema';
import { Product, ProductDocument, ProductStatus } from '../../../database/schemas/product.schema';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  StockMovementDto,
  QueryInventoryDto,
} from '../dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createInventoryDto: CreateInventoryDto, userId: string): Promise<InventoryDocument> {
    // Check if inventory already exists for this product/variant
    const existing = await this.inventoryModel
      .findOne({
        productId: createInventoryDto.productId,
        storeId: createInventoryDto.storeId,
        ...(createInventoryDto.variantId && { variantId: createInventoryDto.variantId }),
      })
      .exec();

    if (existing) {
      throw new ConflictException('Inventory already exists for this product');
    }

    // Verify product exists
    const product = await this.productModel.findById(createInventoryDto.productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const inventory = new this.inventoryModel({
      productId: new Types.ObjectId(createInventoryDto.productId),
      storeId: new Types.ObjectId(createInventoryDto.storeId),
      ...(createInventoryDto.variantId && { variantId: new Types.ObjectId(createInventoryDto.variantId) }),
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
    if (product.status === ProductStatus.OUT_OF_STOCK && saved.availableQuantity > 0) {
      product.status = ProductStatus.ACTIVE;
      await product.save();
    }

    this.logger.log(`Inventory created for product: ${createInventoryDto.productId}`);
    return saved;
  }

  async findAll(query: QueryInventoryDto): Promise<{ data: InventoryDocument[]; total: number; page: number; limit: number }> {
    const {
      storeId,
      productId,
      lowStock,
      outOfStock,
      page = 1,
      limit = 20,
      sortBy = 'availableQuantity',
      sortOrder = 'asc',
    } = query;

    const filter: any = {};

    if (storeId) {
      filter.storeId = new Types.ObjectId(storeId);
    }

    if (productId) {
      filter.productId = new Types.ObjectId(productId);
    }

    if (lowStock) {
      filter.$expr = { $lte: ['$availableQuantity', '$lowStockThreshold'] };
    }

    if (outOfStock) {
      filter.availableQuantity = 0;
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.inventoryModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('productId', 'name slug mainImage price')
        .populate('variantId', 'name attributes')
        .populate('storeId', 'storeName')
        .exec(),
      this.inventoryModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<InventoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid inventory ID');
    }

    const inventory = await this.inventoryModel
      .findById(id)
      .populate('productId', 'name slug mainImage price')
      .populate('variantId', 'name attributes')
      .populate('storeId', 'storeName')
      .exec();

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return inventory;
  }

  async findByProduct(productId: string, variantId?: string): Promise<InventoryDocument> {
    const filter: any = { productId: new Types.ObjectId(productId) };
    if (variantId) {
      filter.variantId = new Types.ObjectId(variantId);
    }

    const inventory = await this.inventoryModel.findOne(filter).exec();
    if (!inventory) {
      throw new NotFoundException('Inventory not found for this product');
    }

    return inventory;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto, userId: string): Promise<InventoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid inventory ID');
    }

    const inventory = await this.inventoryModel.findById(id).exec();
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    // If quantity is being updated, record the movement
    if (updateInventoryDto.quantity !== undefined && updateInventoryDto.quantity !== inventory.quantity) {
      const diff = updateInventoryDto.quantity - inventory.quantity;
      const movement = {
        type: diff > 0 ? MovementType.IN : MovementType.ADJUSTMENT,
        quantity: Math.abs(diff),
        reason: diff > 0 ? 'Stock added' : 'Stock adjustment',
        performedBy: new Types.ObjectId(userId),
        timestamp: new Date(),
      };

      inventory.movements.push(movement);
      inventory.lastRestocked = new Date();
    }

    Object.assign(inventory, updateInventoryDto);
    const updated = await inventory.save();

    // Check for low stock alert
    await this.checkLowStockAlert(updated);

    // Update product status
    await this.updateProductStatus(updated);

    this.logger.log(`Inventory updated: ${id}`);
    return updated;
  }

  async addStock(id: string, movementDto: StockMovementDto, userId: string): Promise<InventoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid inventory ID');
    }

    const inventory = await this.inventoryModel.findById(id).exec();
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    if (movementDto.type !== MovementType.IN && movementDto.type !== MovementType.RETURN) {
      throw new BadRequestException('Invalid movement type for adding stock');
    }

    inventory.quantity += movementDto.quantity;
    inventory.lastRestocked = new Date();

    inventory.movements.push({
      type: movementDto.type,
      quantity: movementDto.quantity,
      reason: movementDto.reason,
      orderId: movementDto.orderId ? new Types.ObjectId(movementDto.orderId) : undefined,
      performedBy: new Types.ObjectId(userId),
      timestamp: new Date(),
      notes: movementDto.notes,
    });

    const updated = await inventory.save();

    // Update product status
    await this.updateProductStatus(updated);

    this.logger.log(`Stock added to inventory: ${id}, quantity: ${movementDto.quantity}`);
    return updated;
  }

  async removeStock(id: string, movementDto: StockMovementDto, userId: string): Promise<InventoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid inventory ID');
    }

    const inventory = await this.inventoryModel.findById(id).exec();
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    if (movementDto.type !== MovementType.OUT && movementDto.type !== MovementType.ADJUSTMENT) {
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
      orderId: movementDto.orderId ? new Types.ObjectId(movementDto.orderId) : undefined,
      performedBy: new Types.ObjectId(userId),
      timestamp: new Date(),
      notes: movementDto.notes,
    });

    const updated = await inventory.save();

    // Check for low stock alert
    await this.checkLowStockAlert(updated);

    // Update product status
    await this.updateProductStatus(updated);

    this.logger.log(`Stock removed from inventory: ${id}, quantity: ${movementDto.quantity}`);
    return updated;
  }

  async reserveStock(productId: string, quantity: number, variantId?: string): Promise<void> {
    const filter: any = { productId: new Types.ObjectId(productId) };
    if (variantId) {
      filter.variantId = new Types.ObjectId(variantId);
    }

    const inventory = await this.inventoryModel.findOne(filter).exec();
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    if (inventory.availableQuantity < quantity) {
      throw new BadRequestException('Insufficient available stock');
    }

    inventory.reservedQuantity += quantity;
    await inventory.save();

    this.logger.log(`Stock reserved: ${quantity} units for product: ${productId}`);
  }

  async releaseStock(productId: string, quantity: number, variantId?: string): Promise<void> {
    const filter: any = { productId: new Types.ObjectId(productId) };
    if (variantId) {
      filter.variantId = new Types.ObjectId(variantId);
    }

    const inventory = await this.inventoryModel.findOne(filter).exec();
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);
    await inventory.save();

    this.logger.log(`Stock released: ${quantity} units for product: ${productId}`);
  }

  private async checkLowStockAlert(inventory: InventoryDocument): Promise<void> {
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

  private async updateProductStatus(inventory: InventoryDocument): Promise<void> {
    const product = await this.productModel.findById(inventory.productId).exec();
    if (!product) return;

    if (inventory.availableQuantity === 0 && product.status === ProductStatus.ACTIVE) {
      product.status = ProductStatus.OUT_OF_STOCK;
      await product.save();
      this.logger.log(`Product ${product._id} marked as out of stock`);
    } else if (inventory.availableQuantity > 0 && product.status === ProductStatus.OUT_OF_STOCK) {
      product.status = ProductStatus.ACTIVE;
      await product.save();
      this.logger.log(`Product ${product._id} marked as active`);
    }
  }
}

