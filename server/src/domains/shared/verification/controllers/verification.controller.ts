import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../admin/guards/admin.guard';
import { PermissionsGuard } from '../../admin/guards/permissions.guard';
import { RequirePermissions } from '../../admin/decorators/permissions.decorator';
import { VerificationService } from '../services/verification.service';
import { VerificationDocumentService } from '../services/verification-document.service';
import { VerificationReviewService } from '../services/verification-review.service';
import { SubmitVerificationDto } from '../dto/submit-verification.dto';
import { ReviewVerificationDto } from '../dto/review-verification.dto';
import { UploadDocumentDto } from '../dto/submit-verification.dto';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly documentService: VerificationDocumentService,
    private readonly reviewService: VerificationReviewService,
  ) {}

  // User endpoints
  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  async submitVerification(
    @Body() submitDto: SubmitVerificationDto,
    @Req() req: any,
  ) {
    const verificationRequest = await this.verificationService.submitVerification(
      req.user.sub,
      submitDto,
    );
    return {
      success: true,
      message: 'Verification request submitted successfully',
      data: verificationRequest,
    };
  }

  @Post('upload-document')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadDocument(
    @Body() uploadDto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        success: false,
        message: 'No file uploaded',
      };
    }

    const verificationRequest = await this.documentService.uploadDocument(
      uploadDto.verificationRequestId,
      file,
      uploadDto.documentType,
      uploadDto.description,
    );

    return {
      success: true,
      message: 'Document uploaded successfully',
      data: verificationRequest,
    };
  }

  @Get('my-status')
  @HttpCode(HttpStatus.OK)
  async getMyVerificationStatus(@Req() req: any) {
    const status = await this.verificationService.getMyVerificationStatus(req.user.sub);
    return {
      success: true,
      data: status,
    };
  }

  // Admin endpoints
  @Get('requests')
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'stores', action: 'approve' })
  @HttpCode(HttpStatus.OK)
  async getAllVerificationRequests(
    @Query('status') status?: string,
    @Query('applicantType') applicantType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      status,
      applicantType,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    const result = await this.verificationService.getAllVerificationRequests(filters);
    return {
      success: true,
      data: result,
    };
  }

  @Get('requests/:id')
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'stores', action: 'view' })
  @HttpCode(HttpStatus.OK)
  async getVerificationRequestById(@Param('id') id: string) {
    const request = await this.verificationService.getVerificationRequestById(id);
    return {
      success: true,
      data: request,
    };
  }

  @Patch('requests/:id/review')
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'stores', action: 'approve' })
  @HttpCode(HttpStatus.OK)
  async reviewVerification(
    @Param('id') id: string,
    @Body() reviewDto: ReviewVerificationDto,
    @Req() req: any,
  ) {
    const verificationRequest = await this.reviewService.reviewVerification(
      id,
      reviewDto,
      req.user.sub,
    );

    return {
      success: true,
      message: `Verification request ${reviewDto.action}ed successfully`,
      data: verificationRequest,
    };
  }
}

