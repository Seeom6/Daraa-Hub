import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VerificationReviewService } from './verification-review.service';
import { VerificationRequest } from '../../../../database/schemas/verification-request.schema';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';
import { generateObjectId } from '../../testing';

describe('VerificationReviewService', () => {
  let service: VerificationReviewService;
  let mockVerificationModel: any;
  let mockStoreOwnerModel: any;
  let mockCourierModel: any;
  let mockEventEmitter: any;

  const adminId = generateObjectId();
  const mockVerificationRequest = {
    _id: generateObjectId(),
    accountId: { toString: () => generateObjectId() },
    applicantType: 'store_owner',
    status: 'pending',
    history: [],
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockVerificationModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVerificationRequest),
      }),
    };

    mockStoreOwnerModel = {
      findOneAndUpdate: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };

    mockCourierModel = {
      findOneAndUpdate: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationReviewService,
        {
          provide: getModelToken(VerificationRequest.name),
          useValue: mockVerificationModel,
        },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreOwnerModel,
        },
        {
          provide: getModelToken(CourierProfile.name),
          useValue: mockCourierModel,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<VerificationReviewService>(VerificationReviewService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockVerificationRequest.status = 'pending';
    mockVerificationRequest.history = [];
  });

  describe('reviewVerification', () => {
    it('should approve verification request', async () => {
      await service.reviewVerification(
        mockVerificationRequest._id,
        { action: 'approve' },
        adminId,
      );

      expect(mockVerificationRequest.status).toBe('approved');
      expect(mockVerificationRequest.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });

    it('should reject verification request', async () => {
      await service.reviewVerification(
        mockVerificationRequest._id,
        { action: 'reject', rejectionReason: 'Invalid documents' },
        adminId,
      );

      expect(mockVerificationRequest.status).toBe('rejected');
      expect(mockVerificationRequest.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });

    it('should request more info', async () => {
      await service.reviewVerification(
        mockVerificationRequest._id,
        { action: 'request_info', infoRequired: 'Need clearer photo' },
        adminId,
      );

      expect(mockVerificationRequest.status).toBe('info_required');
      expect(mockVerificationRequest.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not found', async () => {
      mockVerificationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.reviewVerification('invalid', { action: 'approve' }, adminId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already approved', async () => {
      mockVerificationRequest.status = 'approved';

      await expect(
        service.reviewVerification(
          mockVerificationRequest._id,
          { action: 'approve' },
          adminId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if already rejected', async () => {
      mockVerificationRequest.status = 'rejected';

      await expect(
        service.reviewVerification(
          mockVerificationRequest._id,
          { action: 'approve' },
          adminId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update courier profile for courier applicant', async () => {
      mockVerificationRequest.applicantType = 'courier';

      await service.reviewVerification(
        mockVerificationRequest._id,
        { action: 'approve' },
        adminId,
      );

      expect(mockCourierModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
