import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OfferService } from '../services/offer.service';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';
import { QueryOfferDto } from '../dto/query-offer.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  /**
   * Get all offers (public with filters)
   * GET /offers
   */
  @Get()
  async getAllOffers(@Query() queryDto: QueryOfferDto) {
    const result = await this.offerService.findAll(queryDto);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get offer by ID
   * GET /offers/:id
   */
  @Get(':id')
  async getOffer(@Param('id') id: string) {
    const offer = await this.offerService.findOne(id);
    return {
      success: true,
      data: offer,
    };
  }

  /**
   * Get active offers for a store
   * GET /offers/store/:storeId/active
   */
  @Get('store/:storeId/active')
  async getActiveOffers(@Param('storeId') storeId: string) {
    const offers = await this.offerService.getActiveOffers(storeId);
    return {
      success: true,
      data: offers,
    };
  }

  /**
   * Get offers for a product
   * GET /offers/product/:productId
   */
  @Get('product/:productId')
  async getOffersForProduct(@Param('productId') productId: string) {
    const offers = await this.offerService.getOffersForProduct(productId);
    return {
      success: true,
      data: offers,
    };
  }

  /**
   * Store Owner: Create offer
   * POST /offers/store
   */
  @Post('store')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async createOffer(@CurrentUser() user: any, @Body() createDto: CreateOfferDto) {
    const offer = await this.offerService.create(createDto, user.profileId);
    return {
      success: true,
      message: 'Offer created successfully',
      data: offer,
    };
  }

  /**
   * Store Owner: Get my offers
   * GET /offers/store/my
   */
  @Get('store/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async getMyOffers(@CurrentUser() user: any, @Query() queryDto: QueryOfferDto) {
    queryDto.storeId = user.profileId;
    const result = await this.offerService.findAll(queryDto);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Store Owner: Update offer
   * PUT /offers/store/:id
   */
  @Put('store/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async updateOffer(@CurrentUser() user: any, @Param('id') id: string, @Body() updateDto: UpdateOfferDto) {
    const offer = await this.offerService.update(id, updateDto, user.profileId);
    return {
      success: true,
      message: 'Offer updated successfully',
      data: offer,
    };
  }

  /**
   * Store Owner: Delete offer
   * DELETE /offers/store/:id
   */
  @Delete('store/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async deleteOffer(@CurrentUser() user: any, @Param('id') id: string) {
    await this.offerService.remove(id, user.profileId);
    return {
      success: true,
      message: 'Offer deleted successfully',
    };
  }

  /**
   * Store Owner: Get offer analytics
   * GET /offers/store/:id/analytics
   */
  @Get('store/:id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async getOfferAnalytics(@CurrentUser() user: any, @Param('id') id: string) {
    const analytics = await this.offerService.getAnalytics(id, user.profileId);
    return {
      success: true,
      data: analytics,
    };
  }

  /**
   * Admin: Delete any offer
   * DELETE /offers/admin/:id
   */
  @Delete('admin/:id')
  @Roles('admin')
  async adminDeleteOffer(@Param('id') id: string) {
    await this.offerService.adminRemove(id);
    return {
      success: true,
      message: 'Offer deleted successfully',
    };
  }
}

