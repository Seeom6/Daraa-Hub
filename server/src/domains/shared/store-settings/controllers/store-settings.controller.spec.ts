import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { StoreSettingsController } from './store-settings.controller';
import { StoreSettingsService } from '../services/store-settings.service';

describe('StoreSettingsController', () => {
  let controller: StoreSettingsController;
  let service: StoreSettingsService;

  const mockStoreSettingsService = {
    getOrCreate: jest.fn(),
    getPublicSettings: jest.fn(),
    update: jest.fn(),
    isStoreOpen: jest.fn(),
    calculateShippingFee: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreSettingsController],
      providers: [
        { provide: StoreSettingsService, useValue: mockStoreSettingsService },
      ],
    }).compile();

    controller = module.get<StoreSettingsController>(StoreSettingsController);
    service = module.get<StoreSettingsService>(StoreSettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return settings for admin', async () => {
      const mockSettings = { storeId: 'store-123', isOpen: true };
      mockStoreSettingsService.getOrCreate.mockResolvedValue(mockSettings);

      const result = await controller.getSettings('store-123', {
        role: 'admin',
      });

      expect(result).toEqual({ success: true, data: mockSettings });
      expect(service.getOrCreate).toHaveBeenCalledWith('store-123');
    });

    it('should return settings for store owner accessing own store', async () => {
      const mockSettings = { storeId: 'store-123', isOpen: true };
      mockStoreSettingsService.getOrCreate.mockResolvedValue(mockSettings);

      const result = await controller.getSettings('store-123', {
        role: 'store_owner',
        profileId: 'store-123',
      });

      expect(result).toEqual({ success: true, data: mockSettings });
    });

    it('should throw ForbiddenException for store owner accessing other store', async () => {
      await expect(
        controller.getSettings('store-456', {
          role: 'store_owner',
          profileId: 'store-123',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPublicSettings', () => {
    it('should return public settings', async () => {
      const mockSettings = { storeName: 'Test Store', isOpen: true };
      mockStoreSettingsService.getPublicSettings.mockResolvedValue(
        mockSettings,
      );

      const result = await controller.getPublicSettings('store-123');

      expect(result).toEqual({ success: true, data: mockSettings });
      expect(service.getPublicSettings).toHaveBeenCalledWith('store-123');
    });
  });

  describe('updateSettings', () => {
    it('should update settings for admin', async () => {
      const updateDto = { isOpen: false };
      const mockSettings = { storeId: 'store-123', isOpen: false };
      mockStoreSettingsService.update.mockResolvedValue(mockSettings);

      const result = await controller.updateSettings('store-123', updateDto, {
        role: 'admin',
        userId: 'admin-123',
      });

      expect(result).toEqual({
        success: true,
        message: 'Store settings updated successfully',
        data: mockSettings,
      });
      expect(service.update).toHaveBeenCalledWith(
        'store-123',
        updateDto,
        'admin-123',
      );
    });

    it('should throw ForbiddenException for store owner updating other store', async () => {
      await expect(
        controller.updateSettings(
          'store-456',
          {},
          { role: 'store_owner', profileId: 'store-123' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('isStoreOpen', () => {
    it('should return true when store is open', async () => {
      mockStoreSettingsService.isStoreOpen.mockResolvedValue(true);

      const result = await controller.isStoreOpen('store-123');

      expect(result).toEqual({ success: true, data: { isOpen: true } });
    });

    it('should return false when store is closed', async () => {
      mockStoreSettingsService.isStoreOpen.mockResolvedValue(false);

      const result = await controller.isStoreOpen('store-123');

      expect(result).toEqual({ success: true, data: { isOpen: false } });
    });
  });

  describe('calculateShippingFee', () => {
    it('should calculate shipping fee', async () => {
      mockStoreSettingsService.calculateShippingFee.mockResolvedValue(5000);

      const result = await controller.calculateShippingFee(
        'store-123',
        'Damascus',
        '50000',
      );

      expect(result).toEqual({ success: true, data: { shippingFee: 5000 } });
      expect(service.calculateShippingFee).toHaveBeenCalledWith(
        'store-123',
        'Damascus',
        50000,
      );
    });

    it('should handle invalid orderTotal', async () => {
      mockStoreSettingsService.calculateShippingFee.mockResolvedValue(10000);

      const result = await controller.calculateShippingFee(
        'store-123',
        'Aleppo',
        'invalid',
      );

      expect(service.calculateShippingFee).toHaveBeenCalledWith(
        'store-123',
        'Aleppo',
        0,
      );
    });
  });
});
