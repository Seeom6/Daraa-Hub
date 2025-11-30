import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettings } from '../../../../database/schemas/system-settings.schema';
import { generateObjectId } from '../../testing';

describe('SystemSettingsService', () => {
  let service: SystemSettingsService;

  const mockSettingsModel = {
    findOne: jest.fn(),
  };

  const adminId = generateObjectId();

  const mockSettings = {
    _id: generateObjectId(),
    key: 'subscription',
    value: {
      subscriptionSystemEnabled: true,
      allowManualPayment: true,
    },
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemSettingsService,
        {
          provide: getModelToken(SystemSettings.name),
          useValue: mockSettingsModel,
        },
      ],
    }).compile();

    service = module.get<SystemSettingsService>(SystemSettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubscriptionSettings', () => {
    it('should return settings if exists', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.getSubscriptionSettings();

      expect(result).toEqual(mockSettings.value);
    });

    it('should return defaults if not exists', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getSubscriptionSettings();

      expect(result.subscriptionSystemEnabled).toBe(false);
      expect(result.allowManualPayment).toBe(true);
    });
  });

  describe('isSubscriptionSystemEnabled', () => {
    it('should return true if enabled', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.isSubscriptionSystemEnabled();

      expect(result).toBe(true);
    });

    it('should return false if disabled', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.isSubscriptionSystemEnabled();

      expect(result).toBe(false);
    });
  });

  describe('updateSubscriptionSettings', () => {
    it('should update existing settings', async () => {
      const existingSettings = {
        _id: generateObjectId(),
        key: 'subscription',
        value: { subscriptionSystemEnabled: false },
        save: jest.fn().mockResolvedValue(true),
      };
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingSettings),
      });

      const updateDto = {
        subscriptionSystemEnabled: true,
        allowManualPayment: true,
        trialPeriodDays: 7,
      };

      const result = await service.updateSubscriptionSettings(
        updateDto,
        adminId,
      );

      expect(existingSettings.save).toHaveBeenCalled();
      expect(result.subscriptionSystemEnabled).toBe(true);
      expect(result.trialPeriodDays).toBe(7);
    });

    it('should create new settings if not exists', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const MockModel = jest.fn().mockImplementation(() => ({
        save: mockSave,
        value: {
          subscriptionSystemEnabled: true,
          allowManualPayment: true,
          allowOnlinePayment: false,
          trialPeriodDays: 14,
          notificationSettings: {
            subscriptionExpiryWarningDays: 3,
            notifyOnSubscriptionExpiry: true,
            notifyOnDailyLimitReached: true,
            notifyOnPaymentSuccess: true,
            notifyOnPaymentFailure: true,
          },
        },
      }));

      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Replace the model constructor temporarily
      const originalModel = (service as any).settingsModel;
      (service as any).settingsModel = MockModel;
      (service as any).settingsModel.findOne = mockSettingsModel.findOne;

      const updateDto = {
        subscriptionSystemEnabled: true,
        trialPeriodDays: 14,
      };

      const result = await service.updateSubscriptionSettings(
        updateDto,
        adminId,
      );

      expect(mockSave).toHaveBeenCalled();
      expect(result.subscriptionSystemEnabled).toBe(true);

      // Restore original model
      (service as any).settingsModel = originalModel;
    });

    it('should use default values for missing fields', async () => {
      const existingSettings = {
        _id: generateObjectId(),
        key: 'subscription',
        value: {},
        save: jest.fn().mockResolvedValue(true),
      };
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingSettings),
      });

      const result = await service.updateSubscriptionSettings({}, adminId);

      expect(result.subscriptionSystemEnabled).toBe(false);
      expect(result.allowManualPayment).toBe(true);
      expect(result.allowOnlinePayment).toBe(false);
      expect(result.trialPeriodDays).toBe(0);
      expect(result.notificationSettings.subscriptionExpiryWarningDays).toBe(3);
    });

    it('should update notification settings', async () => {
      const existingSettings = {
        _id: generateObjectId(),
        key: 'subscription',
        value: {},
        save: jest.fn().mockResolvedValue(true),
      };
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingSettings),
      });

      const updateDto = {
        subscriptionExpiryWarningDays: 7,
        notifyOnSubscriptionExpiry: false,
        notifyOnDailyLimitReached: false,
      };

      const result = await service.updateSubscriptionSettings(
        updateDto,
        adminId,
      );

      expect(result.notificationSettings.subscriptionExpiryWarningDays).toBe(7);
      expect(result.notificationSettings.notifyOnSubscriptionExpiry).toBe(
        false,
      );
      expect(result.notificationSettings.notifyOnDailyLimitReached).toBe(false);
    });
  });
});
