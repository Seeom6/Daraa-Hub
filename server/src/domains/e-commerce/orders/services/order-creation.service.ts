import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderDocument, OrderStatus, PaymentStatus, OrderItem } from '../../../../database/schemas/order.schema';
import { CreateOrderDto } from '../dto';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../../cart/repositories/cart.repository';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';
import { StoreOwnerProfileRepository } from '../../../shared/accounts/repositories/store-owner-profile.repository';
import { StoreSettingsService } from '../../../shared/store-settings/services/store-settings.service';

/**
 * Service responsible for order creation
 * Handles cart validation, inventory reservation, and order creation
 */
@Injectable()
export class OrderCreationService {
  private readonly logger = new Logger(OrderCreationService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly storeOwnerProfileRepository: StoreOwnerProfileRepository,
    private readonly storeSettingsService: StoreSettingsService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create order from cart
   */
  async createOrder(customerId: string, createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const { storeId, paymentMethod, deliveryAddress, appliedCoupon, customerNotes, pointsToUse } =
      createOrderDto;

    // Get customer cart
    const cart = await this.cartRepository
      .getModel()
      .findOne({ customerId: new Types.ObjectId(customerId) })
      .populate('items.productId')
      .populate('items.variantId')
      .exec();

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Filter items for this store only
    const storeItems = cart.items.filter((item) => item.storeId.toString() === storeId);

    if (storeItems.length === 0) {
      throw new BadRequestException('No items from this store in cart');
    }

    // Validate store
    const store = await this.storeOwnerProfileRepository.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (!store.isStoreActive) {
      throw new BadRequestException('Store is not active');
    }

    // Prepare order items and validate inventory
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const cartItem of storeItems) {
      const product = cartItem.productId as any;
      const variant = cartItem.variantId as any;

      // Check inventory - use product._id since productId is populated
      const inventory = await this.inventoryRepository
        .getModel()
        .findOne({
          productId: product._id,
          ...(variant && { variantId: variant._id }),
        })
        .exec();

      if (!inventory || inventory.availableQuantity < cartItem.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      // Reserve inventory
      inventory.reservedQuantity += cartItem.quantity;
      inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;
      await inventory.save();

      const itemSubtotal = cartItem.price * cartItem.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        name: product.name,
        image: product.mainImage || product.images[0],
        sku: variant?.sku || product.sku,
        quantity: cartItem.quantity,
        price: cartItem.price,
        pointsPrice: cartItem.pointsPrice,
        subtotal: itemSubtotal,
      });
    }

    // Calculate totals
    const deliveryFee = await this.storeSettingsService.calculateShippingFee(
      storeId,
      deliveryAddress.city,
      subtotal,
    );
    const discount = 0; // TODO: Apply coupon if provided
    const tax = 0; // TODO: Calculate tax if applicable
    const total = subtotal + deliveryFee + tax - discount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await this.orderRepository.create({
      orderNumber,
      customerId: new Types.ObjectId(customerId),
      storeId: new Types.ObjectId(storeId),
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      tax,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? PaymentStatus.PENDING : PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      deliveryAddress,
      appliedCoupon: appliedCoupon ? new Types.ObjectId(appliedCoupon) : undefined,
      customerNotes,
      pointsUsed: pointsToUse || 0,
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          timestamp: new Date(),
          notes: 'Order created',
        },
      ],
    });

    // Remove items from cart
    cart.items = cart.items.filter((item) => item.storeId.toString() !== storeId);
    await cart.save();

    this.logger.log(`Order ${orderNumber} created for customer ${customerId}`);

    // Emit event
    this.eventEmitter.emit('order.created', {
      orderId: (order._id as Types.ObjectId).toString(),
      customerId,
      storeId,
      orderNumber,
      total,
    });

    return order;
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Get count of orders today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const todayOrdersCount = await this.orderRepository
      .getModel()
      .countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      })
      .exec();

    const sequence = (todayOrdersCount + 1).toString().padStart(4, '0');

    return `ORD-${year}${month}${day}-${sequence}`;
  }
}

