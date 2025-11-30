import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StoreDeliveryZoneRepository } from './store-delivery-zone.repository';
import { StoreDeliveryZone } from '../../../../database/schemas/store-delivery-zone.schema';

describe('StoreDeliveryZoneRepository', () => {
  let repository: StoreDeliveryZoneRepository;
  let mockModel: any;

  const storeAccountId = new Types.ObjectId().toString();
  const zoneId = new Types.ObjectId().toString();

  const mockStoreZone = {
    _id: new Types.ObjectId(),
    storeAccountId: new Types.ObjectId(storeAccountId),
    zoneId: new Types.ObjectId(zoneId),
    isActive: true,
    customDeliveryFee: 500,
  };

  beforeEach(async () => {
    mockModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn().mockReturnThis(),
      create: jest.fn(),
      updateOne: jest.fn(),
      countDocuments: jest.fn(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreDeliveryZoneRepository,
        {
          provide: getModelToken(StoreDeliveryZone.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<StoreDeliveryZoneRepository>(
      StoreDeliveryZoneRepository,
    );
  });

  describe('findByStore', () => {
    it('should find zones by store', async () => {
      mockModel.exec.mockResolvedValue([mockStoreZone]);

      const result = await repository.findByStore(storeAccountId);

      expect(mockModel.find).toHaveBeenCalled();
      expect(mockModel.populate).toHaveBeenCalledWith('zoneId');
      expect(result).toEqual([mockStoreZone]);
    });
  });

  describe('findActiveByStore', () => {
    it('should find active zones by store', async () => {
      mockModel.exec.mockResolvedValue([mockStoreZone]);

      const result = await repository.findActiveByStore(storeAccountId);

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
      expect(result).toEqual([mockStoreZone]);
    });
  });

  describe('findByZone', () => {
    it('should find stores by zone', async () => {
      mockModel.exec.mockResolvedValue([mockStoreZone]);

      const result = await repository.findByZone(zoneId);

      expect(mockModel.populate).toHaveBeenCalledWith('storeAccountId');
      expect(result).toEqual([mockStoreZone]);
    });
  });

  describe('findStoreZone', () => {
    it('should find specific store zone', async () => {
      mockModel.exec.mockResolvedValue(mockStoreZone);

      const result = await repository.findStoreZone(storeAccountId, zoneId);

      expect(result).toEqual(mockStoreZone);
    });

    it('should return null if not found', async () => {
      mockModel.exec.mockResolvedValue(null);

      const result = await repository.findStoreZone(storeAccountId, zoneId);

      expect(result).toBeNull();
    });
  });

  describe('addStoreToZone', () => {
    it('should update existing store zone', async () => {
      mockModel.exec
        .mockResolvedValueOnce(mockStoreZone)
        .mockResolvedValueOnce(mockStoreZone);

      const result = await repository.addStoreToZone(storeAccountId, zoneId, {
        customDeliveryFee: 600,
      });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockStoreZone);
    });

    it('should create new store zone if not exists', async () => {
      mockModel.exec.mockResolvedValue(null);
      const createdDoc = {
        ...mockStoreZone,
        populate: jest.fn().mockResolvedValue(mockStoreZone),
      };
      mockModel.create.mockResolvedValue(createdDoc);

      const result = await repository.addStoreToZone(storeAccountId, zoneId);

      expect(mockModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockStoreZone);
    });
  });

  describe('removeStoreFromZone', () => {
    it('should deactivate store zone', async () => {
      mockModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await repository.removeStoreFromZone(
        storeAccountId,
        zoneId,
      );

      expect(result).toBe(true);
    });

    it('should return false if not found', async () => {
      mockModel.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await repository.removeStoreFromZone(
        storeAccountId,
        zoneId,
      );

      expect(result).toBe(false);
    });
  });

  describe('updateStoreZoneSettings', () => {
    it('should update store zone settings', async () => {
      mockModel.exec.mockResolvedValue(mockStoreZone);

      const result = await repository.updateStoreZoneSettings(
        storeAccountId,
        zoneId,
        { customDeliveryFee: 700 },
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockStoreZone);
    });
  });

  describe('getStoresCountByZone', () => {
    it('should count stores in zone', async () => {
      mockModel.countDocuments.mockResolvedValue(5);

      const result = await repository.getStoresCountByZone(zoneId);

      expect(result).toBe(5);
    });
  });

  describe('getZonesCountByStore', () => {
    it('should count zones for store', async () => {
      mockModel.countDocuments.mockResolvedValue(3);

      const result = await repository.getZonesCountByStore(storeAccountId);

      expect(result).toBe(3);
    });
  });
});
