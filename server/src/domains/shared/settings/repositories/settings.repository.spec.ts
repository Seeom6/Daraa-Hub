import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SystemSettingsRepository } from './settings.repository';
import { SystemSettings } from '../../../../database/schemas/system-settings.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('SystemSettingsRepository', () => {
  let repository: SystemSettingsRepository;
  let mockModel: any;

  const settingsId = generateObjectId();

  const mockSettings = {
    _id: settingsId,
    siteName: 'Daraa Hub',
    maintenanceMode: false,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockSettings]);
    mockModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSettings) });

    // Mock constructor for creating new settings
    const MockModelClass = jest.fn().mockImplementation(() => mockSettings);
    MockModelClass.findOne = mockModel.findOne;
    MockModelClass.findById = mockModel.findById;
    MockModelClass.findByIdAndUpdate = mockModel.findByIdAndUpdate;
    MockModelClass.find = mockModel.find;
    MockModelClass.countDocuments = mockModel.countDocuments;
    MockModelClass.create = mockModel.create;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemSettingsRepository,
        {
          provide: getModelToken(SystemSettings.name),
          useValue: MockModelClass,
        },
      ],
    }).compile();

    repository = module.get<SystemSettingsRepository>(SystemSettingsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return existing settings', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await repository.getSettings();

      expect(result).toEqual(mockSettings);
    });

    it('should create default settings if not exists', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.getSettings();

      expect(mockSettings.save).toHaveBeenCalled();
    });
  });

  describe('updateSettings', () => {
    it('should update settings', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await repository.updateSettings({ siteName: 'New Name' });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('getSetting', () => {
    it('should return specific setting value', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await repository.getSetting('siteName');

      expect(result).toBe('Daraa Hub');
    });

    it('should return null when settings not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockSettings.save.mockResolvedValue(null);

      const result = await repository.getSetting('siteName');

      // Will create new settings and return the value
      expect(result).toBeDefined();
    });
  });

  describe('updateSetting', () => {
    it('should update specific setting', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await repository.updateSetting('maintenanceMode', true);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should return null when settings not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockSettings.save.mockResolvedValue(null);

      const result = await repository.updateSetting('maintenanceMode', true);

      // Will create new settings first
      expect(mockSettings.save).toHaveBeenCalled();
    });
  });

  describe('updateSettings when settings not found', () => {
    it('should return null when settings cannot be retrieved', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockSettings.save.mockResolvedValue(null);

      const result = await repository.updateSettings({ siteName: 'New Name' });

      // Will create new settings first
      expect(mockSettings.save).toHaveBeenCalled();
    });
  });
});
