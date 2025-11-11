import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get current user's cart
   * GET /cart
   */
  @Get()
  async getCart(@CurrentUser() user: any) {
    const cart = await this.cartService.getCart(user.profileId);
    return {
      success: true,
      data: cart,
    };
  }

  /**
   * Add item to cart
   * POST /cart/items
   */
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async addToCart(@CurrentUser() user: any, @Body() addToCartDto: AddToCartDto) {
    const cart = await this.cartService.addToCart(user.profileId, addToCartDto);
    return {
      success: true,
      message: 'Item added to cart',
      data: cart,
    };
  }

  /**
   * Update cart item quantity
   * PUT /cart/items/:productId
   */
  @Put('items/:productId')
  async updateCartItem(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
    @Query('variantId') variantId: string | undefined,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateCartItem(
      user.profileId,
      productId,
      variantId,
      updateDto,
    );
    return {
      success: true,
      message: 'Cart item updated',
      data: cart,
    };
  }

  /**
   * Remove item from cart
   * DELETE /cart/items/:productId
   */
  @Delete('items/:productId')
  async removeFromCart(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
    @Query('variantId') variantId: string | undefined,
  ) {
    const cart = await this.cartService.removeFromCart(user.profileId, productId, variantId);
    return {
      success: true,
      message: 'Item removed from cart',
      data: cart,
    };
  }

  /**
   * Clear cart
   * DELETE /cart
   */
  @Delete()
  async clearCart(@CurrentUser() user: any) {
    const cart = await this.cartService.clearCart(user.profileId);
    return {
      success: true,
      message: 'Cart cleared',
      data: cart,
    };
  }
}

