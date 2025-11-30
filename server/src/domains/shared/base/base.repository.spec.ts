import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Document, Schema } from 'mongoose';
import { BaseRepository } from './base.repository';

// Test Document interface
interface TestDocument extends Document {
  name: string;
  isDeleted?: boolean;
}

// Concrete test repository
class TestRepository extends BaseRepository<TestDocument> {
  constructor(model: Model<TestDocument>) {
    super(model);
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockModel: any;

  beforeEach(async () => {
    // Create mock schema with isDeleted path
    const mockSchema = {
      path: jest.fn().mockImplementation((path: string) => {
        if (path === 'isDeleted') return true;
        return null;
      }),
    };

    mockModel = {
      schema: mockSchema,
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findOneAndDelete: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      countDocuments: jest.fn(),
    };

    // Make mockModel callable (for new this.model(data))
    const ModelConstructor: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'created-id', ...data }),
    }));
    Object.assign(ModelConstructor, mockModel);
    ModelConstructor.schema = mockSchema;

    repository = new TestRepository(ModelConstructor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const data = { name: 'Test Item' };

      const result = await repository.create(data);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Item');
    });
  });

  describe('findById', () => {
    it('should find a document by id', async () => {
      const mockDoc = { _id: 'test-id', name: 'Test Item' };
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await repository.findById('test-id');

      expect(mockModel.findById).toHaveBeenCalledWith(
        'test-id',
        null,
        undefined,
      );
      expect(result).toEqual(mockDoc);
    });

    it('should return null if document not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should find one document by filter', async () => {
      const mockDoc = { _id: 'test-id', name: 'Test Item' };
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await repository.findOne({ name: 'Test Item' });

      expect(mockModel.findOne).toHaveBeenCalledWith(
        { name: 'Test Item' },
        null,
        undefined,
      );
      expect(result).toEqual(mockDoc);
    });
  });

  describe('findAll', () => {
    it('should find all documents', async () => {
      const mockDocs = [
        { _id: 'id1', name: 'Item 1' },
        { _id: 'id2', name: 'Item 2' },
      ];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocs),
      });

      const result = await repository.findAll();

      expect(mockModel.find).toHaveBeenCalledWith({}, null, undefined);
      expect(result).toEqual(mockDocs);
      expect(result).toHaveLength(2);
    });

    it('should filter documents by criteria', async () => {
      const mockDocs = [{ _id: 'id1', name: 'Test' }];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocs),
      });

      const result = await repository.findAll({ name: 'Test' });

      expect(mockModel.find).toHaveBeenCalledWith(
        { name: 'Test' },
        null,
        undefined,
      );
      expect(result).toEqual(mockDocs);
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated results', async () => {
      const mockDocs = [{ _id: 'id1', name: 'Item 1' }];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocs),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await repository.findWithPagination({}, 1, 10);

      expect(result.data).toEqual(mockDocs);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const mockDoc = { _id: 'test-id', name: 'Updated' };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await repository.update('test-id', { name: 'Updated' });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'test-id',
        { name: 'Updated' },
        { new: true },
      );
      expect(result).toEqual(mockDoc);
    });
  });

  describe('delete', () => {
    it('should soft delete when isDeleted field exists', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'test-id', isDeleted: true }),
      });

      const result = await repository.delete('test-id');

      expect(result).toBe(true);
    });
  });

  describe('count', () => {
    it('should count documents', async () => {
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await repository.count();

      expect(result).toBe(5);
    });
  });

  describe('exists', () => {
    it('should return true when document exists', async () => {
      mockModel.countDocuments.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(1),
        }),
      });

      const result = await repository.exists({ name: 'Test' });

      expect(result).toBe(true);
    });

    it('should return false when document does not exist', async () => {
      mockModel.countDocuments.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0),
        }),
      });

      const result = await repository.exists({ name: 'NonExistent' });

      expect(result).toBe(false);
    });
  });

  describe('getModel', () => {
    it('should return the underlying model', () => {
      const model = repository.getModel();
      expect(model).toBeDefined();
    });
  });

  describe('find', () => {
    it('should find documents with filter', async () => {
      const mockDocs = [{ _id: 'id1', name: 'Test' }];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocs),
      });

      const result = await repository.find({ name: 'Test' });

      expect(result).toEqual(mockDocs);
    });
  });

  describe('updateOne', () => {
    it('should update one document by filter', async () => {
      const mockDoc = { _id: 'test-id', name: 'Updated' };
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await repository.updateOne(
        { name: 'Old' },
        { name: 'Updated' },
      );

      expect(result).toEqual(mockDoc);
    });
  });

  describe('updateMany', () => {
    it('should update many documents', async () => {
      mockModel.updateMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 5 }),
      });

      const result = await repository.updateMany(
        { isActive: false },
        { isActive: true },
      );

      expect(result).toBe(5);
    });
  });

  describe('deleteOne', () => {
    it('should soft delete one document when isDeleted field exists', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'test-id', isDeleted: true }),
      });

      const result = await repository.deleteOne({ name: 'Test' });

      expect(result).toBe(true);
    });
  });

  describe('deleteMany', () => {
    it('should soft delete many documents when isDeleted field exists', async () => {
      mockModel.updateMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 3 }),
      });

      const result = await repository.deleteMany({ isActive: false });

      expect(result).toBe(3);
    });
  });

  describe('buildSort', () => {
    it('should build sort object from string', () => {
      const sort = (repository as any).buildSort('-createdAt,name');

      expect(sort).toEqual({ createdAt: -1, name: 1 });
    });

    it('should return undefined for empty string', () => {
      const sort = (repository as any).buildSort('');

      expect(sort).toBeUndefined();
    });
  });

  describe('buildPopulate', () => {
    it('should build populate array from string', () => {
      const populate = (repository as any).buildPopulate('store,category');

      expect(populate).toEqual(['store', 'category']);
    });

    it('should return undefined for empty string', () => {
      const populate = (repository as any).buildPopulate('');

      expect(populate).toBeUndefined();
    });
  });

  describe('buildFilter', () => {
    it('should add isDeleted: false when field exists', () => {
      const filter = (repository as any).buildFilter({ name: 'Test' });

      expect(filter).toEqual({ name: 'Test', isDeleted: false });
    });

    it('should not override existing isDeleted filter', () => {
      const filter = (repository as any).buildFilter({
        name: 'Test',
        isDeleted: true,
      });

      expect(filter).toEqual({ name: 'Test', isDeleted: true });
    });
  });

  describe('findWithPagination with PaginationDto', () => {
    it('should handle PaginationDto object', async () => {
      const mockDocs = [{ _id: 'id1', name: 'Item 1' }];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocs),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const paginationDto = { page: 2, limit: 5 };
      const result = await repository.findWithPagination({}, paginationDto);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('should use default values when PaginationDto has no page/limit', async () => {
      const mockDocs = [{ _id: 'id1', name: 'Item 1' }];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocs),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const paginationDto = {};
      const result = await repository.findWithPagination(
        {},
        paginationDto as any,
      );

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should handle numeric page with object options', async () => {
      const mockDocs = [{ _id: 'id1', name: 'Item 1' }];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocs),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await repository.findWithPagination({}, 1, {
        lean: true,
      } as any);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should handle numeric page with numeric limit and options', async () => {
      const mockDocs = [{ _id: 'id1', name: 'Item 1' }];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocs),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await repository.findWithPagination({}, 2, 15, {
        lean: true,
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
    });
  });

  describe('findByIdAndUpdate', () => {
    it('should call update method', async () => {
      const mockDoc = { _id: 'test-id', name: 'Updated' };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await repository.findByIdAndUpdate('test-id', {
        name: 'Updated',
      });

      expect(result).toEqual(mockDoc);
    });
  });

  describe('hard delete operations', () => {
    let repositoryWithoutSoftDelete: TestRepository;
    let mockModelWithoutSoftDelete: any;

    beforeEach(() => {
      const mockSchemaWithoutIsDeleted = {
        path: jest.fn().mockReturnValue(null),
      };

      mockModelWithoutSoftDelete = {
        schema: mockSchemaWithoutIsDeleted,
        findById: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findOneAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        findOneAndDelete: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
        countDocuments: jest.fn(),
      };

      const ModelConstructor: any = jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue({ _id: 'created-id', ...data }),
      }));
      Object.assign(ModelConstructor, mockModelWithoutSoftDelete);
      ModelConstructor.schema = mockSchemaWithoutIsDeleted;

      repositoryWithoutSoftDelete = new TestRepository(ModelConstructor);
    });

    it('should hard delete by id when isDeleted field does not exist', async () => {
      mockModelWithoutSoftDelete.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'test-id' }),
      });

      const result = await repositoryWithoutSoftDelete.delete('test-id');

      expect(result).toBe(true);
      expect(mockModelWithoutSoftDelete.findByIdAndDelete).toHaveBeenCalledWith(
        'test-id',
      );
    });

    it('should return false when hard delete finds nothing', async () => {
      mockModelWithoutSoftDelete.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repositoryWithoutSoftDelete.delete('non-existent');

      expect(result).toBe(false);
    });

    it('should hard delete one by filter when isDeleted field does not exist', async () => {
      mockModelWithoutSoftDelete.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'test-id' }),
      });

      const result = await repositoryWithoutSoftDelete.deleteOne({
        name: 'Test',
      });

      expect(result).toBe(true);
      expect(mockModelWithoutSoftDelete.findOneAndDelete).toHaveBeenCalled();
    });

    it('should return false when hard deleteOne finds nothing', async () => {
      mockModelWithoutSoftDelete.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repositoryWithoutSoftDelete.deleteOne({
        name: 'NonExistent',
      });

      expect(result).toBe(false);
    });

    it('should hard delete many when isDeleted field does not exist', async () => {
      mockModelWithoutSoftDelete.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 5 }),
      });

      const result = await repositoryWithoutSoftDelete.deleteMany({
        isActive: false,
      });

      expect(result).toBe(5);
      expect(mockModelWithoutSoftDelete.deleteMany).toHaveBeenCalled();
    });

    it('should return filter unchanged when isDeleted field does not exist', () => {
      const filter = (repositoryWithoutSoftDelete as any).buildFilter({
        name: 'Test',
      });

      expect(filter).toEqual({ name: 'Test' });
    });
  });

  describe('soft delete edge cases', () => {
    it('should return false when soft delete finds nothing', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });

    it('should return false when soft deleteOne finds nothing', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.deleteOne({ name: 'NonExistent' });

      expect(result).toBe(false);
    });
  });
});
