import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CourierEarningsService } from './courier-earnings.service';
import { CourierProfileService } from './courier-profile.service';
import { Order } from '../../../../database/schemas/order.schema';
import { generateObjectId } from '../../testing';

describe('CourierEarningsService', () => {
  let service: CourierEarningsService;

  const mockOrderModel = {
    find: jest.fn(),
  };

  const mockProfileService = {
    getProfileByAccountId: jest.fn(),
  };

  const accountId = generateObjectId();
  const courierId = generateObjectId();

  const mockProfile = {
    _id: courierId,
    accountId,
    commissionRate: 15,
    totalDeliveries: 100,
    rating: 4.8,
    totalReviews: 50,
  };

  const mockOrder = {
    _id: generateObjectId(),
    courierId,
    orderStatus: 'delivered',
    deliveryFee: 1000,
    actualDeliveryTime: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierEarningsService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: CourierProfileService, useValue: mockProfileService },
      ],
    }).compile();

    service = module.get<CourierEarningsService>(CourierEarningsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEarningsSummary', () => {
    it('should return earnings summary', async () => {
      mockProfileService.getProfileByAccountId.mockResolvedValue(mockProfile);
      mockOrderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockOrder]),
      });

      const result = await service.getEarningsSummary(accountId);

      expect(result.totalDeliveries).toBe(100);
      expect(result.commissionRate).toBe(15);
      expect(result.rating).toBe(4.8);
    });

    it('should calculate today earnings', async () => {
      mockProfileService.getProfileByAccountId.mockResolvedValue(mockProfile);
      mockOrderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockOrder]),
      });

      const result = await service.getEarningsSummary(accountId);

      expect(result.todayDeliveries).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getEarningsForPeriod', () => {
    it('should return earnings for period', async () => {
      mockProfileService.getProfileByAccountId.mockResolvedValue(mockProfile);
      mockOrderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockOrder]),
      });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await service.getEarningsForPeriod(
        accountId,
        startDate,
        endDate,
      );

      expect(result.period.start).toEqual(startDate);
      expect(result.period.end).toEqual(endDate);
      expect(result.totalDeliveries).toBe(1);
    });

    it('should calculate average per delivery', async () => {
      mockProfileService.getProfileByAccountId.mockResolvedValue(mockProfile);
      mockOrderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockOrder, mockOrder]),
      });

      const result = await service.getEarningsForPeriod(
        accountId,
        new Date(),
        new Date(),
      );

      expect(result.averagePerDelivery).toBeGreaterThan(0);
    });

    it('should handle zero deliveries', async () => {
      mockProfileService.getProfileByAccountId.mockResolvedValue(mockProfile);
      mockOrderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getEarningsForPeriod(
        accountId,
        new Date(),
        new Date(),
      );

      expect(result.averagePerDelivery).toBe(0);
    });
  });
});
