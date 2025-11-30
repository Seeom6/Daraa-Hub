import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CartDocument } from '../../../database/schemas/cart.schema';
import { ProductVariantDocument } from '../../../database/schemas/product-variant.schema';
import { CartRepository } from './repositories/cart.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { ProductVariantRepository } from '../products/repositories/product-variant.repository';
import { InventoryRepository } from '../inventory/repositories/inventory.repository';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  /**
   * Get or create cart for customer
   */
  async getOrCreateCart(customerId: string): Promise<CartDocument> {
    let cart = await this.cartRepository.findByCustomerId(customerId);

    if (!cart) {
      cart = await this.cartRepository.create({
        customerId: new Types.ObjectId(customerId),
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
      } as any);
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addToCart(
    customerId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartDocument> {
    const { productId, variantId, quantity, selectedOptions } = addToCartDto;

    // Validate product
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== 'active') {
      throw new BadRequestException('Product is not available');
    }

    // Validate variant if provided
    let variant: ProductVariantDocument | null = null;
    if (variantId) {
      variant = await this.productVariantRepository.findById(variantId);
      if (!variant || variant.productId.toString() !== productId) {
        throw new NotFoundException('Product variant not found');
      }
    }

    // Check inventory availability
    const hasStock = await this.inventoryRepository.checkAvailability(
      productId,
      quantity,
      variantId,
    );

    if (!hasStock) {
      throw new BadRequestException('Insufficient stock');
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(customerId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (variantId
          ? item.variantId?.toString() === variantId
          : !item.variantId),
    );

    const price = variant?.price || product.price;
    const pointsPrice = variant?.pointsPrice || product.pointsPrice;

    if (existingItemIndex > -1) {
      // Update quantity - need to validate total quantity doesn't exceed stock
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      const stockAvailable = await this.inventoryRepository.checkAvailability(
        productId,
        newQuantity,
        variantId,
      );
      if (!stockAvailable) {
        throw new BadRequestException(
          'Insufficient stock for requested quantity',
        );
      }
      cart.items[existingItemIndex].quantity = newQuantity;
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

    this.logger.log(
      `Added product ${productId} to cart for customer ${customerId}`,
    );

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
    // Check inventory availability
    const hasStock = await this.inventoryRepository.checkAvailability(
      productId,
      updateDto.quantity,
      variantId,
    );

    if (!hasStock) {
      throw new BadRequestException('Insufficient stock');
    }

    const updatedCart = await this.cartRepository.updateItemQuantity(
      customerId,
      productId,
      updateDto.quantity,
      variantId,
    );

    if (!updatedCart) {
      throw new NotFoundException('Cart or item not found');
    }

    this.logger.log(
      `Updated cart item ${productId} for customer ${customerId}`,
    );

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
    await this.cartRepository.removeItem(customerId, productId, variantId);

    this.logger.log(
      `Removed product ${productId} from cart for customer ${customerId}`,
    );

    return this.getOrCreateCart(customerId);
  }

  /**
   * Clear cart
   */
  async clearCart(customerId: string): Promise<CartDocument> {
    const cart = await this.cartRepository.clearCart(customerId);

    this.logger.log(`Cleared cart for customer ${customerId}`);

    return cart || this.getOrCreateCart(customerId);
  }

  /**
   * Get cart
   */
  async getCart(customerId: string): Promise<CartDocument> {
    return this.getOrCreateCart(customerId);
  }
}
