import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../../../../database/schemas/cart.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class CartRepository extends BaseRepository<CartDocument> {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {
    super(cartModel);
  }

  /**
   * Find cart by customer ID
   */
  async findByCustomerId(customerId: string): Promise<CartDocument | null> {
    return this.cartModel
      .findOne({ customerId: new Types.ObjectId(customerId) })
      .populate('items.productId')
      .populate('items.variantId')
      .exec();
  }

  /**
   * Add item to cart
   */
  async addItem(
    customerId: string,
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<CartDocument> {
    const cart = await this.findByCustomerId(customerId);

    if (!cart) {
      // Create new cart
      return this.create({
        customerId: new Types.ObjectId(customerId),
        items: [
          {
            productId: new Types.ObjectId(productId),
            variantId: variantId ? new Types.ObjectId(variantId) : undefined,
            quantity,
          },
        ],
      } as any);
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      (item: any) =>
        item.productId.toString() === productId &&
        (!variantId || item.variantId?.toString() === variantId),
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: new Types.ObjectId(productId),
        variantId: variantId ? new Types.ObjectId(variantId) : undefined,
        quantity,
      } as any);
    }

    return cart.save();
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(
    customerId: string,
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<CartDocument | null> {
    const cart = await this.findByCustomerId(customerId);

    if (!cart) {
      return null;
    }

    const itemIndex = cart.items.findIndex(
      (item: any) =>
        item.productId.toString() === productId &&
        (!variantId || item.variantId?.toString() === variantId),
    );

    if (itemIndex === -1) {
      return null;
    }

    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    return cart.save();
  }

  /**
   * Remove item from cart
   */
  async removeItem(
    customerId: string,
    productId: string,
    variantId?: string,
  ): Promise<CartDocument | null> {
    const cart = await this.findByCustomerId(customerId);

    if (!cart) {
      return null;
    }

    cart.items = cart.items.filter(
      (item: any) =>
        !(
          item.productId.toString() === productId &&
          (!variantId || item.variantId?.toString() === variantId)
        ),
    );

    return cart.save();
  }

  /**
   * Clear cart
   */
  async clearCart(customerId: string): Promise<CartDocument | null> {
    const cart = await this.findByCustomerId(customerId);

    if (!cart) {
      return null;
    }

    cart.items = [];
    return cart.save();
  }

  /**
   * Get cart item count
   */
  async getItemCount(customerId: string): Promise<number> {
    const cart = await this.findByCustomerId(customerId);

    if (!cart) {
      return 0;
    }

    return cart.items.reduce((total: number, item: any) => total + item.quantity, 0);
  }

  /**
   * Merge carts (for when user logs in)
   */
  async mergeCarts(
    sourceCustomerId: string,
    targetCustomerId: string,
  ): Promise<CartDocument | null> {
    const sourceCart = await this.findByCustomerId(sourceCustomerId);
    const targetCart = await this.findByCustomerId(targetCustomerId);

    if (!sourceCart) {
      return targetCart;
    }

    if (!targetCart) {
      // Move source cart to target
      sourceCart.customerId = new Types.ObjectId(targetCustomerId);
      return sourceCart.save();
    }

    // Merge items
    for (const sourceItem of sourceCart.items) {
      const existingItemIndex = targetCart.items.findIndex(
        (item: any) =>
          item.productId.toString() === (sourceItem as any).productId.toString() &&
          (!sourceItem.variantId ||
            item.variantId?.toString() === (sourceItem as any).variantId?.toString()),
      );

      if (existingItemIndex > -1) {
        targetCart.items[existingItemIndex].quantity += (sourceItem as any).quantity;
      } else {
        targetCart.items.push(sourceItem);
      }
    }

    // Delete source cart
    await this.cartModel.findByIdAndDelete(sourceCart._id);

    return targetCart.save();
  }
}

