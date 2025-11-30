import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CouponCrudService } from './coupon-crud.service';
import { CouponRepository } from '../repositories/coupon.repository';
import { generateObjectId } from '../../../shared/testing';
import { CouponType } from '../../../../database/schemas/coupon.schema';

describe('CouponCrudService', () => {
  let service: CouponCrudService;
  let couponRepository: jest.Mocked<CouponRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const mockCouponRepository = {
    getModel: jest.fn().mockReturnValue(mockModel),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const couponId = generateObjectId();
  const adminId = generateObjectId();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponCrudService,
        { provide: CouponRepository, useValue: mockCouponRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<CouponCrudService>(CouponCrudService);
    couponRepository = module.get(CouponRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      code: 'SAVE20',
      type: CouponType.PERCENTAGE,
      discountValue: 20,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2024-12-31'),
    };

    it('should create coupon successfully', async () => {
      const createdCoupon = { _id: couponId, ...createDto, code: 'SAVE20' };
      mockModel.findOne.mockResolvedValue(null);
      mockCouponRepository.create.mockResolvedValue(createdCoupon);

      const result = await service.create(createDto as any, adminId);

      expect(result).toEqual(createdCoupon);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'coupon.created',
        expect.any(Object),
      );
    });

    it('should throw if code already exists', async () => {
      mockModel.findOne.mockResolvedValue({ code: 'SAVE20' });

      await expect(service.create(createDto as any, adminId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if validFrom >= validUntil', async () => {
      const invalidDto = {
        ...createDto,
        validFrom: new Date('2024-12-31'),
        validUntil: new Date('2024-01-01'),
      };
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.create(invalidDto as any, adminId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if percentage discount exceeds 100', async () => {
      const invalidDto = { ...createDto, discountValue: 150 };
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.create(invalidDto as any, adminId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const mockCoupon = {
      _id: couponId,
      code: 'SAVE20',
      type: CouponType.PERCENTAGE,
      discountValue: 20,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2024-12-31'),
      applicableTo: {
        stores: [],
        categories: [],
        products: [],
        userTiers: [],
        newUsersOnly: false,
      },
      save: jest.fn(),
    };

    it('should update coupon successfully', async () => {
      mockModel.findById.mockResolvedValue(mockCoupon);

      const result = await service.update(couponId, { discountValue: 25 });

      expect(mockCoupon.save).toHaveBeenCalled();
    });

    it('should throw for invalid id', async () => {
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if coupon not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.update(couponId, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete coupon', async () => {
      mockCouponRepository.delete.mockResolvedValue(true);

      await service.remove(couponId);

      expect(mockCouponRepository.delete).toHaveBeenCalledWith(couponId);
    });

    it('should throw if coupon not found', async () => {
      mockCouponRepository.delete.mockResolvedValue(null);

      await expect(service.remove(couponId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleActive', () => {
    it('should toggle coupon active status', async () => {
      const mockCoupon = { _id: couponId, isActive: true, save: jest.fn() };
      mockModel.findById.mockResolvedValue(mockCoupon);

      const result = await service.toggleActive(couponId);

      expect(mockCoupon.isActive).toBe(false);
      expect(mockCoupon.save).toHaveBeenCalled();
    });

    it('should throw for invalid id', async () => {
      await expect(service.toggleActive('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if coupon not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.toggleActive(couponId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove with invalid id', () => {
    it('should throw for invalid id', async () => {
      await expect(service.remove('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update with date validation', () => {
    const mockCoupon = {
      _id: couponId,
      code: 'SAVE20',
      type: CouponType.PERCENTAGE,
      discountValue: 20,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2024-12-31'),
      applicableTo: {
        stores: [],
        categories: [],
        products: [],
        userTiers: [],
        newUsersOnly: false,
      },
      save: jest.fn(),
    };

    it('should throw if updated dates are invalid', async () => {
      mockModel.findById.mockResolvedValue(mockCoupon);

      await expect(
        service.update(couponId, {
          validFrom: new Date('2024-12-31'),
          validUntil: new Date('2024-01-01'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if percentage discount exceeds 100 on update', async () => {
      mockModel.findById.mockResolvedValue(mockCoupon);

      await expect(
        service.update(couponId, { discountValue: 150 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update applicableTo when provided', async () => {
      mockModel.findById.mockResolvedValue(mockCoupon);

      await service.update(couponId, {
        applicableTo: {
          stores: [generateObjectId()],
          newUsersOnly: true,
        },
      } as any);

      expect(mockCoupon.save).toHaveBeenCalled();
    });
  });

  describe('create with applicableTo', () => {
    it('should create coupon with applicableTo fields', async () => {
      const createDto = {
        code: 'SAVE20',
        type: CouponType.PERCENTAGE,
        discountValue: 20,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        applicableTo: {
          stores: [generateObjectId()],
          categories: [generateObjectId()],
          products: [generateObjectId()],
          userTiers: ['gold'],
          newUsersOnly: true,
        },
      };
      const createdCoupon = { _id: couponId, ...createDto };
      mockModel.findOne.mockResolvedValue(null);
      mockCouponRepository.create.mockResolvedValue(createdCoupon);

      const result = await service.create(createDto as any, adminId);

      expect(result).toEqual(createdCoupon);
    });
  });

  describe('create with fixed amount type', () => {
    it('should allow discount value over 100 for fixed amount', async () => {
      const createDto = {
        code: 'SAVE200',
        type: CouponType.FIXED_AMOUNT,
        discountValue: 200,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
      };
      const createdCoupon = { _id: couponId, ...createDto };
      mockModel.findOne.mockResolvedValue(null);
      mockCouponRepository.create.mockResolvedValue(createdCoupon);

      const result = await service.create(createDto as any, adminId);

      expect(result).toEqual(createdCoupon);
    });
  });
});
