import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../../database/schemas/cart.schema';
import { Product, ProductDocument } from '../../database/schemas/product.schema';
import { ProductVariant, ProductVariantDocument } from '../../database/schemas/product-variant.schema';
import { Inventory, InventoryDocument } from '../../database/schemas/inventory.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name) private productVariantModel: Model<ProductVariantDocument>,
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
  ) {}

  /**
   * Get or create cart for customer
   */
  async getOrCreateCart(customerId: string): Promise<CartDocument> {
    let cart = await this.cartModel
      .findOne({ customerId: new Types.ObjectId(customerId) })
      .populate('items.productId', 'name slug price images status')
      .populate('items.variantId', 'name price images')
      .exec();

    if (!cart) {
      cart = await this.cartModel.create({
        customerId: new Types.ObjectId(customerId),
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
      });
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addToCart(customerId: string, addToCartDto: AddToCartDto): Promise<CartDocument> {
    const { productId, variantId, quantity, selectedOptions } = addToCartDto;

    // Validate product
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== 'active') {
      throw new BadRequestException('Product is not available');
    }

    // Validate variant if provided
    let variant: ProductVariantDocument | null = null;
    if (variantId) {
      variant = await this.productVariantModel.findById(variantId).exec();
      if (!variant || variant.productId.toString() !== productId) {
        throw new NotFoundException('Product variant not found');
      }
    }

    // Check inventory
    const inventory = await this.inventoryModel
      .findOne({
        productId: new Types.ObjectId(productId),
        ...(variantId && { variantId: new Types.ObjectId(variantId) }),
      })
      .exec();

    if (!inventory || inventory.availableQuantity < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(customerId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (variantId ? item.variantId?.toString() === variantId : !item.variantId),
    );

    const price = variant?.price || product.price;
    const pointsPrice = variant?.pointsPrice || product.pointsPrice;

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      
      // Check stock again
      if (inventory.availableQuantity < cart.items[existingItemIndex].quantity) {
        throw new BadRequestException('Insufficient stock for requested quantity');
      }
    } else {
      // Add new item
      cart.items.push({
        productId: new Types.ObjectId(productId),
        variantId: variantId ? new Types.ObjectId(variantId) : undefined,
        storeId: product.storeId,
        quantity,
        price,
        pointsPrice,
        selectedOptions,
        addedAt: new Date(),
      });
    }

    await cart.save();

    this.logger.log(`Added product ${productId} to cart for customer ${customerId}`);

    return this.getOrCreateCart(customerId);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    customerId: string,
    productId: string,
    variantId: string | undefined,
    updateDto: UpdateCartItemDto,
  ): Promise<CartDocument> {
    // Get cart without populate to avoid issues with ObjectId comparison
    let cart = await this.cartModel
      .findOne({ customerId: new Types.ObjectId(customerId) })
      .exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (variantId ? item.variantId?.toString() === variantId : !item.variantId),
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    // Check inventory
    const inventory = await this.inventoryModel
      .findOne({
        productId: new Types.ObjectId(productId),
        ...(variantId && { variantId: new Types.ObjectId(variantId) }),
      })
      .exec();

    if (!inventory || inventory.availableQuantity < updateDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    cart.items[itemIndex].quantity = updateDto.quantity;
    await cart.save();

    this.logger.log(`Updated cart item ${productId} for customer ${customerId}`);

    return this.getOrCreateCart(customerId);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(
    customerId: string,
    productId: string,
    variantId?: string,
  ): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(customerId);

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          (variantId ? item.variantId?.toString() === variantId : !item.variantId)
        ),
    );

    await cart.save();

    this.logger.log(`Removed product ${productId} from cart for customer ${customerId}`);

    return this.getOrCreateCart(customerId);
  }

  /**
   * Clear cart
   */
  async clearCart(customerId: string): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(customerId);
    cart.items = [];
    await cart.save();

    this.logger.log(`Cleared cart for customer ${customerId}`);

    return cart;
  }

  /**
   * Get cart
   */
  async getCart(customerId: string): Promise<CartDocument> {
    return this.getOrCreateCart(customerId);
  }
}

