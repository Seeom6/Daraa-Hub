import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { ReviewInteractionService } from './review-interaction.service';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewTargetType } from '../../../../database/schemas/review.schema';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';

describe('ReviewInteractionService', () => {
  let service: ReviewInteractionService;
  let reviewRepository: ReviewRepository;
  let storeProfileModel: any;
  let customerProfileModel: any;
  let eventEmitter: EventEmitter2;

  const mockReviewId = new Types.ObjectId().toString();
  const mockAccountId = new Types.ObjectId().toString();
  const mockStoreId = new Types.ObjectId();
  const mockCustomerId = new Types.ObjectId();

  const createMockReview = (overrides = {}) => ({
    _id: new Types.ObjectId(mockReviewId),
    targetType: ReviewTargetType.STORE,
    targetId: mockStoreId,
    helpfulCount: 0,
    notHelpfulCount: 0,
    storeResponse: null,
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  });

  const mockReviewRepository = {
    getModel: jest.fn(),
    count: jest.fn(),
  };

  const mockStoreProfileModel = {
    findOne: jest.fn(),
  };

  const mockCustomerProfileModel = {
    findOne: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewInteractionService,
        { provide: ReviewRepository, useValue: mockReviewRepository },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreProfileModel,
        },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: mockCustomerProfileModel,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ReviewInteractionService>(ReviewInteractionService);
    reviewRepository = module.get<ReviewRepository>(ReviewRepository);
    storeProfileModel = module.get(getModelToken(StoreOwnerProfile.name));
    customerProfileModel = module.get(getModelToken(CustomerProfile.name));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addStoreResponse', () => {
    it('should add store response to review successfully', async () => {
      const mockReview = createMockReview();
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(mockReview),
      });
      mockStoreProfileModel.findOne.mockResolvedValue({ _id: mockStoreId });

      const result = await service.addStoreResponse(
        mockReviewId,
        { message: 'Thank you for your feedback!' },
        mockAccountId,
      );

      expect(result.storeResponse.message).toBe('Thank you for your feedback!');
      expect(mockReview.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'review.store_response_added',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when review not found', async () => {
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.addStoreResponse(
          mockReviewId,
          { message: 'Thanks!' },
          mockAccountId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for courier reviews', async () => {
      const mockReview = createMockReview({
        targetType: ReviewTargetType.COURIER,
      });
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(mockReview),
      });

      await expect(
        service.addStoreResponse(
          mockReviewId,
          { message: 'Thanks!' },
          mockAccountId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when store profile not found', async () => {
      const mockReview = createMockReview();
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(mockReview),
      });
      mockStoreProfileModel.findOne.mockResolvedValue(null);

      await expect(
        service.addStoreResponse(
          mockReviewId,
          { message: 'Thanks!' },
          mockAccountId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when responding to another store review', async () => {
      const differentStoreId = new Types.ObjectId();
      const mockReview = createMockReview({ targetId: differentStoreId });
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(mockReview),
      });
      mockStoreProfileModel.findOne.mockResolvedValue({ _id: mockStoreId });

      await expect(
        service.addStoreResponse(
          mockReviewId,
          { message: 'Thanks!' },
          mockAccountId,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow response to product reviews', async () => {
      const mockReview = createMockReview({
        targetType: ReviewTargetType.PRODUCT,
      });
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(mockReview),
      });
      mockStoreProfileModel.findOne.mockResolvedValue({ _id: mockStoreId });

      const result = await service.addStoreResponse(
        mockReviewId,
        { message: 'Thanks for the product review!' },
        mockAccountId,
      );

      expect(result.storeResponse.message).toBe(
        'Thanks for the product review!',
      );
    });
  });

  describe('markHelpful', () => {
    it('should increment helpful count', async () => {
      const mockReview = createMockReview();
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(mockReview),
      });

      const result = await service.markHelpful(
        mockReviewId,
        true,
        mockAccountId,
      );

      expect(result.helpfulCount).toBe(1);
      expect(mockReview.save).toHaveBeenCalled();
    });

    it('should increment not helpful count', async () => {
      const mockReview = createMockReview();
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(mockReview),
      });

      const result = await service.markHelpful(
        mockReviewId,
        false,
        mockAccountId,
      );

      expect(result.notHelpfulCount).toBe(1);
    });

    it('should throw NotFoundException when review not found', async () => {
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.markHelpful(mockReviewId, true, mockAccountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCustomerReviews', () => {
    it('should return paginated customer reviews', async () => {
      const mockReviews = [createMockReview(), createMockReview()];
      mockCustomerProfileModel.findOne.mockResolvedValue({
        _id: mockCustomerId,
      });
      mockReviewRepository.count.mockResolvedValue(2);
      mockReviewRepository.getModel.mockReturnValue({
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockReviews),
            }),
          }),
        }),
      });

      const result = await service.getCustomerReviews(mockAccountId, 1, 10);

      expect(result.reviews).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should throw NotFoundException when customer profile not found', async () => {
      mockCustomerProfileModel.findOne.mockResolvedValue(null);

      await expect(service.getCustomerReviews(mockAccountId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should use default pagination values', async () => {
      mockCustomerProfileModel.findOne.mockResolvedValue({
        _id: mockCustomerId,
      });
      mockReviewRepository.count.mockResolvedValue(0);
      mockReviewRepository.getModel.mockReturnValue({
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const result = await service.getCustomerReviews(mockAccountId);

      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(0);
    });
  });
});
