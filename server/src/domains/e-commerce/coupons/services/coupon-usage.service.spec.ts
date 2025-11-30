import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CouponUsageService } from './coupon-usage.service';
import { CouponRepository } from '../repositories/coupon.repository';
import { generateObjectId } from '../../../shared/testing';

describe('CouponUsageService', () => {
  let service: CouponUsageService;
  let mockRepository: any;
  let mockEventEmitter: any;
  let mockModel: any;

  const userId = generateObjectId();
  const orderId = generateObjectId();
  const mockCoupon = {
    _id: generateObjectId(),
    code: 'SAVE20',
    usedCount: 0,
    usageHistory: [],
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockModel = {
      findOne: jest.fn().mockResolvedValue(mockCoupon),
      findById: jest.fn().mockResolvedValue(mockCoupon),
      find: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([mockCoupon]) }),
    };

    mockRepository = {
      getModel: jest.fn().mockReturnValue(mockModel),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponUsageService,
        { provide: CouponRepository, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<CouponUsageService>(CouponUsageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockCoupon.usedCount = 0;
    mockCoupon.usageHistory = [];
  });

  describe('applyCoupon', () => {
    it('should apply coupon to order', async () => {
      await service.applyCoupon('SAVE20', userId, orderId, 100);

      expect(mockCoupon.usedCount).toBe(1);
      expect(mockCoupon.usageHistory.length).toBe(1);
      expect(mockCoupon.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'coupon.applied',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if coupon not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(
        service.applyCoupon('INVALID', userId, orderId, 100),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      mockCoupon.usageHistory = [
        {
          userId: { toString: () => userId },
          discountAmount: 50,
          usedAt: new Date(),
        },
        {
          userId: { toString: () => userId },
          discountAmount: 30,
          usedAt: new Date(),
        },
      ];

      const result = await service.getUsageStats(mockCoupon._id);

      expect(result.totalUsage).toBe(2);
      expect(result.totalDiscount).toBe(80);
      expect(result.uniqueUsers).toBe(1);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.getUsageStats('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if coupon not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.getUsageStats(generateObjectId())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserUsageHistory', () => {
    it('should return user usage history', async () => {
      mockCoupon.usageHistory = [
        {
          userId: { toString: () => userId },
          orderId: { toString: () => orderId },
          usedAt: new Date(),
          discountAmount: 50,
        },
      ];

      const result = await service.getUserUsageHistory(userId);

      expect(result.length).toBe(1);
    });

    it('should throw BadRequestException for invalid customerId', async () => {
      await expect(service.getUserUsageHistory('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid couponId', async () => {
      await expect(
        service.getUserUsageHistory(userId, 'invalid'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetUsage', () => {
    it('should reset coupon usage', async () => {
      mockCoupon.usedCount = 5;
      mockCoupon.usageHistory = [{ userId }];

      await service.resetUsage(mockCoupon._id);

      expect(mockCoupon.usedCount).toBe(0);
      expect(mockCoupon.usageHistory).toEqual([]);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'coupon.usage_reset',
        expect.any(Object),
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.resetUsage('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if coupon not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.resetUsage(generateObjectId())).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
