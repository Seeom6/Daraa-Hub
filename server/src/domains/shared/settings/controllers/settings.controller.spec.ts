import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from '../services/settings.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../admin/guards/admin.guard';
import { PermissionsGuard } from '../../admin/guards/permissions.guard';
import { generateObjectId } from '../../testing';

describe('SettingsController', () => {
  let controller: SettingsController;
  let settingsService: jest.Mocked<SettingsService>;

  const userId = generateObjectId();
  const mockReq = { user: { sub: userId } };

  const mockSettings = {
    _id: generateObjectId(),
    key: 'general',
    value: { siteName: 'Daraa Hub' },
    category: 'general',
  };

  beforeEach(async () => {
    settingsService = {
      findByKey: jest.fn().mockResolvedValue(mockSettings),
      findAll: jest.fn().mockResolvedValue([mockSettings]),
      create: jest.fn().mockResolvedValue(mockSettings),
      update: jest.fn().mockResolvedValue(mockSettings),
      updateValue: jest.fn().mockResolvedValue(mockSettings),
      delete: jest.fn().mockResolvedValue(undefined),
      initializeDefaults: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SettingsController>(SettingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicSettings', () => {
    it('should return public settings', async () => {
      const result = await controller.getPublicSettings('general');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSettings);
    });

    it('should reject non-public settings', async () => {
      const result = await controller.getPublicSettings('private');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Settings not available publicly');
    });
  });

  describe('getAllSettings', () => {
    it('should return all settings', async () => {
      const result = await controller.getAllSettings();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockSettings]);
    });

    it('should filter by category', async () => {
      await controller.getAllSettings('general');

      expect(settingsService.findAll).toHaveBeenCalledWith('general');
    });
  });

  describe('getSettings', () => {
    it('should return settings by key', async () => {
      const result = await controller.getSettings('general');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSettings);
    });
  });

  describe('createSettings', () => {
    it('should create settings', async () => {
      const createDto = { key: 'general', value: { siteName: 'Daraa Hub' } };

      const result = await controller.createSettings(createDto as any, mockReq);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Settings created successfully');
    });
  });

  describe('updateSettings', () => {
    it('should update settings', async () => {
      const updateDto = { value: { siteName: 'New Name' } };

      const result = await controller.updateSettings(
        'general',
        updateDto as any,
        mockReq,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Settings updated successfully');
    });
  });

  describe('updateSettingsValue', () => {
    it('should update settings value', async () => {
      const value = { siteName: 'New Name' };

      const result = await controller.updateSettingsValue(
        'general',
        value,
        mockReq,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Settings value updated successfully');
    });
  });

  describe('deleteSettings', () => {
    it('should delete settings', async () => {
      const result = await controller.deleteSettings('general');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Settings deleted successfully');
    });
  });

  describe('initializeDefaults', () => {
    it('should initialize default settings', async () => {
      const result = await controller.initializeDefaults();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Default settings initialized successfully');
    });
  });
});
