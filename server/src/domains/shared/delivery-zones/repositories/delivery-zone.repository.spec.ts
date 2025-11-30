import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DeliveryZoneRepository } from './delivery-zone.repository';
import { DeliveryZone } from '../../../../database/schemas/delivery-zone.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('DeliveryZoneRepository', () => {
  let repository: DeliveryZoneRepository;
  let mockModel: any;

  const zoneId = generateObjectId();
  const mockZone = {
    _id: zoneId,
    name: 'Damascus',
    type: 'city',
    status: 'active',
    sortOrder: 1,
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockZone]);
    mockModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockZone) });
    mockModel.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    mockModel.aggregate = jest
      .fn()
      .mockResolvedValue([{ type: 'city', count: 5 }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryZoneRepository,
        { provide: getModelToken(DeliveryZone.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<DeliveryZoneRepository>(DeliveryZoneRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByName', () => {
    it('should find zone by name', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockZone),
      });

      const result = await repository.findByName('Damascus');

      expect(result).toEqual(mockZone);
    });
  });

  describe('findActiveZones', () => {
    it('should find active zones without type filter', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockZone]),
      });

      const result = await repository.findActiveZones();

      expect(result).toEqual([mockZone]);
    });

    it('should find active zones with type filter', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockZone]),
      });

      const result = await repository.findActiveZones('city' as any);

      expect(result).toEqual([mockZone]);
    });
  });

  describe('findByParent', () => {
    it('should find zones by parent', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockZone]),
      });

      const result = await repository.findByParent(generateObjectId());

      expect(result).toEqual([mockZone]);
    });
  });

  describe('findZoneTree', () => {
    it('should find zone tree', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockZone]),
      });

      const result = await repository.findZoneTree();

      expect(result).toEqual([mockZone]);
    });
  });

  describe('findZoneByLocation', () => {
    it('should find zone by location', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockZone),
      });

      const result = await repository.findZoneByLocation(36.3, 33.5);

      expect(result).toEqual(mockZone);
    });

    it('should return null when no zone found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findZoneByLocation(0, 0);

      expect(result).toBeNull();
    });
  });

  describe('findNearbyZones', () => {
    it('should find nearby zones with default distance', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockZone]),
      });

      const result = await repository.findNearbyZones(36.3, 33.5);

      expect(result).toEqual([mockZone]);
    });

    it('should find nearby zones with custom distance', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockZone]),
      });

      const result = await repository.findNearbyZones(36.3, 33.5, 5000);

      expect(result).toEqual([mockZone]);
    });
  });

  describe('updateStatus', () => {
    it('should update zone status', async () => {
      const result = await repository.updateStatus(zoneId, 'inactive' as any);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('incrementStats', () => {
    it('should increment totalOrders', async () => {
      await repository.incrementStats(zoneId, 'totalOrders', 1);

      expect(mockModel.updateOne).toHaveBeenCalled();
    });

    it('should increment activeStores', async () => {
      await repository.incrementStats(zoneId, 'activeStores', 1);

      expect(mockModel.updateOne).toHaveBeenCalled();
    });

    it('should increment activeCouriers', async () => {
      await repository.incrementStats(zoneId, 'activeCouriers', 1);

      expect(mockModel.updateOne).toHaveBeenCalled();
    });

    it('should use default increment of 1', async () => {
      await repository.incrementStats(zoneId, 'totalOrders');

      expect(mockModel.updateOne).toHaveBeenCalled();
    });
  });

  describe('getZoneStats', () => {
    it('should return zone statistics', async () => {
      mockModel.countDocuments.mockResolvedValue(10);

      const result = await repository.getZoneStats();

      expect(result.totalZones).toBe(10);
      expect(result.byType).toBeDefined();
    });
  });

  describe('findByName when not found', () => {
    it('should return null when zone not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByName('NonExistent');

      expect(result).toBeNull();
    });
  });
});
