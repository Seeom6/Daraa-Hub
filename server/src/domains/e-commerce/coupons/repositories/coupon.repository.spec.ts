import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CouponRepository } from './coupon.repository';
import { Coupon } from '../../../../database/schemas/coupon.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';
import { FakerDataFactory } from '../../../shared/testing/mock-data.factory';

describe('CouponRepository', () => {
  let repository: CouponRepository;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = MockModelFactory.create();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponRepository,
        {
          provide: getModelToken(Coupon.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<CouponRepository>(CouponRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByCode', () => {
    it('should find coupon by code (case insensitive)', async () => {
      const mockCoupon = FakerDataFactory.createCoupon({ code: 'SAVE20' });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await repository.findByCode('save20');

      expect(mockModel.findOne).toHaveBeenCalledWith(
        { code: 'SAVE20' },
        null,
        undefined,
      );
      expect(result).toEqual(mockCoupon);
    });

    it('should return null if coupon not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByCode('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('findActiveCoupons', () => {
    it('should find active coupons', async () => {
      const mockCoupons = FakerDataFactory.createMany(
        () => FakerDataFactory.createCoupon({ isActive: true }),
        3,
      );
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupons),
      });

      const result = await repository.findActiveCoupons();

      expect(result).toHaveLength(3);
    });

    it('should filter by store id when provided', async () => {
      const storeId = generateObjectId();
      const mockCoupons = [FakerDataFactory.createCoupon({ storeId })];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupons),
      });

      const result = await repository.findActiveCoupons(storeId);

      expect(result).toHaveLength(1);
    });
  });

  describe('validateCoupon', () => {
    it('should return valid for active coupon', async () => {
      const mockCoupon = FakerDataFactory.createCoupon({
        code: 'VALID',
        isActive: true,
        validFrom: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() + 86400000),
        minPurchaseAmount: 50,
        usageLimit: { total: 100 },
        usedCount: 10,
      });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await repository.validateCoupon(
        'VALID',
        generateObjectId(),
        100,
      );

      expect(result.valid).toBe(true);
      expect(result.coupon).toBeDefined();
    });

    it('should return invalid for non-existent coupon', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.validateCoupon(
        'INVALID',
        generateObjectId(),
        100,
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon not found');
    });

    it('should return invalid for inactive coupon', async () => {
      const mockCoupon = FakerDataFactory.createCoupon({ isActive: false });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await repository.validateCoupon(
        'INACTIVE',
        generateObjectId(),
        100,
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon is not active');
    });

    it('should return invalid for expired coupon', async () => {
      const mockCoupon = FakerDataFactory.createCoupon({
        isActive: true,
        validFrom: new Date(Date.now() - 86400000 * 10),
        validUntil: new Date(Date.now() - 86400000),
      });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await repository.validateCoupon(
        'EXPIRED',
        generateObjectId(),
        100,
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon has expired');
    });

    it('should return invalid when usage limit reached', async () => {
      const mockCoupon = FakerDataFactory.createCoupon({
        isActive: true,
        validFrom: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() + 86400000),
        usageLimit: { total: 10 },
        usedCount: 10,
      });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await repository.validateCoupon(
        'MAXED',
        generateObjectId(),
        100,
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon usage limit reached');
    });
  });

  describe('incrementUsage', () => {
    it('should increment coupon usage count', async () => {
      const couponId = generateObjectId();
      const mockCoupon = FakerDataFactory.createCoupon({ usedCount: 11 });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCoupon),
      });

      const result = await repository.incrementUsage(couponId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        couponId,
        { $inc: { usedCount: 1 } },
        { new: true },
      );
    });
  });
});
