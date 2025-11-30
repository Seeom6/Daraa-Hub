import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { InventoryDocument } from '../../../../database/schemas/inventory.schema';
import { QueryInventoryDto } from '../dto';
import { InventoryRepository } from '../repositories/inventory.repository';

/**
 * Service for inventory query operations
 * Handles search, filtering, and retrieval
 */
@Injectable()
export class InventoryQueryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async findAll(query: QueryInventoryDto): Promise<{
    data: InventoryDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
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
      this.inventoryRepository
        .getModel()
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('productId', 'name slug mainImage price')
        .populate('variantId', 'name attributes')
        .populate('storeId', 'storeName'),
      this.inventoryRepository.count(filter),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<InventoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid inventory ID');
    }

    const inventory = await this.inventoryRepository
      .getModel()
      .findById(id)
      .populate('productId', 'name slug mainImage price')
      .populate('variantId', 'name attributes')
      .populate('storeId', 'storeName');

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return inventory;
  }

  async findByProduct(
    productId: string,
    variantId?: string,
  ): Promise<InventoryDocument> {
    const filter: any = { productId: new Types.ObjectId(productId) };
    if (variantId) {
      filter.variantId = new Types.ObjectId(variantId);
    }

    const inventory = await this.inventoryRepository.getModel().findOne(filter);
    if (!inventory) {
      throw new NotFoundException('Inventory not found for this product');
    }

    return inventory;
  }

  async findByStore(storeId: string): Promise<InventoryDocument[]> {
    return this.inventoryRepository
      .getModel()
      .find({ storeId: new Types.ObjectId(storeId) })
      .populate('productId', 'name slug mainImage price')
      .populate('variantId', 'name attributes');
  }

  async getLowStockItems(storeId: string): Promise<InventoryDocument[]> {
    return this.inventoryRepository
      .getModel()
      .find({
        storeId: new Types.ObjectId(storeId),
        $expr: { $lte: ['$availableQuantity', '$lowStockThreshold'] },
      })
      .populate('productId', 'name slug mainImage price');
  }

  async getOutOfStockItems(storeId: string): Promise<InventoryDocument[]> {
    return this.inventoryRepository
      .getModel()
      .find({
        storeId: new Types.ObjectId(storeId),
        availableQuantity: 0,
      })
      .populate('productId', 'name slug mainImage price');
  }
}
