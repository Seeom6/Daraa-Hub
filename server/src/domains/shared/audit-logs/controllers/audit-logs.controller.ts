import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../admin/guards/admin.guard';
import { AuditLogsService } from '../services/audit-logs.service';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllLogs(
    @Query('performedBy') performedBy?: string,
    @Query('action') action?: string,
    @Query('category') category?: string,
    @Query('targetId') targetId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      performedBy,
      action,
      category,
      targetId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    };

    const result = await this.auditLogsService.findAll(filters);
    return {
      success: true,
      data: result,
    };
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const statistics = await this.auditLogsService.getStatistics(filters);
    return {
      success: true,
      data: statistics,
    };
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  async exportLogs(
    @Query('performedBy') performedBy?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      performedBy,
      category,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const logs = await this.auditLogsService.exportLogs(filters);
    return {
      success: true,
      data: logs,
      count: logs.length,
    };
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserLogs(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.auditLogsService.findByUser(
      userId,
      limit ? parseInt(limit) : 50,
    );
    return {
      success: true,
      data: logs,
    };
  }

  @Get('target/:targetId')
  @HttpCode(HttpStatus.OK)
  async getTargetLogs(
    @Param('targetId') targetId: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.auditLogsService.findByTarget(
      targetId,
      limit ? parseInt(limit) : 50,
    );
    return {
      success: true,
      data: logs,
    };
  }

  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  async getCategoryLogs(
    @Param('category') category: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.auditLogsService.findByCategory(
      category,
      limit ? parseInt(limit) : 50,
    );
    return {
      success: true,
      data: logs,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getLogById(@Param('id') id: string) {
    const log = await this.auditLogsService.findById(id);
    return {
      success: true,
      data: log,
    };
  }
}

