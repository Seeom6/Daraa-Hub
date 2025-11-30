import { Test, TestingModule } from '@nestjs/testing';
import { VerificationController } from './verification.controller';
import { VerificationService } from '../services/verification.service';
import { VerificationDocumentService } from '../services/verification-document.service';
import { VerificationReviewService } from '../services/verification-review.service';
import { generateObjectId } from '../../testing';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../admin/guards/admin.guard';
import { PermissionsGuard } from '../../admin/guards/permissions.guard';

describe('VerificationController', () => {
  let controller: VerificationController;
  let verificationService: jest.Mocked<VerificationService>;
  let documentService: jest.Mocked<VerificationDocumentService>;
  let reviewService: jest.Mocked<VerificationReviewService>;

  const mockVerificationService = {
    submitVerification: jest.fn(),
    getMyVerificationStatus: jest.fn(),
    getAllVerificationRequests: jest.fn(),
    getVerificationRequestById: jest.fn(),
  };

  const mockDocumentService = {
    uploadDocument: jest.fn(),
  };

  const mockReviewService = {
    reviewVerification: jest.fn(),
  };

  const accountId = generateObjectId();
  const mockRequest = { user: { sub: accountId } };

  const mockVerificationRequest = {
    _id: generateObjectId(),
    accountId,
    status: 'pending',
    applicantType: 'store_owner',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationController],
      providers: [
        { provide: VerificationService, useValue: mockVerificationService },
        { provide: VerificationDocumentService, useValue: mockDocumentService },
        { provide: VerificationReviewService, useValue: mockReviewService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VerificationController>(VerificationController);
    verificationService = module.get(VerificationService);
    documentService = module.get(VerificationDocumentService);
    reviewService = module.get(VerificationReviewService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitVerification', () => {
    it('should submit verification request', async () => {
      const submitDto = {
        applicantType: 'store_owner',
        businessName: 'Test Store',
      };
      mockVerificationService.submitVerification.mockResolvedValue(
        mockVerificationRequest,
      );

      const result = await controller.submitVerification(
        submitDto as any,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Verification request submitted successfully',
      );
    });
  });

  describe('uploadDocument', () => {
    it('should upload document', async () => {
      const uploadDto = {
        verificationRequestId: mockVerificationRequest._id,
        documentType: 'id_card',
      };
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as Express.Multer.File;
      mockDocumentService.uploadDocument.mockResolvedValue(
        mockVerificationRequest,
      );

      const result = await controller.uploadDocument(
        uploadDto as any,
        mockFile,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Document uploaded successfully');
    });

    it('should return error if no file uploaded', async () => {
      const uploadDto = {
        verificationRequestId: mockVerificationRequest._id,
        documentType: 'id_card',
      };

      const result = await controller.uploadDocument(
        uploadDto as any,
        undefined as any,
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('No file uploaded');
    });
  });

  describe('getMyVerificationStatus', () => {
    it('should return verification status', async () => {
      const status = { status: 'pending', submittedAt: new Date() };
      mockVerificationService.getMyVerificationStatus.mockResolvedValue(status);

      const result = await controller.getMyVerificationStatus(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(status);
    });
  });

  describe('getAllVerificationRequests', () => {
    it('should return all verification requests', async () => {
      const requests = { data: [mockVerificationRequest], total: 1 };
      mockVerificationService.getAllVerificationRequests.mockResolvedValue(
        requests,
      );

      const result = await controller.getAllVerificationRequests();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(requests);
    });
  });

  describe('getVerificationRequestById', () => {
    it('should return verification request by id', async () => {
      mockVerificationService.getVerificationRequestById.mockResolvedValue(
        mockVerificationRequest,
      );

      const result = await controller.getVerificationRequestById(
        mockVerificationRequest._id,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVerificationRequest);
    });
  });

  describe('reviewVerification', () => {
    it('should review verification request', async () => {
      const reviewDto = { action: 'approve', notes: 'Approved' };
      mockReviewService.reviewVerification.mockResolvedValue({
        ...mockVerificationRequest,
        status: 'approved',
      });

      const result = await controller.reviewVerification(
        mockVerificationRequest._id,
        reviewDto as any,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Verification request approveed successfully',
      );
    });

    it('should review verification request with reject action', async () => {
      const reviewDto = {
        action: 'reject',
        notes: 'Rejected due to invalid documents',
      };
      mockReviewService.reviewVerification.mockResolvedValue({
        ...mockVerificationRequest,
        status: 'rejected',
      });

      const result = await controller.reviewVerification(
        mockVerificationRequest._id,
        reviewDto as any,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Verification request rejected successfully');
    });
  });

  describe('getAllVerificationRequests with filters', () => {
    it('should filter by status', async () => {
      const requests = { data: [mockVerificationRequest], total: 1 };
      mockVerificationService.getAllVerificationRequests.mockResolvedValue(
        requests,
      );

      await controller.getAllVerificationRequests('pending');

      expect(
        mockVerificationService.getAllVerificationRequests,
      ).toHaveBeenCalledWith({
        status: 'pending',
        applicantType: undefined,
        page: 1,
        limit: 20,
      });
    });

    it('should filter by applicantType', async () => {
      const requests = { data: [mockVerificationRequest], total: 1 };
      mockVerificationService.getAllVerificationRequests.mockResolvedValue(
        requests,
      );

      await controller.getAllVerificationRequests(undefined, 'store_owner');

      expect(
        mockVerificationService.getAllVerificationRequests,
      ).toHaveBeenCalledWith({
        status: undefined,
        applicantType: 'store_owner',
        page: 1,
        limit: 20,
      });
    });

    it('should use custom page and limit', async () => {
      const requests = { data: [mockVerificationRequest], total: 1 };
      mockVerificationService.getAllVerificationRequests.mockResolvedValue(
        requests,
      );

      await controller.getAllVerificationRequests(
        undefined,
        undefined,
        '2',
        '50',
      );

      expect(
        mockVerificationService.getAllVerificationRequests,
      ).toHaveBeenCalledWith({
        status: undefined,
        applicantType: undefined,
        page: 2,
        limit: 50,
      });
    });

    it('should filter by status and applicantType together', async () => {
      const requests = { data: [mockVerificationRequest], total: 1 };
      mockVerificationService.getAllVerificationRequests.mockResolvedValue(
        requests,
      );

      await controller.getAllVerificationRequests(
        'approved',
        'courier',
        '1',
        '10',
      );

      expect(
        mockVerificationService.getAllVerificationRequests,
      ).toHaveBeenCalledWith({
        status: 'approved',
        applicantType: 'courier',
        page: 1,
        limit: 10,
      });
    });
  });

  describe('uploadDocument with description', () => {
    it('should upload document with description', async () => {
      const uploadDto = {
        verificationRequestId: mockVerificationRequest._id,
        documentType: 'id_card',
        description: 'Front side of ID card',
      };
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as Express.Multer.File;
      mockDocumentService.uploadDocument.mockResolvedValue(
        mockVerificationRequest,
      );

      const result = await controller.uploadDocument(
        uploadDto as any,
        mockFile,
      );

      expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(
        uploadDto.verificationRequestId,
        mockFile,
        uploadDto.documentType,
        uploadDto.description,
      );
      expect(result.success).toBe(true);
    });
  });
});
