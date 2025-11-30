import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryZoneController } from './delivery-zone.controller';
import { DeliveryZoneService } from '../services/delivery-zone.service';
import { generateObjectId } from '../../testing';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { ZoneType } from '../../../../database/schemas/delivery-zone.schema';

describe('DeliveryZoneController', () => {
  let controller: DeliveryZoneController;
  let zoneService: jest.Mocked<DeliveryZoneService>;

  const mockZoneService = {
    getAllZones: jest.fn(),
    getZoneTree: jest.fn(),
    findZoneByLocation: jest.fn(),
    findNearbyZones: jest.fn(),
    getZone: jest.fn(),
    getZoneStores: jest.fn(),
    createZone: jest.fn(),
    updateZone: jest.fn(),
    deleteZone: jest.fn(),
    getZoneStats: jest.fn(),
    getStoreZones: jest.fn(),
    addStoreToZone: jest.fn(),
    removeStoreFromZone: jest.fn(),
    updateStoreZoneSettings: jest.fn(),
    calculateDeliveryFee: jest.fn(),
    checkStoreCoversZone: jest.fn(),
  };

  const zoneId = generateObjectId();
  const accountId = generateObjectId();
  const mockRequest = { user: { accountId } };

  const mockZone = {
    _id: zoneId,
    name: 'Damascus',
    nameAr: 'دمشق',
    type: ZoneType.CITY,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryZoneController],
      providers: [{ provide: DeliveryZoneService, useValue: mockZoneService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DeliveryZoneController>(DeliveryZoneController);
    zoneService = module.get(DeliveryZoneService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllZones', () => {
    it('should return all zones', async () => {
      mockZoneService.getAllZones.mockResolvedValue([mockZone]);

      const result = await controller.getAllZones();

      expect(result).toEqual([mockZone]);
    });
  });

  describe('getZoneTree', () => {
    it('should return zone tree', async () => {
      mockZoneService.getZoneTree.mockResolvedValue([
        { ...mockZone, children: [] },
      ]);

      const result = await controller.getZoneTree();

      expect(result).toBeDefined();
    });
  });

  describe('getZone', () => {
    it('should return zone by id', async () => {
      mockZoneService.getZone.mockResolvedValue(mockZone);

      const result = await controller.getZone(zoneId);

      expect(result).toEqual(mockZone);
    });
  });

  describe('createZone', () => {
    it('should create zone', async () => {
      const createDto = {
        name: 'Damascus',
        nameAr: 'دمشق',
        type: ZoneType.CITY,
      };
      mockZoneService.createZone.mockResolvedValue(mockZone);

      const result = await controller.createZone(mockRequest, createDto as any);

      expect(result).toEqual(mockZone);
    });
  });

  describe('updateZone', () => {
    it('should update zone', async () => {
      const updateDto = { name: 'Updated' };
      mockZoneService.updateZone.mockResolvedValue({
        ...mockZone,
        name: 'Updated',
      });

      const result = await controller.updateZone(
        zoneId,
        mockRequest,
        updateDto as any,
      );

      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteZone', () => {
    it('should delete zone', async () => {
      mockZoneService.deleteZone.mockResolvedValue(undefined);

      const result = await controller.deleteZone(zoneId);

      expect(result.message).toBe('تم حذف المنطقة بنجاح');
    });
  });

  describe('calculateDeliveryFee', () => {
    it('should calculate delivery fee', async () => {
      mockZoneService.calculateDeliveryFee.mockResolvedValue({ fee: 5000 });

      const result = await controller.calculateDeliveryFee(
        accountId,
        zoneId,
        50000,
      );

      expect(result).toEqual({ fee: 5000 });
    });
  });

  describe('checkStoreCoverage', () => {
    it('should check store coverage', async () => {
      mockZoneService.checkStoreCoversZone.mockResolvedValue(true);

      const result = await controller.checkStoreCoverage(accountId, zoneId);

      expect(result.covers).toBe(true);
    });

    it('should return false when store does not cover zone', async () => {
      mockZoneService.checkStoreCoversZone.mockResolvedValue(false);

      const result = await controller.checkStoreCoverage(accountId, zoneId);

      expect(result.covers).toBe(false);
    });
  });

  describe('getAllZones with type filter', () => {
    it('should filter zones by type', async () => {
      mockZoneService.getAllZones.mockResolvedValue([mockZone]);

      await controller.getAllZones(ZoneType.CITY);

      expect(mockZoneService.getAllZones).toHaveBeenCalledWith(ZoneType.CITY);
    });

    it('should return all zones when no type provided', async () => {
      mockZoneService.getAllZones.mockResolvedValue([mockZone]);

      await controller.getAllZones();

      expect(mockZoneService.getAllZones).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getZoneByLocation', () => {
    it('should find zone by location', async () => {
      mockZoneService.findZoneByLocation.mockResolvedValue(mockZone);

      const result = await controller.getZoneByLocation({
        longitude: 36.2765,
        latitude: 33.5138,
      });

      expect(mockZoneService.findZoneByLocation).toHaveBeenCalledWith(
        36.2765,
        33.5138,
      );
      expect(result).toEqual(mockZone);
    });
  });

  describe('getNearbyZones', () => {
    it('should find nearby zones', async () => {
      mockZoneService.findNearbyZones.mockResolvedValue([mockZone]);

      const result = await controller.getNearbyZones({
        longitude: 36.2765,
        latitude: 33.5138,
        maxDistanceMeters: 5000,
      });

      expect(mockZoneService.findNearbyZones).toHaveBeenCalledWith(
        36.2765,
        33.5138,
        5000,
      );
      expect(result).toEqual([mockZone]);
    });

    it('should use default distance when not provided', async () => {
      mockZoneService.findNearbyZones.mockResolvedValue([mockZone]);

      await controller.getNearbyZones({
        longitude: 36.2765,
        latitude: 33.5138,
      });

      expect(mockZoneService.findNearbyZones).toHaveBeenCalledWith(
        36.2765,
        33.5138,
        undefined,
      );
    });
  });

  describe('getZoneStores', () => {
    it('should return stores in zone', async () => {
      const stores = [{ storeAccountId: accountId, zoneId }];
      mockZoneService.getZoneStores.mockResolvedValue(stores);

      const result = await controller.getZoneStores(zoneId);

      expect(result).toEqual(stores);
    });
  });

  describe('getZoneStats', () => {
    it('should return zone statistics', async () => {
      const stats = { totalZones: 10, activeZones: 8 };
      mockZoneService.getZoneStats.mockResolvedValue(stats);

      const result = await controller.getZoneStats();

      expect(result).toEqual(stats);
    });
  });

  describe('getMyStoreZones', () => {
    it('should return store zones', async () => {
      const zones = [{ zoneId, deliveryFee: 5000 }];
      mockZoneService.getStoreZones.mockResolvedValue(zones);

      const result = await controller.getMyStoreZones(mockRequest);

      expect(mockZoneService.getStoreZones).toHaveBeenCalledWith(accountId);
      expect(result).toEqual(zones);
    });
  });

  describe('addMyStoreToZone', () => {
    it('should add store to zone', async () => {
      const addDto = { zoneId, deliveryFee: 5000 };
      const storeZone = { storeAccountId: accountId, zoneId };
      mockZoneService.addStoreToZone.mockResolvedValue(storeZone);

      const result = await controller.addMyStoreToZone(
        mockRequest,
        addDto as any,
      );

      expect(mockZoneService.addStoreToZone).toHaveBeenCalledWith(
        accountId,
        addDto,
      );
      expect(result).toEqual(storeZone);
    });
  });

  describe('removeMyStoreFromZone', () => {
    it('should remove store from zone', async () => {
      mockZoneService.removeStoreFromZone.mockResolvedValue(undefined);

      const result = await controller.removeMyStoreFromZone(
        mockRequest,
        zoneId,
      );

      expect(mockZoneService.removeStoreFromZone).toHaveBeenCalledWith(
        accountId,
        zoneId,
      );
      expect(result.message).toBe('تم إزالة المنطقة من التغطية');
    });
  });

  describe('updateMyStoreZoneSettings', () => {
    it('should update store zone settings', async () => {
      const updateDto = { deliveryFee: 6000 };
      const updatedZone = {
        storeAccountId: accountId,
        zoneId,
        deliveryFee: 6000,
      };
      mockZoneService.updateStoreZoneSettings.mockResolvedValue(updatedZone);

      const result = await controller.updateMyStoreZoneSettings(
        mockRequest,
        zoneId,
        updateDto,
      );

      expect(mockZoneService.updateStoreZoneSettings).toHaveBeenCalledWith(
        accountId,
        zoneId,
        updateDto,
      );
      expect(result).toEqual(updatedZone);
    });
  });
});
