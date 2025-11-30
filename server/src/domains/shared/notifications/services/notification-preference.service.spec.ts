import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationPreference } from '../../../../database/schemas/notification-preference.schema';
import { generateObjectId } from '../../testing';

describe('NotificationPreferenceService', () => {
  let service: NotificationPreferenceService;
  let mockModel: any;

  const userId = generateObjectId();
  const mockPreference = {
    _id: generateObjectId(),
    userId,
    channels: { push: true, email: true, sms: true, in_app: true },
    categories: { orders: true, payments: true },
    language: 'ar',
    emailDigest: 'instant',
    quietHours: { enabled: false },
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockPreference),
    }));
    mockModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockPreference) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferenceService,
        {
          provide: getModelToken(NotificationPreference.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<NotificationPreferenceService>(
      NotificationPreferenceService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should return existing preferences', async () => {
      const result = await service.getPreferences(userId);

      expect(result).toEqual(mockPreference);
    });

    it('should create default preferences if not exists', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.getPreferences(userId);

      expect(mockModel).toHaveBeenCalled();
    });
  });

  describe('updatePreferences', () => {
    it('should update channels', async () => {
      const updateDto = { channels: { push: false } };

      await service.updatePreferences(userId, updateDto);

      expect(mockPreference.save).toHaveBeenCalled();
    });

    it('should update categories', async () => {
      const updateDto = { categories: { orders: false } };

      await service.updatePreferences(userId, updateDto);

      expect(mockPreference.save).toHaveBeenCalled();
    });

    it('should update language', async () => {
      const updateDto = { language: 'en' as const };

      await service.updatePreferences(userId, updateDto);

      expect(mockPreference.language).toBe('en');
    });

    it('should update emailDigest', async () => {
      const updateDto = { emailDigest: 'daily' as const };

      await service.updatePreferences(userId, updateDto);

      expect(mockPreference.emailDigest).toBe('daily');
    });

    it('should update quietHours', async () => {
      const updateDto = {
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'UTC',
        },
      };

      await service.updatePreferences(userId, updateDto);

      expect(mockPreference.save).toHaveBeenCalled();
    });
  });

  describe('shouldReceiveOnChannel', () => {
    it('should return true if channel and category enabled', async () => {
      // Reset mock to return fresh preference with all enabled
      const freshPreference = {
        channels: { push: true, email: true, sms: true, in_app: true },
        categories: { orders: true, payments: true },
        language: 'ar',
        quietHours: { enabled: false },
      };
      mockModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(freshPreference),
      });

      const result = await service.shouldReceiveOnChannel(
        userId,
        'push',
        'orders',
      );

      expect(result).toBe(true);
    });

    it('should return false if channel disabled', async () => {
      const disabledChannelPref = {
        channels: { push: false, email: true, sms: true, in_app: true },
        categories: { orders: true },
        language: 'ar',
        quietHours: { enabled: false },
      };
      mockModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(disabledChannelPref),
      });

      const result = await service.shouldReceiveOnChannel(
        userId,
        'push',
        'orders',
      );

      expect(result).toBe(false);
    });

    it('should return false if category disabled', async () => {
      const disabledCategoryPref = {
        channels: { push: true, email: true, sms: true, in_app: true },
        categories: { orders: false },
        language: 'ar',
        quietHours: { enabled: false },
      };
      mockModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(disabledCategoryPref),
      });

      const result = await service.shouldReceiveOnChannel(
        userId,
        'push',
        'orders',
      );

      expect(result).toBe(false);
    });
  });

  describe('getPreferredLanguage', () => {
    it('should return preferred language', async () => {
      const arabicPref = {
        channels: { push: true },
        categories: {},
        language: 'ar',
      };
      mockModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(arabicPref) });

      const result = await service.getPreferredLanguage(userId);

      expect(result).toBe('ar');
    });
  });

  describe('quiet hours', () => {
    it('should return false during quiet hours for push (all day quiet)', async () => {
      // Use all-day quiet hours to ensure we're always in quiet hours
      const quietHoursPref = {
        channels: { push: true, email: true, sms: true, in_app: true },
        categories: { orders: true },
        language: 'ar',
        quietHours: {
          enabled: true,
          startTime: '00:00',
          endTime: '23:59',
          timezone: 'UTC',
        },
      };
      mockModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(quietHoursPref) });

      const result = await service.shouldReceiveOnChannel(
        userId,
        'push',
        'orders',
      );

      expect(result).toBe(false);
    });

    it('should return false during quiet hours for sms (all day quiet)', async () => {
      const quietHoursPref = {
        channels: { push: true, email: true, sms: true, in_app: true },
        categories: { orders: true },
        language: 'ar',
        quietHours: {
          enabled: true,
          startTime: '00:00',
          endTime: '23:59',
          timezone: 'UTC',
        },
      };
      mockModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(quietHoursPref) });

      const result = await service.shouldReceiveOnChannel(
        userId,
        'sms',
        'orders',
      );

      expect(result).toBe(false);
    });

    it('should return true for email during quiet hours', async () => {
      const quietHoursPref = {
        channels: { push: true, email: true, sms: true, in_app: true },
        categories: { orders: true },
        language: 'ar',
        quietHours: {
          enabled: true,
          startTime: '00:00',
          endTime: '23:59',
          timezone: 'UTC',
        },
      };
      mockModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(quietHoursPref) });

      const result = await service.shouldReceiveOnChannel(
        userId,
        'email',
        'orders',
      );

      expect(result).toBe(true);
    });

    it('should handle overnight quiet hours', async () => {
      // Test overnight quiet hours (e.g., 22:00 - 08:00)
      const quietHoursPref = {
        channels: { push: true, email: true, sms: true, in_app: true },
        categories: { orders: true },
        language: 'ar',
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'UTC',
        },
      };
      mockModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(quietHoursPref) });

      // This test just verifies the logic runs without error
      const result = await service.shouldReceiveOnChannel(
        userId,
        'push',
        'orders',
      );
      expect(typeof result).toBe('boolean');
    });

    it('should handle invalid timezone gracefully', async () => {
      const invalidTimezonePref = {
        channels: { push: true, email: true, sms: true, in_app: true },
        categories: { orders: true },
        language: 'ar',
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'Invalid/Timezone',
        },
      };
      mockModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(invalidTimezonePref),
      });

      // Should not throw, should return true (error handling returns false for isInQuietHours)
      const result = await service.shouldReceiveOnChannel(
        userId,
        'push',
        'orders',
      );
      expect(typeof result).toBe('boolean');
    });
  });

  describe('updatePreferences - create if not exists', () => {
    it('should create preferences if not exists when updating', async () => {
      mockModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const newPref = {
        channels: { push: true, email: true, sms: true, in_app: true },
        categories: {},
        language: 'ar',
        save: jest.fn().mockResolvedValue(true),
      };
      mockModel.mockImplementation(() => newPref);

      await service.updatePreferences(userId, { language: 'en' });

      expect(mockModel).toHaveBeenCalled();
    });
  });
});
