import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CourierSuspensionService } from './courier-suspension.service';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';
import {
  MockModelFactory,
  generateObjectId,
  createMockEventEmitter,
} from '../../testing';

describe('CourierSuspensionService', () => {
  let service: CourierSuspensionService;
  let courierModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const courierId = generateObjectId();
  const adminId = generateObjectId();

  const mockCourier = {
    _id: courierId,
    status: 'available',
    isCourierSuspended: false,
    isAvailableForDelivery: true,
    commissionRate: 10,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    courierModel = MockModelFactory.create([mockCourier]);
    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierSuspensionService,
        { provide: getModelToken(CourierProfile.name), useValue: courierModel },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<CourierSuspensionService>(CourierSuspensionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('suspendCourier', () => {
    it('should suspend courier', async () => {
      courierModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourier),
      });

      const result = await service.suspendCourier(
        courierId,
        adminId,
        'Violation',
      );

      expect(mockCourier.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'courier.suspended',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if courier not found', async () => {
      courierModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.suspendCourier(courierId, adminId, 'Violation'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unsuspendCourier', () => {
    it('should unsuspend courier', async () => {
      courierModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourier),
      });

      const result = await service.unsuspendCourier(courierId);

      expect(mockCourier.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'courier.unsuspended',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if courier not found', async () => {
      courierModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.unsuspendCourier(courierId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCommissionRate', () => {
    it('should update commission rate', async () => {
      courierModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourier),
      });

      const result = await service.updateCommissionRate(courierId, 15);

      expect(mockCourier.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid rate', async () => {
      courierModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourier),
      });

      await expect(
        service.updateCommissionRate(courierId, 150),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if courier not found', async () => {
      courierModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateCommissionRate(courierId, 15)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
