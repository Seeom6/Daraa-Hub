import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { InventoryService } from '../services/inventory.service';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  StockMovementDto,
  QueryInventoryDto,
} from '../dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Create inventory record
   * POST /inventory
   * Requires: Store Owner or Admin
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CurrentUser() user: any,
  ) {
    const inventory = await this.inventoryService.create(
      createInventoryDto,
      user.userId,
    );
    return {
      success: true,
      message: 'Inventory created successfully',
      data: inventory,
    };
  }

  /**
   * Get all inventory records with filters
   * GET /inventory
   * Requires: Store Owner or Admin
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async findAll(@Query() query: QueryInventoryDto) {
    const result = await this.inventoryService.findAll(query);
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * Get inventory by ID
   * GET /inventory/:id
   * Requires: Store Owner or Admin
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async findOne(@Param('id') id: string) {
    const inventory = await this.inventoryService.findOne(id);
    return {
      success: true,
      data: inventory,
    };
  }

  /**
   * Get inventory by product
   * GET /inventory/product/:productId
   * Public endpoint
   */
  @Get('product/:productId')
  async findByProduct(
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string,
  ) {
    const inventory = await this.inventoryService.findByProduct(
      productId,
      variantId,
    );
    return {
      success: true,
      data: {
        availableQuantity: inventory.availableQuantity,
        inStock: inventory.availableQuantity > 0,
      },
    };
  }

  /**
   * Update inventory settings
   * PUT /inventory/:id
   * Requires: Store Owner or Admin
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser() user: any,
  ) {
    const inventory = await this.inventoryService.update(
      id,
      updateInventoryDto,
      user.userId,
    );
    return {
      success: true,
      message: 'Inventory updated successfully',
      data: inventory,
    };
  }

  /**
   * Add stock
   * PATCH /inventory/:id/add-stock
   * Requires: Store Owner or Admin
   */
  @Patch(':id/add-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async addStock(
    @Param('id') id: string,
    @Body() movementDto: StockMovementDto,
    @CurrentUser() user: any,
  ) {
    const inventory = await this.inventoryService.addStock(
      id,
      movementDto,
      user.userId,
    );
    return {
      success: true,
      message: 'Stock added successfully',
      data: inventory,
    };
  }

  /**
   * Remove stock
   * PATCH /inventory/:id/remove-stock
   * Requires: Store Owner or Admin
   */
  @Patch(':id/remove-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async removeStock(
    @Param('id') id: string,
    @Body() movementDto: StockMovementDto,
    @CurrentUser() user: any,
  ) {
    const inventory = await this.inventoryService.removeStock(
      id,
      movementDto,
      user.userId,
    );
    return {
      success: true,
      message: 'Stock removed successfully',
      data: inventory,
    };
  }
}
