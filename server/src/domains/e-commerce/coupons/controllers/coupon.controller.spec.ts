import { Test, TestingModule } from '@nestjs/testing';
import { CouponController } from './coupon.controller';
import { CouponService } from '../services/coupon.service';
import { CouponValidationService } from '../services/coupon-validation.service';
import { CouponUsageService } from '../services/coupon-usage.service';
import { generateObjectId } from '../../../shared/testing';

describe('CouponController', () => {
  let controller: CouponController;
  let couponService: jest.Mocked<CouponService>;
  let couponValidationService: jest.Mocked<CouponValidationService>;
  let couponUsageService: jest.Mocked<CouponUsageService>;

  const mockCouponService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCouponValidationService = {
    validateCoupon: jest.fn(),
    getAvailableCoupons: jest.fn(),
  };

  const mockCouponUsageService = {
    getUsageStats: jest.fn(),
  };

  const mockUser = {
    userId: generateObjectId(),
    profileId: generateObjectId(),
    role: 'admin',
  };

  const couponId = generateObjectId();
  const mockCoupon = {
    _id: couponId,
    code: 'SAVE20',
    discountValue: 20,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        { provide: CouponService, useValue: mockCouponService },
        {
          provide: CouponValidationService,
          useValue: mockCouponValidationService,
        },
        { provide: CouponUsageService, useValue: mockCouponUsageService },
      ],
    }).compile();

    controller = module.get<CouponController>(CouponController);
    couponService = module.get(CouponService);
    couponValidationService = module.get(CouponValidationService);
    couponUsageService = module.get(CouponUsageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCoupon', () => {
    it('should validate coupon successfully', async () => {
      const validateDto = { code: 'SAVE20', orderTotal: 100 };
      const validationResult = {
        valid: true,
        message: 'Valid',
        discountAmount: 20,
        coupon: mockCoupon,
      };
      mockCouponValidationService.validateCoupon.mockResolvedValue(
        validationResult,
      );

      const result = await controller.validateCoupon(
        { ...mockUser, role: 'customer' },
        validateDto as any,
      );

      expect(result.success).toBe(true);
      expect(result.data.discountAmount).toBe(20);
    });

    it('should return invalid coupon result', async () => {
      const validateDto = { code: 'INVALID', orderTotal: 100 };
      const validationResult = { valid: false, message: 'Coupon not found' };
      mockCouponValidationService.validateCoupon.mockResolvedValue(
        validationResult,
      );

      const result = await controller.validateCoupon(
        { ...mockUser, role: 'customer' },
        validateDto as any,
      );

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });

  describe('getAvailableCoupons', () => {
    it('should return available coupons', async () => {
      mockCouponValidationService.getAvailableCoupons.mockResolvedValue([
        mockCoupon,
      ]);

      const result = await controller.getAvailableCoupons({
        ...mockUser,
        role: 'customer',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCoupon]);
    });
  });

  describe('createCoupon', () => {
    it('should create coupon', async () => {
      const createDto = { code: 'SAVE20', discountValue: 20 };
      mockCouponService.create.mockResolvedValue(mockCoupon);

      const result = await controller.createCoupon(mockUser, createDto as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Coupon created successfully');
    });
  });

  describe('getAllCoupons', () => {
    it('should return all coupons', async () => {
      const queryResult = { data: [mockCoupon], total: 1, page: 1, limit: 20 };
      mockCouponService.findAll.mockResolvedValue(queryResult);

      const result = await controller.getAllCoupons({} as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCoupon]);
    });
  });

  describe('getCoupon', () => {
    it('should return coupon by id', async () => {
      mockCouponService.findOne.mockResolvedValue(mockCoupon);

      const result = await controller.getCoupon(couponId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCoupon);
    });
  });

  describe('updateCoupon', () => {
    it('should update coupon', async () => {
      const updateDto = { discountValue: 25 };
      const updatedCoupon = { ...mockCoupon, discountValue: 25 };
      mockCouponService.update.mockResolvedValue(updatedCoupon);

      const result = await controller.updateCoupon(couponId, updateDto as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Coupon updated successfully');
    });
  });

  describe('deleteCoupon', () => {
    it('should delete coupon', async () => {
      mockCouponService.remove.mockResolvedValue(undefined);

      const result = await controller.deleteCoupon(couponId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Coupon deleted successfully');
    });
  });

  describe('getCouponUsageStats', () => {
    it('should return usage stats', async () => {
      const stats = { totalUsage: 100, totalDiscount: 2000 };
      mockCouponUsageService.getUsageStats.mockResolvedValue(stats);

      const result = await controller.getCouponUsageStats(couponId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(stats);
    });
  });
});
