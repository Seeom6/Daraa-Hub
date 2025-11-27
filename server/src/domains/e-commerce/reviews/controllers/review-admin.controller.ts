import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../../shared/admin/guards/admin.guard';
import { ReviewModerationService } from '../services/review-moderation.service';
import { ModerateReviewDto } from '../dto';
import { ReviewStatus, ReviewTargetType } from '../../../../database/schemas/review.schema';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ReviewAdminController {
  constructor(private readonly reviewModerationService: ReviewModerationService) {}

  // Get all reviews (with filters)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ReviewStatus,
    @Query('targetType') targetType?: ReviewTargetType,
  ) {
    const result = await this.reviewModerationService.getAllReviews(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
      targetType,
    );

    return {
      success: true,
      data: result,
    };
  }

  // Moderate review (approve/reject)
  @Patch(':id/moderate')
  @HttpCode(HttpStatus.OK)
  async moderateReview(
    @Param('id') id: string,
    @Body() moderateDto: ModerateReviewDto,
    @Req() req: any,
  ) {
    const review = await this.reviewModerationService.moderateReview(
      id,
      moderateDto,
      req.user.sub,
    );

    return {
      success: true,
      message: `Review ${moderateDto.status} successfully`,
      data: review,
    };
  }
}

