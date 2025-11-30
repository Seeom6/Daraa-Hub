import { Test, TestingModule } from '@nestjs/testing';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsService } from '../services/system-settings.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { generateObjectId } from '../../testing';

describe('SystemSettingsController', () => {
  let controller: SystemSettingsController;
  let systemSettingsService: jest.Mocked<SystemSettingsService>;

  const userId = generateObjectId();
  const mockUser = { userId };

  const mockSettings = {
    _id: generateObjectId(),
    subscriptionEnabled: true,
    trialDays: 14,
    gracePeriodDays: 7,
  };

  beforeEach(async () => {
    systemSettingsService = {
      getSubscriptionSettings: jest.fn().mockResolvedValue(mockSettings),
      updateSubscriptionSettings: jest.fn().mockResolvedValue(mockSettings),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemSettingsController],
      providers: [
        { provide: SystemSettingsService, useValue: systemSettingsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SystemSettingsController>(SystemSettingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubscriptionSettings', () => {
    it('should return subscription settings', async () => {
      const result = await controller.getSubscriptionSettings();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSettings);
      expect(systemSettingsService.getSubscriptionSettings).toHaveBeenCalled();
    });
  });

  describe('updateSubscriptionSettings', () => {
    it('should update subscription settings', async () => {
      const updateDto = { subscriptionEnabled: false };

      const result = await controller.updateSubscriptionSettings(
        updateDto as any,
        mockUser,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription settings updated successfully');
      expect(
        systemSettingsService.updateSubscriptionSettings,
      ).toHaveBeenCalledWith(updateDto, userId);
    });
  });
});
