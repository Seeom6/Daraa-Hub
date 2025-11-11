import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderDocument, OrderStatus, PaymentStatus, OrderItem } from '../../../../database/schemas/order.schema';
import { MovementType } from '../../../../database/schemas/inventory.schema';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto } from '../dto';
import { PaymentService } from '../../payment/services/payment.service';
import { StoreSettingsService } from '../../../shared/store-settings/services/store-settings.service';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../../cart/repositories/cart.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { ProductVariantRepository } from '../../products/repositories/product-variant.repository';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';
import { StoreOwnerProfileRepository } from '../../../shared/accounts/repositories/store-owner-profile.repository';
import { CustomerProfileRepository } from '../../../shared/accounts/repositories/customer-profile.repository';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly storeOwnerProfileRepository: StoreOwnerProfileRepository,
    private readonly customerProfileRepository: CustomerProfileRepository,
    private eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
    private storeSettingsService: StoreSettingsService,
  ) {}

  /**
   * Create order from cart
   */
  async createOrder(customerId: string, createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const { storeId, paymentMethod, deliveryAddress, appliedCoupon, customerNotes, pointsToUse } = createOrderDto;

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
    const storeItems = cart.items.filter(item => item.storeId.toString() === storeId);

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
    cart.items = cart.items.filter(item => item.storeId.toString() !== storeId);
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
   * Get order by ID (without populate)
   */
  async findOne(orderId: string): Promise<OrderDocument> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Get order by ID with populated fields (for display purposes)
   */
  async findOneWithDetails(orderId: string): Promise<OrderDocument> {
    const order = await (this.orderRepository)
      .getModel()
      .findById(orderId)
      .populate('customerId', 'accountId')
      .populate('storeId', 'businessName')
      .populate('courierId', 'accountId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(
    customerId: string,
    filters: { status?: OrderStatus; page?: number; limit?: number },
  ): Promise<{ data: OrderDocument[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = filters;

    const query: any = { customerId: new Types.ObjectId(customerId) };
    if (status) {
      query.orderStatus = status;
    }

    const [data, total] = await Promise.all([
      (this.orderRepository)
        .getModel()
        .find(query)
        .populate('storeId', 'businessName storeLogo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        ,
      this.orderRepository.count(query),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get store orders
   */
  async getStoreOrders(
    storeId: string,
    filters: { status?: OrderStatus; page?: number; limit?: number },
  ): Promise<{ data: OrderDocument[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = filters;

    const query: any = { storeId: new Types.ObjectId(storeId) };
    if (status) {
      query.orderStatus = status;
    }

    const [data, total] = await Promise.all([
      (this.orderRepository)
        .getModel()
        .find(query)
        .populate('customerId')
        .populate('courierId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        ,
      this.orderRepository.count(query),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    updateDto: UpdateOrderStatusDto,
    updatedBy: string,
  ): Promise<OrderDocument> {
    const order = await this.findOne(orderId);

    // Validate status transition
    this.validateStatusTransition(order.orderStatus, updateDto.status);

    order.orderStatus = updateDto.status;
    order.statusHistory.push({
      status: updateDto.status,
      timestamp: new Date(),
      updatedBy: new Types.ObjectId(updatedBy),
      notes: updateDto.notes,
    });

    // When order is delivered with cash payment, confirm payment through PaymentService
    if (updateDto.status === OrderStatus.DELIVERED && order.paymentMethod === 'cash') {
      try {
        // Confirm cash payment - this will emit payment.completed event
        await this.paymentService.confirmCashPaymentByOrderId(orderId, updatedBy);
        this.logger.log(`Cash payment confirmed for order ${orderId}`);
      } catch (error) {
        this.logger.error(`Failed to confirm cash payment for order ${orderId}: ${error.message}`);
        // Continue with order update even if payment confirmation fails
      }
      order.actualDeliveryTime = new Date();
    }

    // Deduct inventory when order is delivered
    if (updateDto.status === OrderStatus.DELIVERED) {
      await this.deductInventoryOnDelivery(order);
    }

    await order.save();

    this.logger.log(`Order ${order.orderNumber} status updated to ${updateDto.status}`);

    // Emit event
    this.eventEmitter.emit('order.status_updated', {
      orderId: (order._id as Types.ObjectId).toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId.toString(),
      storeId: order.storeId.toString(),
      oldStatus: order.orderStatus,
      newStatus: updateDto.status,
      notes: updateDto.notes,
    });

    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(
    orderId: string,
    cancelDto: CancelOrderDto,
    cancelledBy: string,
  ): Promise<OrderDocument> {
    const order = await this.findOne(orderId);

    // Only allow cancellation for pending/confirmed orders
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.orderStatus)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.orderStatus = OrderStatus.CANCELLED;
    order.cancellationReason = cancelDto.reason;
    order.cancelledBy = new Types.ObjectId(cancelledBy);
    order.cancelledAt = new Date();
    order.statusHistory.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      updatedBy: new Types.ObjectId(cancelledBy),
      notes: cancelDto.reason,
    });

    await order.save();

    // Release reserved inventory
    for (const item of order.items) {
      const inventory = await this.inventoryRepository
        .getModel()
        .findOne({
          productId: item.productId,
          ...(item.variantId && { variantId: item.variantId }),
        })
        .exec();

      if (inventory) {
        inventory.reservedQuantity -= item.quantity;
        inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;
        await inventory.save();
      }
    }

    this.logger.log(`Order ${order.orderNumber} cancelled`);

    // Emit event
    this.eventEmitter.emit('order.cancelled', {
      orderId: (order._id as Types.ObjectId).toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId.toString(),
      storeId: order.storeId.toString(),
      reason: cancelDto.reason,
    });

    return order;
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Count orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await this.orderRepository
      .count({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      })
      ;

    const orderNum = (count + 1).toString().padStart(4, '0');
    return `ORD-${dateStr}-${orderNum}`;
  }

  /**
   * Deduct inventory when order is delivered
   */
  private async deductInventoryOnDelivery(order: OrderDocument): Promise<void> {
    this.logger.log(`Deducting inventory for delivered order ${order.orderNumber}`);

    for (const item of order.items) {
      const inventory = await this.inventoryRepository
        .getModel()
        .findOne({
          productId: item.productId,
          ...(item.variantId && { variantId: item.variantId }),
        })
        .exec();

      if (inventory) {
        // Deduct from reserved quantity and total quantity
        inventory.reservedQuantity -= item.quantity;
        inventory.quantity -= item.quantity;
        inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;

        // Add movement record
        inventory.movements.push({
          type: MovementType.OUT,
          quantity: -item.quantity,
          reason: `Order ${order.orderNumber} delivered`,
          orderId: order._id as Types.ObjectId,
          performedBy: order.customerId,
          timestamp: new Date(),
        });

        await inventory.save();
        this.logger.log(`Deducted ${item.quantity} units from inventory for product ${item.productId}`);
      }
    }
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKED_UP]: [OrderStatus.DELIVERING],
      [OrderStatus.DELIVERING]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}

