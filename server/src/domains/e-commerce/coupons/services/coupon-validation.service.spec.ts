import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponValidationService } from './coupon-validation.service';
import { CouponRepository } from '../repositories/coupon.repository';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';
import { CouponType } from '../../../../database/schemas/coupon.schema';
import { generateObjectId, MockModelFactory } from '../../../shared/testing';

describe('CouponValidationService', () => {
  let service: CouponValidationService;
  let couponRepository: jest.Mocked<CouponRepository>;
  let customerProfileModel: any;

  const mockCouponRepository = {
    getModel: jest.fn(),
  };

  const createMockCoupon = (overrides = {}) => ({
    _id: generateObjectId(),
    code: 'TEST10',
    type: CouponType.PERCENTAGE,
    discountValue: 10,
    isActive: true,
    validFrom: new Date(Date.now() - 86400000),
    validUntil: new Date(Date.now() + 86400000),
    usageLimit: { total: 100, perUser: 1 },
    usedCount: 0,
    usageHistory: [],
    minPurchaseAmount: 0,
    applicableTo: { stores: [], categories: [], products: [], userTiers: [] },
    ...overrides,
  });

  beforeEach(async () => {
    customerProfileModel = MockModelFactory.create();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponValidationService,
        { provide: CouponRepository, useValue: mockCouponRepository },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: customerProfileModel,
        },
      ],
    }).compile();

    service = module.get<CouponValidationService>(CouponValidationService);
    couponRepository = module.get(CouponRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCoupon', () => {
    it('should return valid for a valid coupon', async () => {
      const mockCoupon = createMockCoupon();
      mockCouponRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.validateCoupon({
        code: 'TEST10',
        orderAmount: 100,
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(10);
    });

    it('should return invalid for non-existent coupon', async () => {
      mockCouponRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      const result = await service.validateCoupon({
        code: 'INVALID',
        orderAmount: 100,
      });

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon not found');
    });

    it('should return invalid for inactive coupon', async () => {
      const mockCoupon = createMockCoupon({ isActive: false });
      mockCouponRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.validateCoupon({
        code: 'TEST10',
        orderAmount: 100,
      });

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon is not active');
    });

    it('should return invalid for expired coupon', async () => {
      const mockCoupon = createMockCoupon({
        validUntil: new Date(Date.now() - 86400000),
      });
      mockCouponRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.validateCoupon({
        code: 'TEST10',
        orderAmount: 100,
      });

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon has expired');
    });

    it('should return invalid when usage limit reached', async () => {
      const mockCoupon = createMockCoupon({
        usageLimit: { total: 10 },
        usedCount: 10,
      });
      mockCouponRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.validateCoupon({
        code: 'TEST10',
        orderAmount: 100,
      });

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon usage limit reached');
    });

    it('should return invalid when minimum order not met', async () => {
      const mockCoupon = createMockCoupon({ minPurchaseAmount: 200 });
      mockCouponRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.validateCoupon({
        code: 'TEST10',
        orderAmount: 100,
      });

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Minimum order value');
    });

    it('should calculate fixed discount correctly', async () => {
      const mockCoupon = createMockCoupon({
        type: CouponType.FIXED,
        discountValue: 50,
      });
      mockCouponRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.validateCoupon({
        code: 'TEST10',
        orderAmount: 100,
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(50);
    });

    it('should cap discount at order amount for fixed coupons', async () => {
      const mockCoupon = createMockCoupon({
        type: CouponType.FIXED,
        discountValue: 150,
      });
      mockCouponRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await service.validateCoupon({
        code: 'TEST10',
        orderAmount: 100,
      });

      expect(result.discountAmount).toBe(100);
    });
  });

  describe('getAvailableCoupons', () => {
    it('should throw BadRequestException for invalid customer ID', async () => {
      await expect(service.getAvailableCoupons('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when customer not found', async () => {
      customerProfileModel.findById.mockResolvedValue(null);

      await expect(
        service.getAvailableCoupons(generateObjectId()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
