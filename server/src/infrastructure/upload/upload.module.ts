import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { StorageModule } from '../storage/storage.module';

/**
 * Upload Module
 * Provides file upload endpoints
 */
@Module({
  imports: [StorageModule],
  controllers: [UploadController],
})
export class UploadModule {}

