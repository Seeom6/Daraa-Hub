import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CourierDeliveryQueryService } from './courier-delivery-query.service';
import { CourierProfileService } from './courier-profile.service';
import { Order } from '../../../../database/schemas/order.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('CourierDeliveryQueryService', () => {
  let service: CourierDeliveryQueryService;
  let orderModel: any;
  let courierProfileService: jest.Mocked<CourierProfileService>;

  const courierId = generateObjectId();
  const accountId = generateObjectId();
  const orderId = generateObjectId();

  const mockCourier = {
    _id: courierId,
    accountId,
    status: 'available',
  };

  const mockOrder = {
    _id: orderId,
    courierId,
    orderStatus: 'delivering',
  };

  beforeEach(async () => {
    orderModel = MockModelFactory.create([mockOrder]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierDeliveryQueryService,
        { provide: getModelToken(Order.name), useValue: orderModel },
        {
          provide: CourierProfileService,
          useValue: {
            getProfileByAccountId: jest.fn().mockResolvedValue(mockCourier),
          },
        },
      ],
    }).compile();

    service = module.get<CourierDeliveryQueryService>(
      CourierDeliveryQueryService,
    );
    courierProfileService = module.get(CourierProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveDeliveries', () => {
    it('should return active deliveries for courier', async () => {
      orderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockOrder]),
      });

      const result = await service.getActiveDeliveries(accountId);

      expect(courierProfileService.getProfileByAccountId).toHaveBeenCalledWith(
        accountId,
      );
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('getDeliveryHistory', () => {
    it('should return delivery history for courier', async () => {
      orderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockOrder]),
      });

      const result = await service.getDeliveryHistory(accountId, 50);

      expect(courierProfileService.getProfileByAccountId).toHaveBeenCalledWith(
        accountId,
      );
      expect(result).toEqual([mockOrder]);
    });
  });
});
