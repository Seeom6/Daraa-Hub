import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  VerificationRequest,
  VerificationRequestDocument,
} from '../../../../database/schemas/verification-request.schema';
import { StorageService } from '../../../../infrastructure/storage/storage.service';

/**
 * Verification Document Service
 * Handles document upload and management for verification requests
 */
@Injectable()
export class VerificationDocumentService {
  private readonly logger = new Logger(VerificationDocumentService.name);

  constructor(
    @InjectModel(VerificationRequest.name)
    private verificationRequestModel: Model<VerificationRequestDocument>,
    private storageService: StorageService,
  ) {}

  /**
   * Upload a document for verification request
   */
  async uploadDocument(
    verificationRequestId: string,
    file: Express.Multer.File,
    documentType: string,
    description?: string,
  ): Promise<VerificationRequestDocument> {
    const verificationRequest = await this.verificationRequestModel
      .findById(verificationRequestId)
      .exec();

    if (!verificationRequest) {
      throw new NotFoundException('Verification request not found');
    }

    if (
      verificationRequest.status === 'approved' ||
      verificationRequest.status === 'rejected'
    ) {
      throw new BadRequestException(
        'Cannot upload documents to a finalized verification request',
      );
    }

    // Upload file to S3
    const uploadResult = await this.storageService.uploadFile(
      file,
      `verification/${verificationRequestId}`,
    );

    // Add document to verification request
    verificationRequest.documents.push({
      type: documentType as any,
      url: uploadResult.url,
      uploadedAt: new Date(),
      description,
      status: 'pending',
    });

    this.logger.log(
      `Document uploaded for verification request: ${verificationRequestId}`,
    );
    return verificationRequest.save();
  }
}
