import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReviewCrudService } from './review-crud.service';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewRatingService } from './review-rating.service';
import { ReviewVerificationService } from './review-verification.service';
import {
  ReviewStatus,
  ReviewTargetType,
} from '../../../../database/schemas/review.schema';

describe('ReviewCrudService', () => {
  let service: ReviewCrudService;
  let reviewRepository: jest.Mocked<ReviewRepository>;
  let reviewRatingService: jest.Mocked<ReviewRatingService>;
  let verificationService: jest.Mocked<ReviewVerificationService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockCustomerId = new Types.ObjectId();
  const mockAccountId = new Types.ObjectId().toString();
  const mockProductId = new Types.ObjectId().toString();
  const mockOrderId = new Types.ObjectId().toString();
  const mockReviewId = new Types.ObjectId();

  const mockCustomerProfile = { _id: mockCustomerId };

  const mockReview = {
    _id: mockReviewId,
    customerId: mockCustomerId,
    targetType: ReviewTargetType.PRODUCT,
    targetId: new Types.ObjectId(mockProductId),
    orderId: new Types.ObjectId(mockOrderId),
    rating: 5,
    title: 'Great product',
    comment: 'Loved it!',
    images: [],
    isVerifiedPurchase: true,
    status: ReviewStatus.APPROVED,
    isEdited: false,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const mockModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: mockReviewId,
      save: jest.fn().mockResolvedValue({ ...data, _id: mockReviewId }),
    }));
    (mockModel as any).findById = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewCrudService,
        {
          provide: ReviewRepository,
          useValue: {
            getModel: jest.fn().mockReturnValue(mockModel),
            delete: jest.fn(),
          },
        },
        {
          provide: ReviewRatingService,
          useValue: { updateTargetRating: jest.fn() },
        },
        {
          provide: ReviewVerificationService,
          useValue: {
            getCustomerProfile: jest
              .fn()
              .mockResolvedValue(mockCustomerProfile),
            verifyPurchase: jest.fn(),
            checkDuplicateReview: jest.fn(),
            verifyTargetExists: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ReviewCrudService>(ReviewCrudService);
    reviewRepository = module.get(ReviewRepository);
    reviewRatingService = module.get(ReviewRatingService);
    verificationService = module.get(ReviewVerificationService);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('createReview', () => {
    const createDto = {
      targetType: ReviewTargetType.PRODUCT,
      targetId: mockProductId,
      orderId: mockOrderId,
      rating: 5,
      title: 'Great product',
      comment: 'Loved it!',
    };

    it('should create a review with verified purchase', async () => {
      const result = await service.createReview(createDto, mockAccountId);

      expect(verificationService.getCustomerProfile).toHaveBeenCalledWith(
        mockAccountId,
      );
      expect(verificationService.verifyPurchase).toHaveBeenCalled();
      expect(verificationService.checkDuplicateReview).toHaveBeenCalled();
      expect(verificationService.verifyTargetExists).toHaveBeenCalled();
      expect(reviewRatingService.updateTargetRating).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'review.created',
        expect.any(Object),
      );
      expect(result).toBeDefined();
    });

    it('should create a review without orderId', async () => {
      const dtoWithoutOrder = { ...createDto, orderId: undefined };
      const result = await service.createReview(dtoWithoutOrder, mockAccountId);

      expect(verificationService.verifyPurchase).not.toHaveBeenCalled();
      expect(verificationService.checkDuplicateReview).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('updateReview', () => {
    const updateDto = { rating: 4, title: 'Updated title' };

    beforeEach(() => {
      const model = reviewRepository.getModel();
      (model as any).findById = jest.fn().mockResolvedValue({
        ...mockReview,
        save: jest.fn().mockResolvedValue(mockReview),
      });
    });

    it('should update a review successfully', async () => {
      const result = await service.updateReview(
        mockReviewId.toString(),
        updateDto,
        mockAccountId,
      );

      expect(result).toBeDefined();
      expect(reviewRatingService.updateTargetRating).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'review.updated',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if review not found', async () => {
      const model = reviewRepository.getModel();
      (model as any).findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateReview(mockReviewId.toString(), updateDto, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      const differentCustomerId = new Types.ObjectId();
      verificationService.getCustomerProfile.mockResolvedValue({
        _id: differentCustomerId,
      });

      await expect(
        service.updateReview(mockReviewId.toString(), updateDto, mockAccountId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteReview', () => {
    beforeEach(() => {
      const model = reviewRepository.getModel();
      (model as any).findById = jest.fn().mockResolvedValue(mockReview);
    });

    it('should delete a review successfully', async () => {
      await service.deleteReview(mockReviewId.toString(), mockAccountId);

      expect(reviewRepository.delete).toHaveBeenCalledWith(
        mockReviewId.toString(),
      );
      expect(reviewRatingService.updateTargetRating).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'review.deleted',
        expect.any(Object),
      );
    });
  });
});
