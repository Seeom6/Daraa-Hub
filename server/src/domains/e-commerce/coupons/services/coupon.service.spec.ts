import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { CouponCrudService } from './coupon-crud.service';
import { CouponQueryService } from './coupon-query.service';
import { generateObjectId } from '../../../shared/testing';

describe('CouponService', () => {
  let service: CouponService;

  const mockCrudService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleActive: jest.fn(),
  };

  const mockQueryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCode: jest.fn(),
  };

  const couponId = generateObjectId();
  const storeId = generateObjectId();
  const userId = generateObjectId();

  const mockCoupon = {
    _id: couponId,
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    storeId,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: CouponCrudService, useValue: mockCrudService },
        { provide: CouponQueryService, useValue: mockQueryService },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.create.mockResolvedValue(mockCoupon);

      const result = await service.create({ code: 'SAVE20' } as any, userId);

      expect(result).toEqual(mockCoupon);
      expect(mockCrudService.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.update.mockResolvedValue({
        ...mockCoupon,
        discountValue: 25,
      });

      const result = await service.update(couponId, {
        discountValue: 25,
      } as any);

      expect(result.discountValue).toBe(25);
    });
  });

  describe('remove', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.remove.mockResolvedValue(undefined);

      await service.remove(couponId);

      expect(mockCrudService.remove).toHaveBeenCalledWith(couponId);
    });
  });

  describe('toggleActive', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.toggleActive.mockResolvedValue({
        ...mockCoupon,
        isActive: false,
      });

      const result = await service.toggleActive(couponId);

      expect(result.isActive).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [mockCoupon],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll({});

      expect(result.data).toEqual([mockCoupon]);
    });
  });

  describe('findOne', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findOne.mockResolvedValue(mockCoupon);

      const result = await service.findOne(couponId);

      expect(result).toEqual(mockCoupon);
    });
  });

  describe('findByCode', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findByCode.mockResolvedValue(mockCoupon);

      const result = await service.findByCode('SAVE20');

      expect(result).toEqual(mockCoupon);
    });
  });
});
