import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ReviewVerificationService } from './review-verification.service';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewRatingService } from './review-rating.service';
import { Order } from '../../../../database/schemas/order.schema';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';
import { ReviewTargetType } from '../../../../database/schemas/review.schema';

describe('ReviewVerificationService', () => {
  let service: ReviewVerificationService;
  let reviewRepository: jest.Mocked<ReviewRepository>;
  let reviewRatingService: jest.Mocked<ReviewRatingService>;
  let orderModel: any;
  let customerProfileModel: any;

  const accountId = new Types.ObjectId().toString();
  const customerId = new Types.ObjectId();
  const productId = new Types.ObjectId();
  const storeId = new Types.ObjectId();
  const courierId = new Types.ObjectId();
  const orderId = new Types.ObjectId();

  const mockCustomerProfile = {
    _id: customerId,
    accountId: new Types.ObjectId(accountId),
  };

  const mockOrder = {
    _id: orderId,
    customerId,
    storeId,
    courierId,
    orderStatus: 'delivered',
    items: [{ productId }],
  };

  beforeEach(async () => {
    orderModel = {
      findOne: jest.fn(),
    };
    customerProfileModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewVerificationService,
        {
          provide: ReviewRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ReviewRatingService,
          useValue: {
            verifyTargetExists: jest.fn(),
          },
        },
        { provide: getModelToken(Order.name), useValue: orderModel },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: customerProfileModel,
        },
      ],
    }).compile();

    service = module.get<ReviewVerificationService>(ReviewVerificationService);
    reviewRepository = module.get(ReviewRepository);
    reviewRatingService = module.get(ReviewRatingService);
  });

  describe('getCustomerProfile', () => {
    it('should return customer profile', async () => {
      customerProfileModel.findOne.mockResolvedValue(mockCustomerProfile);

      const result = await service.getCustomerProfile(accountId);

      expect(result).toEqual(mockCustomerProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      customerProfileModel.findOne.mockResolvedValue(null);

      await expect(service.getCustomerProfile(accountId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('verifyPurchase', () => {
    it('should verify product purchase', async () => {
      orderModel.findOne.mockResolvedValue(mockOrder);

      const result = await service.verifyPurchase(
        customerId.toString(),
        ReviewTargetType.PRODUCT,
        productId.toString(),
        orderId.toString(),
      );

      expect(result).toBe(true);
    });

    it('should throw BadRequestException if order not found', async () => {
      orderModel.findOne.mockResolvedValue(null);

      await expect(
        service.verifyPurchase(
          customerId.toString(),
          ReviewTargetType.PRODUCT,
          productId.toString(),
          orderId.toString(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if product not in order', async () => {
      orderModel.findOne.mockResolvedValue({ ...mockOrder, items: [] });

      await expect(
        service.verifyPurchase(
          customerId.toString(),
          ReviewTargetType.PRODUCT,
          productId.toString(),
          orderId.toString(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should verify store purchase', async () => {
      orderModel.findOne.mockResolvedValue(mockOrder);

      const result = await service.verifyPurchase(
        customerId.toString(),
        ReviewTargetType.STORE,
        storeId.toString(),
        orderId.toString(),
      );

      expect(result).toBe(true);
    });

    it('should throw BadRequestException if store does not match', async () => {
      orderModel.findOne.mockResolvedValue(mockOrder);

      await expect(
        service.verifyPurchase(
          customerId.toString(),
          ReviewTargetType.STORE,
          new Types.ObjectId().toString(),
          orderId.toString(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should verify courier purchase', async () => {
      orderModel.findOne.mockResolvedValue(mockOrder);

      const result = await service.verifyPurchase(
        customerId.toString(),
        ReviewTargetType.COURIER,
        courierId.toString(),
        orderId.toString(),
      );

      expect(result).toBe(true);
    });

    it('should throw BadRequestException if courier does not match', async () => {
      orderModel.findOne.mockResolvedValue({ ...mockOrder, courierId: null });

      await expect(
        service.verifyPurchase(
          customerId.toString(),
          ReviewTargetType.COURIER,
          courierId.toString(),
          orderId.toString(),
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkDuplicateReview', () => {
    it('should pass if no duplicate review', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      await expect(
        service.checkDuplicateReview(
          customerId.toString(),
          ReviewTargetType.PRODUCT,
          productId.toString(),
          orderId.toString(),
        ),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException if duplicate exists', async () => {
      reviewRepository.findOne.mockResolvedValue({
        _id: new Types.ObjectId(),
      } as any);

      await expect(
        service.checkDuplicateReview(
          customerId.toString(),
          ReviewTargetType.PRODUCT,
          productId.toString(),
          orderId.toString(),
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
