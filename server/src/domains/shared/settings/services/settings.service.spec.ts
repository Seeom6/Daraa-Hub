import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { SettingsCacheService } from './settings-cache.service';
import { SettingsDefaultsService } from './settings-defaults.service';
import { SystemSettings } from '../../../../database/schemas/system-settings.schema';
import { generateObjectId } from '../../testing';

describe('SettingsService', () => {
  let service: SettingsService;

  const mockSettingsModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockCacheService = {
    getCachedSettings: jest.fn(),
    cacheSettings: jest.fn(),
    deleteCachedSettings: jest.fn(),
  };

  const mockDefaultsService = {
    initializeDefaults: jest.fn(),
  };

  const adminId = generateObjectId();

  const mockSettings = {
    _id: generateObjectId(),
    key: 'app.config',
    value: { theme: 'dark' },
    category: 'general',
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getModelToken(SystemSettings.name),
          useValue: mockSettingsModel,
        },
        { provide: SettingsCacheService, useValue: mockCacheService },
        { provide: SettingsDefaultsService, useValue: mockDefaultsService },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all settings', async () => {
      mockSettingsModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockSettings]),
      });

      const result = await service.findAll();

      expect(result).toEqual([mockSettings]);
    });

    it('should filter by category', async () => {
      mockSettingsModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockSettings]),
      });

      await service.findAll('general');

      expect(mockSettingsModel.find).toHaveBeenCalledWith({
        category: 'general',
      });
    });
  });

  describe('findByKey', () => {
    it('should return cached settings', async () => {
      mockCacheService.getCachedSettings.mockResolvedValue(mockSettings);

      const result = await service.findByKey('app.config');

      expect(result).toEqual(mockSettings);
    });

    it('should fetch from db if not cached', async () => {
      mockCacheService.getCachedSettings.mockResolvedValue(null);
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.findByKey('app.config');

      expect(result).toEqual(mockSettings);
    });

    it('should throw if not found', async () => {
      mockCacheService.getCachedSettings.mockResolvedValue(null);
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByKey('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update settings', async () => {
      mockSettingsModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.update(
        'app.config',
        { value: { theme: 'light' } } as any,
        adminId,
      );

      expect(result).toEqual(mockSettings);
    });

    it('should throw if not found', async () => {
      mockSettingsModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('unknown', {} as any, adminId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete settings', async () => {
      mockSettingsModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      await service.delete('app.config');

      expect(mockCacheService.deleteCachedSettings).toHaveBeenCalledWith(
        'app.config',
      );
    });

    it('should throw if not found', async () => {
      mockSettingsModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(service.delete('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('initializeDefaults', () => {
    it('should delegate to defaults service', async () => {
      mockDefaultsService.initializeDefaults.mockResolvedValue(undefined);

      await service.initializeDefaults();

      expect(mockDefaultsService.initializeDefaults).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create new settings', async () => {
      const createDto = {
        key: 'new.setting',
        value: { enabled: true },
        category: 'features',
      };
      const savedSettings = {
        ...createDto,
        _id: generateObjectId(),
        save: jest.fn().mockResolvedValue(createDto),
      };

      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock the constructor
      const MockModel = jest.fn().mockImplementation(() => savedSettings);
      (service as any).systemSettingsModel = MockModel;
      (service as any).systemSettingsModel.findOne = mockSettingsModel.findOne;

      const result = await service.create(createDto as any, adminId);

      expect(result).toEqual(createDto);
      expect(mockCacheService.cacheSettings).toHaveBeenCalled();
    });

    it('should throw ConflictException if key exists', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      await expect(
        service.create({ key: 'app.config' } as any, adminId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateValue', () => {
    it('should update settings value', async () => {
      const updatedSettings = { ...mockSettings, value: { theme: 'light' } };
      mockSettingsModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedSettings),
      });

      const result = await service.updateValue(
        'app.config',
        { theme: 'light' },
        adminId,
      );

      expect(result.value).toEqual({ theme: 'light' });
      expect(mockCacheService.cacheSettings).toHaveBeenCalled();
    });

    it('should throw NotFoundException if key not found', async () => {
      mockSettingsModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateValue('unknown', {}, adminId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getValue', () => {
    it('should return value from settings', async () => {
      mockCacheService.getCachedSettings.mockResolvedValue(mockSettings);

      const result = await service.getValue('app.config');

      expect(result).toEqual({ theme: 'dark' });
    });

    it('should return default value if not found', async () => {
      mockCacheService.getCachedSettings.mockResolvedValue(null);
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getValue('unknown', 'default');

      expect(result).toBe('default');
    });

    it('should throw if not found and no default', async () => {
      mockCacheService.getCachedSettings.mockResolvedValue(null);
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getValue('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getValueByPath', () => {
    it('should return value at path', async () => {
      const nestedSettings = {
        ...mockSettings,
        value: { app: { theme: { color: 'blue' } } },
      };
      mockCacheService.getCachedSettings.mockResolvedValue(nestedSettings);

      const result = await service.getValueByPath(
        'app.config',
        'app.theme.color',
      );

      expect(result).toBe('blue');
    });

    it('should return default if path not found', async () => {
      mockCacheService.getCachedSettings.mockResolvedValue(mockSettings);

      const result = await service.getValueByPath(
        'app.config',
        'nonexistent.path',
        'default',
      );

      expect(result).toBe('default');
    });

    it('should throw if path not found and no default', async () => {
      mockCacheService.getCachedSettings.mockResolvedValue(mockSettings);

      await expect(
        service.getValueByPath('app.config', 'nonexistent.path'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
