import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { Roles, CurrentUser } from '../../../../common/decorators';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

interface JwtUser {
  sub: string;
  userId: string;
  phone: string;
  role: string;
  profileId: string;
}

@Controller('addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /**
   * Create a new address
   * POST /addresses
   */
  @Post()
  @Roles('customer', 'store_owner')
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateAddressDto) {
    const address = await this.addressService.create(user.profileId, dto);
    return {
      success: true,
      message: 'Address created successfully',
      data: address,
    };
  }

  /**
   * Get all addresses for the current user
   * GET /addresses
   */
  @Get()
  @Roles('customer', 'store_owner')
  async findAll(@CurrentUser() user: JwtUser) {
    const addresses = await this.addressService.findAllByCustomer(
      user.profileId,
    );
    return {
      success: true,
      data: addresses,
    };
  }

  /**
   * Get the default address
   * GET /addresses/default
   */
  @Get('default')
  @Roles('customer', 'store_owner')
  async findDefault(@CurrentUser() user: JwtUser) {
    const address = await this.addressService.findDefault(user.profileId);
    return {
      success: true,
      data: address,
    };
  }

  /**
   * Get a specific address by ID
   * GET /addresses/:id
   */
  @Get(':id')
  @Roles('customer', 'store_owner')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const address = await this.addressService.findById(id, user.profileId);
    return {
      success: true,
      data: address,
    };
  }

  /**
   * Update an address
   * PUT /addresses/:id
   */
  @Put(':id')
  @Roles('customer', 'store_owner')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.addressService.update(id, user.profileId, dto);
    return {
      success: true,
      message: 'Address updated successfully',
      data: address,
    };
  }

  /**
   * Set address as default
   * PATCH /addresses/:id/default
   */
  @Patch(':id/default')
  @Roles('customer', 'store_owner')
  async setDefault(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const address = await this.addressService.setAsDefault(id, user.profileId);
    return {
      success: true,
      message: 'Address set as default',
      data: address,
    };
  }

  /**
   * Delete an address
   * DELETE /addresses/:id
   */
  @Delete(':id')
  @Roles('customer', 'store_owner')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    await this.addressService.delete(id, user.profileId);
    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }
}
