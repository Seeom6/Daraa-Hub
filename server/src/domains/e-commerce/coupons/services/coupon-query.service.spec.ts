import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponQueryService } from './coupon-query.service';
import { CouponRepository } from '../repositories/coupon.repository';
import { generateObjectId } from '../../../shared/testing';

describe('CouponQueryService', () => {
  let service: CouponQueryService;
  let mockRepository: any;
  let mockModel: any;

  const mockCoupon = {
    _id: generateObjectId(),
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    isActive: true,
  };

  beforeEach(async () => {
    mockModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockResolvedValue(mockCoupon),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockCoupon]),
    };

    mockRepository = {
      getModel: jest.fn().mockReturnValue(mockModel),
      count: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponQueryService,
        { provide: CouponRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<CouponQueryService>(CouponQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated coupons', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockCoupon]);
      expect(result.total).toBe(1);
    });

    it('should filter by type', async () => {
      await service.findAll({ type: 'percentage' });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter by isActive', async () => {
      await service.findAll({ isActive: true });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter by storeId', async () => {
      const storeId = generateObjectId();
      await service.findAll({ storeId });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid storeId', async () => {
      await expect(service.findAll({ storeId: 'invalid' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should filter by categoryId', async () => {
      const categoryId = generateObjectId();
      await service.findAll({ categoryId });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid categoryId', async () => {
      await expect(service.findAll({ categoryId: 'invalid' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should filter by productId', async () => {
      const productId = generateObjectId();
      await service.findAll({ productId });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid productId', async () => {
      await expect(service.findAll({ productId: 'invalid' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should search by code', async () => {
      await service.findAll({ search: 'SAVE' });

      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return coupon by id', async () => {
      mockModel.exec.mockResolvedValue(mockCoupon);

      const result = await service.findOne(mockCoupon._id);

      expect(result).toEqual(mockCoupon);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.exec.mockResolvedValue(null);

      await expect(service.findOne(generateObjectId())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCode', () => {
    it('should return coupon by code', async () => {
      const result = await service.findByCode('SAVE20');

      expect(result).toEqual(mockCoupon);
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.findByCode('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
