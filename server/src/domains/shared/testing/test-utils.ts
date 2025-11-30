import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

/**
 * Generate a fake ObjectId
 */
export const generateObjectId = (): string => {
  return new Types.ObjectId().toString();
};

/**
 * Generate multiple fake ObjectIds
 */
export const generateObjectIds = (count: number): string[] => {
  return Array.from({ length: count }, () => generateObjectId());
};

/**
 * Create a mock Mongoose Model
 */
export const createMockModel = <T>(): Partial<Model<T>> =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    exists: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
  }) as any;

/**
 * Create a mock Repository
 */
export const createMockRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findWithPagination: jest.fn(),
  update: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  delete: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  exists: jest.fn(),
  getModel: jest.fn(),
});

/**
 * Create a mock EventEmitter
 */
export const createMockEventEmitter = () => ({
  emit: jest.fn(),
  emitAsync: jest.fn(),
  on: jest.fn(),
  once: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
});

/**
 * Create a mock Logger
 */
export const createMockLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
});

/**
 * Create a mock Cache Manager
 */
export const createMockCacheManager = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
});

/**
 * Mock Repository Factory (Class version)
 * Creates a mock repository for testing
 */
export class MockRepositoryFactory {
  static create<T>() {
    return {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findWithPagination: jest.fn(),
      update: jest.fn(),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      exists: jest.fn(),
    };
  }
}

/**
 * Mock Model Factory
 * Creates a mock Mongoose model for testing
 */
export class MockModelFactory {
  static create<T>() {
    const mockModel: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(data),
      _id: 'mock-id',
    }));

    mockModel.findById = jest.fn().mockReturnThis();
    mockModel.findOne = jest.fn().mockReturnThis();
    mockModel.find = jest.fn().mockReturnThis();
    mockModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockModel.findOneAndUpdate = jest.fn().mockReturnThis();
    mockModel.updateMany = jest.fn().mockReturnThis();
    mockModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockModel.findOneAndDelete = jest.fn().mockReturnThis();
    mockModel.deleteMany = jest.fn().mockReturnThis();
    mockModel.countDocuments = jest.fn().mockReturnThis();
    mockModel.create = jest.fn();
    mockModel.aggregate = jest.fn();
    mockModel.exec = jest.fn();
    mockModel.schema = {
      path: jest.fn().mockReturnValue(null),
    };

    return mockModel;
  }
}

/**
 * Test Module Builder
 * Helper class for building test modules
 */
export class TestModuleBuilder {
  /**
   * Create a test module with mock providers
   */
  static async createTestingModule(
    providers: any[],
    mockModels?: { name: string; model: any }[],
  ): Promise<TestingModule> {
    const moduleProviders = [...providers];

    if (mockModels) {
      for (const { name, model } of mockModels) {
        moduleProviders.push({
          provide: getModelToken(name),
          useValue: model,
        });
      }
    }

    return Test.createTestingModule({
      providers: moduleProviders,
    }).compile();
  }

  /**
   * Create a test module with repository
   */
  static async createWithRepository(
    repositoryClass: any,
    modelName: string,
    additionalProviders: any[] = [],
  ): Promise<{ module: TestingModule; repository: any; mockModel: any }> {
    const mockModel = MockModelFactory.create();

    const module = await Test.createTestingModule({
      providers: [
        repositoryClass,
        {
          provide: getModelToken(modelName),
          useValue: mockModel,
        },
        ...additionalProviders,
      ],
    }).compile();

    const repository = module.get(repositoryClass);

    return { module, repository, mockModel };
  }
}

/**
 * Mock Data Factory
 * Helper class for creating mock data
 */
export class MockDataFactory {
  /**
   * Create mock pagination result
   */
  static createPaginationResult<T>(
    data: T[],
    total: number,
    page = 1,
    limit = 10,
  ) {
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  /**
   * Create mock user
   */
  static createMockUser(overrides?: any) {
    return {
      _id: 'mock-user-id',
      phoneNumber: '+963991234567',
      role: 'customer',
      isVerified: true,
      isActive: true,
      ...overrides,
    };
  }

  /**
   * Create mock store
   */
  static createMockStore(overrides?: any) {
    return {
      _id: 'mock-store-id',
      name: 'Test Store',
      owner: 'mock-owner-id',
      isActive: true,
      isDeleted: false,
      ...overrides,
    };
  }

  /**
   * Create mock product
   */
  static createMockProduct(overrides?: any) {
    return {
      _id: 'mock-product-id',
      name: 'Test Product',
      store: 'mock-store-id',
      price: 100,
      isActive: true,
      isDeleted: false,
      ...overrides,
    };
  }

  /**
   * Create mock order
   */
  static createMockOrder(overrides?: any) {
    return {
      _id: 'mock-order-id',
      orderNumber: 'ORD-001',
      customer: 'mock-customer-id',
      store: 'mock-store-id',
      status: 'pending',
      totalAmount: 100,
      ...overrides,
    };
  }
}

/**
 * Test Helpers
 */
export class TestHelpers {
  /**
   * Wait for a specific time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create spy on method
   */
  static createSpy(object: any, method: string): jest.SpyInstance {
    return jest.spyOn(object, method);
  }

  /**
   * Clear all mocks
   */
  static clearAllMocks(): void {
    jest.clearAllMocks();
  }

  /**
   * Reset all mocks
   */
  static resetAllMocks(): void {
    jest.resetAllMocks();
  }
}
