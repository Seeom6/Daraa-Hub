import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CommissionConfigRepository } from './commission-config.repository';
import {
  CommissionConfig,
  ConfigEntityType,
} from '../../../../database/schemas/commission-config.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('CommissionConfigRepository', () => {
  let repository: CommissionConfigRepository;
  let mockModel: any;

  const configId = generateObjectId();
  const storeId = generateObjectId();
  const categoryId = generateObjectId();

  const mockConfig = {
    _id: configId,
    entityType: ConfigEntityType.GLOBAL,
    commissionRate: 10,
    isActive: true,
    priority: 1,
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockConfig]);
    mockModel.findOne = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConfig),
      }),
    });
    mockModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockConfig]),
      }),
    });
    mockModel.findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockConfig),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionConfigRepository,
        { provide: getModelToken(CommissionConfig.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<CommissionConfigRepository>(
      CommissionConfigRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGlobalConfig', () => {
    it('should return global config', async () => {
      const result = await repository.getGlobalConfig();

      expect(result).toEqual(mockConfig);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        entityType: ConfigEntityType.GLOBAL,
        isActive: true,
      });
    });
  });

  describe('getByStoreCategory', () => {
    it('should return config by store category', async () => {
      const result = await repository.getByStoreCategory(categoryId);

      expect(result).toEqual(mockConfig);
      expect(mockModel.findOne).toHaveBeenCalled();
    });
  });

  describe('getByStore', () => {
    it('should return config by store', async () => {
      const result = await repository.getByStore(storeId);

      expect(result).toEqual(mockConfig);
      expect(mockModel.findOne).toHaveBeenCalled();
    });
  });

  describe('getApplicableConfig', () => {
    it('should return store config if exists', async () => {
      jest.spyOn(repository, 'getByStore').mockResolvedValue(mockConfig as any);

      const result = await repository.getApplicableConfig(storeId, categoryId);

      expect(result).toEqual(mockConfig);
    });

    it('should return category config if no store config', async () => {
      jest.spyOn(repository, 'getByStore').mockResolvedValue(null);
      jest
        .spyOn(repository, 'getByStoreCategory')
        .mockResolvedValue(mockConfig as any);

      const result = await repository.getApplicableConfig(storeId, categoryId);

      expect(result).toEqual(mockConfig);
    });

    it('should return global config as fallback', async () => {
      jest.spyOn(repository, 'getByStore').mockResolvedValue(null);
      jest.spyOn(repository, 'getByStoreCategory').mockResolvedValue(null);
      jest
        .spyOn(repository, 'getGlobalConfig')
        .mockResolvedValue(mockConfig as any);

      const result = await repository.getApplicableConfig(storeId, categoryId);

      expect(result).toEqual(mockConfig);
    });
  });

  describe('getAllActive', () => {
    it('should return all active configs', async () => {
      const result = await repository.getAllActive();

      expect(result).toEqual([mockConfig]);
      expect(mockModel.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('upsertGlobalConfig', () => {
    it('should upsert global config', async () => {
      const data = { commissionRate: 15 };

      const result = await repository.upsertGlobalConfig(data);

      expect(result).toEqual(mockConfig);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
