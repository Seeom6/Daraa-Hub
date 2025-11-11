import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ReviewService } from '../services/review.service';
import { ReviewInteractionService } from '../services/review-interaction.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  StoreResponseDto,
  MarkHelpfulDto,
} from '../dto';
import { ReviewTargetType } from '../../../../database/schemas/review.schema';

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly reviewInteractionService: ReviewInteractionService,
  ) {}

  // Customer: Create review
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @HttpCode(HttpStatus.CREATED)
  async createReview(@Body() createDto: CreateReviewDto, @Req() req: any) {
    const review = await this.reviewService.createReview(createDto, req.user.sub);

    return {
      success: true,
      message: 'Review created successfully',
      data: review,
    };
  }

  // Customer: Update own review
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @HttpCode(HttpStatus.OK)
  async updateReview(
    @Param('id') id: string,
    @Body() updateDto: UpdateReviewDto,
    @Req() req: any,
  ) {
    const review = await this.reviewService.updateReview(id, updateDto, req.user.sub);

    return {
      success: true,
      message: 'Review updated successfully',
      data: review,
    };
  }

  // Customer: Delete own review
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @HttpCode(HttpStatus.OK)
  async deleteReview(@Param('id') id: string, @Req() req: any) {
    await this.reviewService.deleteReview(id, req.user.sub);

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

  // Get review by ID
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getReviewById(@Param('id') id: string) {
    const review = await this.reviewService.getReviewById(id);

    return {
      success: true,
      data: review,
    };
  }

  // Get reviews by target (product/store/courier)
  @Get('target/:targetType/:targetId')
  @HttpCode(HttpStatus.OK)
  async getReviewsByTarget(
    @Param('targetType') targetType: ReviewTargetType,
    @Param('targetId') targetId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('rating') rating?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
  ) {
    const result = await this.reviewService.getReviewsByTarget(
      targetType,
      targetId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      rating ? parseInt(rating) : undefined,
      verifiedOnly === 'true',
    );

    return {
      success: true,
      data: result,
    };
  }

  // Customer: Get own reviews
  @Get('customer/my-reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @HttpCode(HttpStatus.OK)
  async getMyReviews(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.reviewInteractionService.getCustomerReviews(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );

    return {
      success: true,
      data: result,
    };
  }

  // Store Owner: Add response to review
  @Post(':id/response')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  @HttpCode(HttpStatus.OK)
  async addStoreResponse(
    @Param('id') id: string,
    @Body() responseDto: StoreResponseDto,
    @Req() req: any,
  ) {
    const review = await this.reviewInteractionService.addStoreResponse(
      id,
      responseDto,
      req.user.sub,
    );

    return {
      success: true,
      message: 'Store response added successfully',
      data: review,
    };
  }

  // Mark review as helpful/not helpful
  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markHelpful(
    @Param('id') id: string,
    @Body() markDto: MarkHelpfulDto,
    @Req() req: any,
  ) {
    const review = await this.reviewInteractionService.markHelpful(
      id,
      markDto.helpful,
      req.user.sub,
    );

    return {
      success: true,
      message: `Review marked as ${markDto.helpful ? 'helpful' : 'not helpful'}`,
      data: review,
    };
  }
}

