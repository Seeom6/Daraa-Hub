import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SettingsDefaultsService } from './settings-defaults.service';
import { SystemSettings } from '../../../../database/schemas/system-settings.schema';

describe('SettingsDefaultsService', () => {
  let service: SettingsDefaultsService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(data),
    }));
    mockModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsDefaultsService,
        { provide: getModelToken(SystemSettings.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<SettingsDefaultsService>(SettingsDefaultsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeDefaults', () => {
    it('should initialize default settings', async () => {
      await service.initializeDefaults();

      // Should check for each default setting
      expect(mockModel.findOne).toHaveBeenCalled();
    });

    it('should not create settings if already exist', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ key: 'general' }),
      });

      await service.initializeDefaults();

      // Model constructor should not be called for existing settings
      expect(mockModel).not.toHaveBeenCalled();
    });

    it('should create settings if not exist', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.initializeDefaults();

      // Model constructor should be called for new settings
      expect(mockModel).toHaveBeenCalled();
    });
  });
});
