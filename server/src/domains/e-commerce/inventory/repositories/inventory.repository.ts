import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from '../../../../database/schemas/inventory.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class InventoryRepository extends BaseRepository<InventoryDocument> {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
  ) {
    super(inventoryModel);
  }

  /**
   * Find inventory by product ID
   */
  async findByProductId(productId: string): Promise<InventoryDocument | null> {
    return this.findOne({ productId: new Types.ObjectId(productId) });
  }

  /**
   * Find inventory by variant ID
   */
  async findByVariantId(variantId: string): Promise<InventoryDocument | null> {
    return this.findOne({ variantId: new Types.ObjectId(variantId) });
  }

  /**
   * Update stock quantity
   */
  async updateStock(
    inventoryId: string,
    quantity: number,
    type: 'add' | 'subtract',
  ): Promise<InventoryDocument | null> {
    const inventory = await this.findById(inventoryId);

    if (!inventory) {
      return null;
    }

    if (type === 'add') {
      inventory.quantity += quantity;
    } else {
      inventory.quantity -= quantity;
    }

    inventory.lastRestocked = new Date();
    return inventory.save();
  }

  /**
   * Reserve stock
   */
  async reserveStock(
    inventoryId: string,
    quantity: number,
  ): Promise<InventoryDocument | null> {
    return this.inventoryModel
      .findByIdAndUpdate(
        inventoryId,
        {
          $inc: { quantity: -quantity, reserved: quantity },
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Release reserved stock
   */
  async releaseReservedStock(
    inventoryId: string,
    quantity: number,
  ): Promise<InventoryDocument | null> {
    return this.inventoryModel
      .findByIdAndUpdate(
        inventoryId,
        {
          $inc: { quantity: quantity, reserved: -quantity },
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(
    storeId: string,
    threshold: number = 10,
  ): Promise<InventoryDocument[]> {
    return this.inventoryModel
      .find({
        storeId: new Types.ObjectId(storeId),
        quantity: { $lte: threshold },
      })
      .populate('productId')
      .populate('variantId')
      .exec();
  }

  /**
   * Get out of stock items
   */
  async getOutOfStockItems(storeId: string): Promise<InventoryDocument[]> {
    return this.inventoryModel
      .find({
        storeId: new Types.ObjectId(storeId),
        quantity: 0,
      })
      .populate('productId')
      .populate('variantId')
      .exec();
  }

  /**
   * Check stock availability
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

    const inventory = await this.findOne(filter);

    if (!inventory) {
      return false;
    }

    return inventory.quantity >= quantity;
  }
}

