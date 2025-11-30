import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from '../services/category.service';
import { StorageService } from '../../../../infrastructure/storage/storage.service';
import { generateObjectId } from '../../../shared/testing';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: jest.Mocked<CategoryService>;
  let storageService: jest.Mocked<StorageService>;

  const mockCategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getCategoryTree: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
  };

  const categoryId = generateObjectId();
  const mockCategory = {
    _id: categoryId,
    name: 'Electronics',
    slug: 'electronics',
    level: 0,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get(CategoryService);
    storageService = module.get(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto = { name: 'Electronics', slug: 'electronics' };
      mockCategoryService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(createDto as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Category created successfully');
      expect(result.data).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const queryResult = {
        data: [mockCategory],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockCategoryService.findAll.mockResolvedValue(queryResult);

      const result = await controller.findAll({ page: 1, limit: 20 } as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCategory]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getCategoryTree', () => {
    it('should return category tree', async () => {
      const tree = [{ ...mockCategory, subcategories: [] }];
      mockCategoryService.getCategoryTree.mockResolvedValue(tree);

      const result = await controller.getCategoryTree();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(tree);
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      mockCategoryService.findBySlug.mockResolvedValue(mockCategory);

      const result = await controller.findBySlug('electronics');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategory);
    });
  });

  describe('findOne', () => {
    it('should return category by id', async () => {
      mockCategoryService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(categoryId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should update category', async () => {
      const updateDto = { name: 'Updated Electronics' };
      const updatedCategory = { ...mockCategory, name: 'Updated Electronics' };
      mockCategoryService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(categoryId, updateDto as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Category updated successfully');
      expect(result.data.name).toBe('Updated Electronics');
    });
  });

  describe('remove', () => {
    it('should delete category', async () => {
      mockCategoryService.remove.mockResolvedValue(undefined);

      await controller.remove(categoryId);

      expect(mockCategoryService.remove).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('uploadImage', () => {
    it('should upload image and update category', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      } as Express.Multer.File;
      const uploadResult = {
        url: 'https://s3.example.com/categories/test.jpg',
      };
      const updatedCategory = { ...mockCategory, image: uploadResult.url };

      mockStorageService.uploadFile.mockResolvedValue(uploadResult);
      mockCategoryService.update.mockResolvedValue(updatedCategory);

      const result = await controller.uploadImage(categoryId, mockFile);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Image uploaded successfully');
      expect(result.data.url).toBe(uploadResult.url);
    });

    it('should return error if no file uploaded', async () => {
      const result = await controller.uploadImage(categoryId, undefined as any);

      expect(result.success).toBe(false);
      expect(result.message).toBe('No file uploaded');
    });
  });
});
