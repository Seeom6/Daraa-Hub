import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ReturnService } from '../services/return.service';
import { CreateReturnDto } from '../dto/create-return.dto';
import { UpdateReturnDto } from '../dto/update-return.dto';
import { StoreResponseDto } from '../dto/store-response.dto';
import { AdminReviewDto } from '../dto/admin-review.dto';
import { QueryReturnDto } from '../dto/query-return.dto';

@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post()
  @Roles('customer')
  async create(@Body() createReturnDto: CreateReturnDto, @Req() req: any) {
    const customerId = req.user.profileId;
    const returnRequest = await this.returnService.create(createReturnDto, customerId);
    return {
      success: true,
      data: returnRequest,
      message: 'Return request created successfully',
    };
  }

  @Get('my')
  @Roles('customer')
  async getMyReturns(@Query() query: QueryReturnDto, @Req() req: any) {
    const customerId = req.user.profileId;
    const result = await this.returnService.findByCustomer(customerId, query);
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  @Roles('customer', 'store_owner', 'admin')
  async getById(@Param('id') id: string) {
    const returnRequest = await this.returnService.findById(id);
    return {
      success: true,
      data: returnRequest,
    };
  }

  // Store owner endpoints
  @Post('store/:id/respond')
  @Roles('store_owner')
  async storeRespond(
    @Param('id') id: string,
    @Body() storeResponseDto: StoreResponseDto,
    @Req() req: any,
  ) {
    const storeOwnerId = req.user.profileId;
    const returnRequest = await this.returnService.storeRespond(id, storeResponseDto, storeOwnerId);
    return {
      success: true,
      data: returnRequest,
      message: 'Response submitted successfully',
    };
  }

  // Admin endpoints
  @Get('admin/all')
  @Roles('admin')
  async getAllReturns(@Query() query: QueryReturnDto) {
    const result = await this.returnService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Put('admin/:id')
  @Roles('admin')
  async updateReturn(@Param('id') id: string, @Body() updateReturnDto: UpdateReturnDto) {
    const returnRequest = await this.returnService.update(id, updateReturnDto);
    return {
      success: true,
      data: returnRequest,
      message: 'Return updated successfully',
    };
  }

  @Post('admin/:id/review')
  @Roles('admin')
  async adminReview(
    @Param('id') id: string,
    @Body() adminReviewDto: AdminReviewDto,
    @Req() req: any,
  ) {
    const adminId = req.user.profileId;
    const returnRequest = await this.returnService.adminReview(id, adminReviewDto, adminId);
    return {
      success: true,
      data: returnRequest,
      message: 'Review submitted successfully',
    };
  }

  @Post('admin/:id/picked-up')
  @Roles('admin', 'courier')
  async markAsPickedUp(@Param('id') id: string) {
    const returnRequest = await this.returnService.markAsPickedUp(id);
    return {
      success: true,
      data: returnRequest,
      message: 'Return marked as picked up',
    };
  }

  @Post('admin/:id/inspected')
  @Roles('admin')
  async markAsInspected(@Param('id') id: string) {
    const returnRequest = await this.returnService.markAsInspected(id);
    return {
      success: true,
      data: returnRequest,
      message: 'Return marked as inspected',
    };
  }

  @Post('admin/:id/refund')
  @Roles('admin')
  async processRefund(@Param('id') id: string) {
    const returnRequest = await this.returnService.processRefund(id);
    return {
      success: true,
      data: returnRequest,
      message: 'Refund processed successfully',
    };
  }

  @Get('admin/statistics')
  @Roles('admin')
  async getStatistics(@Query() filters: any) {
    const stats = await this.returnService.getStatistics(filters);
    return {
      success: true,
      data: stats,
    };
  }
}

