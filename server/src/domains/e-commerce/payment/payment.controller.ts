import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaymentService } from './services/payment.service';
import { ProcessPaymentDto, RefundPaymentDto } from './dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Process payment for order
   * POST /payments/process
   */
  @Post('process')
  @Roles('customer', 'store_owner', 'admin')
  @HttpCode(HttpStatus.OK)
  async processPayment(@CurrentUser() user: any, @Body() processDto: ProcessPaymentDto) {
    const payment = await this.paymentService.processPayment(processDto, user.userId);
    return {
      success: true,
      message: 'Payment processed successfully',
      data: payment,
    };
  }

  /**
   * Get all payments (Admin only)
   * GET /payments
   */
  @Get()
  @Roles('admin')
  async getAllPayments() {
    const payments = await this.paymentService.getAllPayments();
    return {
      success: true,
      data: payments,
    };
  }

  /**
   * Get customer's payments
   * GET /payments/my-payments
   */
  @Get('my-payments')
  @Roles('customer')
  async getMyPayments(@CurrentUser() user: any) {
    const payments = await this.paymentService.getCustomerPayments(user.profileId);
    return {
      success: true,
      data: payments,
    };
  }

  /**
   * Get store's payments
   * GET /payments/store-payments
   */
  @Get('store-payments')
  @Roles('store_owner')
  async getStorePayments(@CurrentUser() user: any) {
    const payments = await this.paymentService.getStorePayments(user.profileId);
    return {
      success: true,
      data: payments,
    };
  }

  /**
   * Get payment by order ID
   * GET /payments/order/:orderId
   */
  @Get('order/:orderId')
  @Roles('customer', 'store_owner', 'admin')
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    const payment = await this.paymentService.getPaymentByOrderId(orderId);
    return {
      success: true,
      data: payment,
    };
  }

  /**
   * Get payment by ID
   * GET /payments/:id
   */
  @Get(':id')
  @Roles('customer', 'store_owner', 'admin')
  async getPayment(@Param('id') id: string) {
    const payment = await this.paymentService.getPaymentById(id);
    return {
      success: true,
      data: payment,
    };
  }

  /**
   * Refund payment (Admin only)
   * POST /payments/:id/refund
   */
  @Post(':id/refund')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async refundPayment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() refundDto: RefundPaymentDto,
  ) {
    const payment = await this.paymentService.refundPayment(id, refundDto, user.userId);
    return {
      success: true,
      message: 'Payment refunded successfully',
      data: payment,
    };
  }
}

