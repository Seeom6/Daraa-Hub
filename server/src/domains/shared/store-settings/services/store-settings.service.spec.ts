import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StoreSettingsService } from './store-settings.service';
import { StoreSettings } from '../../../../database/schemas/store-settings.schema';
import { generateObjectId, MockModelFactory } from '../../testing';

describe('StoreSettingsService', () => {
  let service: StoreSettingsService;
  let mockModel: any;

  const storeId = generateObjectId();
  const userId = generateObjectId();

  const mockSettings = {
    _id: generateObjectId(),
    storeId,
    defaultShippingFee: 5000,
    freeShippingThreshold: 50000,
    shippingZones: [
      {
        name: 'Damascus',
        cities: ['Damascus', 'Mazzeh'],
        shippingFee: 3000,
        freeShippingThreshold: 40000,
      },
    ],
    businessHours: [
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    ],
    paymentMethods: [{ name: 'cash', isEnabled: true }],
    isActive: true,
    maintenanceMode: false,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create(mockSettings);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreSettingsService,
        { provide: getModelToken(StoreSettings.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<StoreSettingsService>(StoreSettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreate', () => {
    it('should return existing settings', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.getOrCreate(storeId);

      expect(result).toEqual(mockSettings);
    });

    it('should create settings if not exists', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSettings),
      }));

      const result = await service.getOrCreate(storeId);

      expect(result).toBeDefined();
    });

    it('should throw on invalid store id', async () => {
      await expect(service.getOrCreate('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByStoreId', () => {
    it('should return settings', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.findByStoreId(storeId);

      expect(result).toEqual(mockSettings);
    });

    it('should throw if not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByStoreId(storeId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update settings', async () => {
      const settingsWithSave = {
        ...mockSettings,
        save: jest.fn().mockResolvedValue(mockSettings),
      };
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(settingsWithSave),
      });

      const result = await service.update(
        storeId,
        { defaultShippingFee: 6000 },
        userId,
      );

      expect(result).toBeDefined();
    });
  });

  describe('getShippingFee', () => {
    it('should return zone shipping fee', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.getShippingFee(storeId, 'Damascus');

      expect(result).toBe(3000);
    });

    it('should return default fee if city not in zone', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.getShippingFee(storeId, 'Aleppo');

      expect(result).toBe(5000);
    });
  });

  describe('calculateShippingFee', () => {
    it('should return free shipping if above threshold', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.calculateShippingFee(
        storeId,
        'Damascus',
        50000,
      );

      expect(result).toBe(0);
    });

    it('should return zone shipping fee if below threshold', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.calculateShippingFee(
        storeId,
        'Damascus',
        10000,
      );

      expect(result).toBe(3000);
    });

    it('should return default fee for unknown city', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.calculateShippingFee(
        storeId,
        'Aleppo',
        10000,
      );

      expect(result).toBe(5000);
    });
  });

  describe('getPublicSettings', () => {
    it('should return public-facing settings only', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockSettings,
          minOrderAmount: 1000,
          maxOrderAmount: 100000,
          allowCashOnDelivery: true,
          returnPeriod: 14,
          allowReturns: true,
          returnPolicy: 'Return policy text',
          refundPolicy: 'Refund policy text',
          termsAndConditions: 'Terms text',
          privacyPolicy: 'Privacy text',
          shippingPolicy: 'Shipping text',
          taxRate: 10,
          includeTaxInPrice: true,
          enablePointsSystem: true,
          pointsPerCurrency: 1,
          pointsRedemptionRate: 100,
          facebookUrl: 'https://facebook.com/store',
          instagramUrl: 'https://instagram.com/store',
          whatsappNumber: '+963991234567',
          telegramUrl: 'https://t.me/store',
          maintenanceMessage: 'Under maintenance',
        }),
      });

      const result = await service.getPublicSettings(storeId);

      expect(result.businessHours).toBeDefined();
      expect(result.shippingZones).toBeDefined();
      expect(result.isActive).toBe(true);
    });
  });

  describe('isStoreOpen', () => {
    it('should return false if store is not active', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockSettings, isActive: false }),
      });

      const result = await service.isStoreOpen(storeId);

      expect(result).toBe(false);
    });

    it('should return false if store is in maintenance mode', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockSettings, maintenanceMode: true }),
      });

      const result = await service.isStoreOpen(storeId);

      expect(result).toBe(false);
    });

    it('should return false if store is closed today', async () => {
      const now = new Date();
      const dayName = now
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockSettings,
          businessHours: [{ day: dayName, isOpen: false }],
        }),
      });

      const result = await service.isStoreOpen(storeId);

      expect(result).toBe(false);
    });

    it('should return true if store is open and within hours', async () => {
      const now = new Date();
      const dayName = now
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockSettings,
          businessHours: [
            {
              day: dayName,
              isOpen: true,
              openTime: '00:00',
              closeTime: '23:59',
            },
          ],
        }),
      });

      const result = await service.isStoreOpen(storeId);

      expect(result).toBe(true);
    });

    it('should return false if no hours defined for today', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockSettings,
          businessHours: [{ day: 'nonexistentday', isOpen: true }],
        }),
      });

      const result = await service.isStoreOpen(storeId);

      expect(result).toBe(false);
    });
  });
});
