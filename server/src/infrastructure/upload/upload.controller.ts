import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';
import { ConfigService } from '@nestjs/config';

/**
 * Upload Controller
 * Handles file uploads (images and documents)
 * Optimized for performance and scalability
 */
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly maxFileSize: number;
  private readonly allowedImageTypes: string[];
  private readonly allowedDocumentTypes: string[];

  constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {
    this.maxFileSize = this.configService.get('upload.maxFileSize') || 5242880; // 5MB
    this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    this.allowedDocumentTypes = ['application/pdf'];
  }

  /**
   * Upload a single image
   * POST /upload/image
   * Max size: 5MB
   * Allowed types: JPEG, PNG, WEBP
   */
  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedImageTypes.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Upload to storage
    const result = await this.storageService.uploadFile(file, 'images');

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
      },
    };
  }

  /**
   * Upload multiple images
   * POST /upload/images
   * Max files: 10
   * Max size per file: 5MB
   * Allowed types: JPEG, PNG, WEBP
   */
  @Post('images')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Validate all files
    for (const file of files) {
      if (!this.allowedImageTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type for ${file.originalname}. Allowed types: ${this.allowedImageTypes.join(', ')}`,
        );
      }

      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
        );
      }
    }

    // Upload all files in parallel for better performance
    const uploadPromises = files.map((file) =>
      this.storageService.uploadFile(file, 'images'),
    );
    const results = await Promise.all(uploadPromises);

    return {
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: {
        urls: results.map((r) => r.url),
        files: results.map((r) => ({ url: r.url, key: r.key })),
      },
    };
  }

  /**
   * Upload a document (PDF)
   * POST /upload/document
   * Max size: 5MB
   * Allowed types: PDF
   */
  @Post('document')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    if (!this.allowedDocumentTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedDocumentTypes.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Upload to storage
    const result = await this.storageService.uploadFile(file, 'documents');

    return {
      success: true,
      message: 'Document uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
      },
    };
  }
}

