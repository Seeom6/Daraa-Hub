import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CourierProfileService } from './courier-profile.service';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';
import { generateObjectId } from '../../testing';

describe('CourierProfileService', () => {
  let service: CourierProfileService;

  const mockProfileModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const accountId = generateObjectId();
  const courierId = generateObjectId();

  const mockProfile = {
    _id: courierId,
    accountId,
    status: 'available',
    currentLocation: { type: 'Point', coordinates: [36.2, 33.5] },
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierProfileService,
        {
          provide: getModelToken(CourierProfile.name),
          useValue: mockProfileModel,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<CourierProfileService>(CourierProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfileByAccountId', () => {
    it('should return profile', async () => {
      mockProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfile),
      });

      const result = await service.getProfileByAccountId(accountId);

      expect(result).toEqual(mockProfile);
    });

    it('should throw if not found', async () => {
      mockProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getProfileByAccountId(accountId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProfileById', () => {
    it('should return profile by id', async () => {
      mockProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfile),
      });

      const result = await service.getProfileById(courierId);

      expect(result).toEqual(mockProfile);
    });

    it('should throw if not found', async () => {
      mockProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getProfileById(courierId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status and emit event', async () => {
      mockProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfile),
      });

      const result = await service.updateStatus(accountId, {
        status: 'busy',
      } as any);

      expect(mockProfile.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'courier.status.changed',
        expect.any(Object),
      );
    });
  });

  describe('updateLocation', () => {
    it('should update location and emit event', async () => {
      mockProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfile),
      });

      const result = await service.updateLocation(accountId, {
        coordinates: [36.3, 33.6],
      } as any);

      expect(mockProfile.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'courier.location.updated',
        expect.any(Object),
      );
    });
  });

  describe('findAvailableCouriers', () => {
    it('should find available couriers near location with default distance', async () => {
      mockProfileModel.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockProfile]),
      });

      const result = await service.findAvailableCouriers(36.2, 33.5);

      expect(result).toEqual([mockProfile]);
    });

    it('should find available couriers with custom distance', async () => {
      mockProfileModel.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockProfile]),
      });

      const result = await service.findAvailableCouriers(36.2, 33.5, 5000);

      expect(result).toEqual([mockProfile]);
    });

    it('should return empty array when no couriers available', async () => {
      mockProfileModel.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAvailableCouriers(36.2, 33.5);

      expect(result).toEqual([]);
    });
  });

  describe('updateProfile', () => {
    it('should update profile and save', async () => {
      mockProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfile),
      });

      const result = await service.updateProfile(accountId, {
        vehicleType: 'motorcycle',
      } as any);

      expect(mockProfile.save).toHaveBeenCalled();
    });
  });
});
