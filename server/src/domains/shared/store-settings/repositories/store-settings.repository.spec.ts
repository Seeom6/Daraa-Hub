import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StoreSettingsRepository } from './store-settings.repository';
import { StoreSettings } from '../../../../database/schemas/store-settings.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('StoreSettingsRepository', () => {
  let repository: StoreSettingsRepository;
  let mockModel: any;

  const settingsId = generateObjectId();
  const storeId = generateObjectId();

  const mockSettings = {
    _id: settingsId,
    storeId,
    acceptsOrders: true,
    deliveryEnabled: true,
    pickupEnabled: false,
  };

  beforeEach(async () => {
    const saveMock = jest.fn().mockResolvedValue(mockSettings);
    mockModel = MockModelFactory.create([mockSettings]);
    mockModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSettings) });
    mockModel.create = jest.fn().mockResolvedValue(mockSettings);

    // Mock constructor for creating new documents
    const MockModelClass: any = jest.fn().mockImplementation(() => ({
      ...mockSettings,
      save: saveMock,
    }));
    MockModelClass.findOne = mockModel.findOne;
    MockModelClass.findById = mockModel.findById;
    MockModelClass.findByIdAndUpdate = mockModel.findByIdAndUpdate;
    MockModelClass.find = mockModel.find;
    MockModelClass.countDocuments = mockModel.countDocuments;
    MockModelClass.create = mockModel.create;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreSettingsRepository,
        {
          provide: getModelToken(StoreSettings.name),
          useValue: MockModelClass,
        },
      ],
    }).compile();

    repository = module.get<StoreSettingsRepository>(StoreSettingsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByStoreId', () => {
    it('should find settings by store ID', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await repository.findByStoreId(storeId);

      expect(result).toEqual(mockSettings);
    });
  });

  describe('getOrCreateSettings', () => {
    it('should return existing settings', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await repository.getOrCreateSettings(storeId);

      expect(result).toEqual(mockSettings);
    });

    it('should create settings if not exists', async () => {
      mockModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.getOrCreateSettings(storeId);

      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateStoreSettings', () => {
    it('should update store settings', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await repository.updateStoreSettings(storeId, {
        acceptsOrders: false,
      });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('toggleFeature', () => {
    it('should toggle store feature', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await repository.toggleFeature(
        storeId,
        'deliveryEnabled',
        false,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });
});
