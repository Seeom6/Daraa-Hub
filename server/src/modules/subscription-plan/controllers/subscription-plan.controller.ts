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
import { SubscriptionPlanService } from '../services/subscription-plan.service';
import { CreatePlanDto, UpdatePlanDto } from '../dto';

@Controller('subscription-plans')
export class SubscriptionPlanController {
  constructor(private readonly planService: SubscriptionPlanService) {}

  /**
   * Get all subscription plans
   * GET /subscription-plans
   */
  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const plans = await this.planService.findAll(activeOnly === 'true');
    return {
      success: true,
      data: plans,
    };
  }

  /**
   * Get plan by ID
   * GET /subscription-plans/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const plan = await this.planService.findOne(id);
    return {
      success: true,
      data: plan,
    };
  }

  /**
   * Create subscription plan (Admin only)
   * POST /subscription-plans
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePlanDto) {
    const plan = await this.planService.create(createDto);
    return {
      success: true,
      message: 'Subscription plan created successfully',
      data: plan,
    };
  }

  /**
   * Update subscription plan (Admin only)
   * PUT /subscription-plans/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateDto: UpdatePlanDto) {
    const plan = await this.planService.update(id, updateDto);
    return {
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan,
    };
  }

  /**
   * Delete subscription plan (Admin only)
   * DELETE /subscription-plans/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.planService.remove(id);
  }

  /**
   * Seed default plans (Admin only)
   * POST /subscription-plans/seed
   */
  @Post('seed/default')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async seedDefault() {
    await this.planService.seedDefaultPlans();
    return {
      success: true,
      message: 'Default subscription plans seeded successfully',
    };
  }
}

