import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { DisputeService } from '../services/dispute.service';
import { CreateDisputeDto } from '../dto/create-dispute.dto';
import { UpdateDisputeDto } from '../dto/update-dispute.dto';
import { AddMessageDto } from '../dto/add-message.dto';
import { ResolveDisputeDto } from '../dto/resolve-dispute.dto';
import { QueryDisputeDto } from '../dto/query-dispute.dto';

@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @Roles('customer', 'store_owner')
  async create(@Body() createDisputeDto: CreateDisputeDto, @Req() req: any) {
    const userId = req.user.profileId;
    const dispute = await this.disputeService.create(createDisputeDto, userId);
    return {
      success: true,
      data: dispute,
      message: 'Dispute created successfully',
    };
  }

  @Get('my')
  @Roles('customer', 'store_owner')
  async getMyDisputes(@Query() query: QueryDisputeDto, @Req() req: any) {
    const userId = req.user.profileId;
    const result = await this.disputeService.findByUser(userId, query);
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  @Roles('customer', 'store_owner', 'admin')
  async getById(@Param('id') id: string) {
    const dispute = await this.disputeService.findById(id);
    return {
      success: true,
      data: dispute,
    };
  }

  @Post(':id/messages')
  @Roles('customer', 'store_owner', 'admin')
  async addMessage(
    @Param('id') id: string,
    @Body() addMessageDto: AddMessageDto,
    @Req() req: any,
  ) {
    const userId = req.user.profileId;
    const dispute = await this.disputeService.addMessage(id, addMessageDto, userId);
    return {
      success: true,
      data: dispute,
      message: 'Message added successfully',
    };
  }

  // Admin endpoints
  @Get('admin/all')
  @Roles('admin')
  async getAllDisputes(@Query() query: QueryDisputeDto) {
    const result = await this.disputeService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Put('admin/:id')
  @Roles('admin')
  async updateDispute(@Param('id') id: string, @Body() updateDisputeDto: UpdateDisputeDto) {
    const dispute = await this.disputeService.update(id, updateDisputeDto);
    return {
      success: true,
      data: dispute,
      message: 'Dispute updated successfully',
    };
  }

  @Post('admin/:id/resolve')
  @Roles('admin')
  async resolveDispute(
    @Param('id') id: string,
    @Body() resolveDisputeDto: ResolveDisputeDto,
    @Req() req: any,
  ) {
    const adminId = req.user.profileId;
    const dispute = await this.disputeService.resolve(id, resolveDisputeDto, adminId);
    return {
      success: true,
      data: dispute,
      message: 'Dispute resolved successfully',
    };
  }

  @Post('admin/:id/close')
  @Roles('admin')
  async closeDispute(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user.profileId;
    const dispute = await this.disputeService.close(id, adminId);
    return {
      success: true,
      data: dispute,
      message: 'Dispute closed successfully',
    };
  }

  @Get('admin/statistics')
  @Roles('admin')
  async getStatistics(@Query() filters: any) {
    const stats = await this.disputeService.getStatistics(filters);
    return {
      success: true,
      data: stats,
    };
  }
}

