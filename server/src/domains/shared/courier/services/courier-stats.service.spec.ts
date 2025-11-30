import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { CourierStatsService } from './courier-stats.service';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';
import { Order } from '../../../../database/schemas/order.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('CourierStatsService', () => {
  let service: CourierStatsService;
  let courierModel: any;
  let orderModel: any;

  const courierId = generateObjectId();

  const mockCourier = {
    _id: courierId,
    status: 'available',
    totalDeliveries: 100,
    commissionRate: 10,
    rating: 4.5,
    totalReviews: 50,
    activeDeliveries: [],
    verificationStatus: 'approved',
    isCourierSuspended: false,
  };

  const mockOrder = {
    _id: generateObjectId(),
    courierId,
    orderStatus: 'delivered',
    deliveryFee: 100,
    createdAt: new Date('2024-01-01T10:00:00'),
    actualDeliveryTime: new Date('2024-01-01T10:30:00'),
  };

  beforeEach(async () => {
    courierModel = MockModelFactory.create([mockCourier]);
    orderModel = MockModelFactory.create([mockOrder]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierStatsService,
        { provide: getModelToken(CourierProfile.name), useValue: courierModel },
        { provide: getModelToken(Order.name), useValue: orderModel },
      ],
    }).compile();

    service = module.get<CourierStatsService>(CourierStatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCouriers', () => {
    it('should return all couriers with filters', async () => {
      courierModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCourier]),
      });

      const result = await service.getAllCouriers({ status: 'available' });

      expect(result).toEqual([mockCourier]);
    });
  });

  describe('getCourierStatistics', () => {
    it('should return courier statistics', async () => {
      courierModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourier),
      });
      orderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockOrder]),
      });

      const result = await service.getCourierStatistics(courierId);

      expect(result).toHaveProperty('totalDeliveries', 100);
      expect(result).toHaveProperty('rating', 4.5);
      expect(result).toHaveProperty('status', 'available');
    });

    it('should throw NotFoundException if courier not found', async () => {
      courierModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getCourierStatistics(courierId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
