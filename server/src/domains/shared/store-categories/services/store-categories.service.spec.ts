import { Test, TestingModule } from '@nestjs/testing';
import { StoreCategoriesService } from './store-categories.service';
import { StoreCategoriesCrudService } from './store-categories-crud.service';
import { StoreCategoriesQueryService } from './store-categories-query.service';
import { StoreCategoriesHierarchyService } from './store-categories-hierarchy.service';
import { generateObjectId } from '../../testing';

describe('StoreCategoriesService', () => {
  let service: StoreCategoriesService;

  const mockCrudService = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    restore: jest.fn(),
    permanentDelete: jest.fn(),
  };

  const mockQueryService = {
    findAll: jest.fn(),
    findRootCategories: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findSubcategories: jest.fn(),
    search: jest.fn(),
  };

  const mockHierarchyService = {
    validateHierarchy: jest.fn(),
    getParentChain: jest.fn(),
    moveCategory: jest.fn(),
    reorderCategories: jest.fn(),
    getCategoryTree: jest.fn(),
  };

  const categoryId = generateObjectId();

  const mockCategory = {
    _id: categoryId,
    name: 'Electronics',
    slug: 'electronics',
    level: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCategoriesService,
        { provide: StoreCategoriesCrudService, useValue: mockCrudService },
        { provide: StoreCategoriesQueryService, useValue: mockQueryService },
        {
          provide: StoreCategoriesHierarchyService,
          useValue: mockHierarchyService,
        },
      ],
    }).compile();

    service = module.get<StoreCategoriesService>(StoreCategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.create.mockResolvedValue(mockCategory);

      const result = await service.create({ name: 'Electronics' } as any);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.update.mockResolvedValue(mockCategory);

      const result = await service.update(categoryId, {
        name: 'Updated',
      } as any);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('delete', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.delete.mockResolvedValue(undefined);

      await service.delete(categoryId);

      expect(mockCrudService.delete).toHaveBeenCalledWith(
        categoryId,
        undefined,
      );
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue([mockCategory]);

      const result = await service.findAll({});

      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findById', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findById.mockResolvedValue(mockCategory);

      const result = await service.findById(categoryId);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('findBySlug', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findBySlug.mockResolvedValue(mockCategory);

      const result = await service.findBySlug('electronics');

      expect(result).toEqual(mockCategory);
    });
  });

  describe('getCategoryTree', () => {
    it('should delegate to hierarchy service', async () => {
      mockHierarchyService.getCategoryTree.mockResolvedValue([mockCategory]);

      const result = await service.getCategoryTree();

      expect(result).toEqual([mockCategory]);
    });
  });

  describe('moveCategory', () => {
    it('should delegate to hierarchy service', async () => {
      mockHierarchyService.moveCategory.mockResolvedValue(mockCategory);

      const result = await service.moveCategory(categoryId, null);

      expect(result).toEqual(mockCategory);
    });
  });

  describe('restore', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.restore.mockResolvedValue(mockCategory);

      const result = await service.restore(categoryId);

      expect(mockCrudService.restore).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('permanentDelete', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.permanentDelete.mockResolvedValue(undefined);

      await service.permanentDelete(categoryId);

      expect(mockCrudService.permanentDelete).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('findRootCategories', () => {
    it('should delegate to query service with default value', async () => {
      mockQueryService.findRootCategories.mockResolvedValue([mockCategory]);

      const result = await service.findRootCategories();

      expect(mockQueryService.findRootCategories).toHaveBeenCalledWith(false);
      expect(result).toEqual([mockCategory]);
    });

    it('should delegate to query service with includeSubcategories', async () => {
      mockQueryService.findRootCategories.mockResolvedValue([mockCategory]);

      const result = await service.findRootCategories(true);

      expect(mockQueryService.findRootCategories).toHaveBeenCalledWith(true);
    });
  });

  describe('findSubcategories', () => {
    it('should delegate to query service', async () => {
      const parentId = generateObjectId();
      mockQueryService.findSubcategories.mockResolvedValue([mockCategory]);

      const result = await service.findSubcategories(parentId);

      expect(mockQueryService.findSubcategories).toHaveBeenCalledWith(parentId);
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('search', () => {
    it('should delegate to query service', async () => {
      mockQueryService.search.mockResolvedValue([mockCategory]);

      const result = await service.search('electronics');

      expect(mockQueryService.search).toHaveBeenCalledWith('electronics');
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('validateHierarchy', () => {
    it('should delegate to hierarchy service', async () => {
      mockHierarchyService.validateHierarchy.mockResolvedValue(undefined);

      await service.validateHierarchy(categoryId, 1);

      expect(mockHierarchyService.validateHierarchy).toHaveBeenCalledWith(
        categoryId,
        1,
      );
    });

    it('should handle null parentId', async () => {
      mockHierarchyService.validateHierarchy.mockResolvedValue(undefined);

      await service.validateHierarchy(null, 0);

      expect(mockHierarchyService.validateHierarchy).toHaveBeenCalledWith(
        null,
        0,
      );
    });
  });

  describe('getParentChain', () => {
    it('should delegate to hierarchy service', async () => {
      const parentCategory = { ...mockCategory, name: 'Parent' };
      mockHierarchyService.getParentChain.mockResolvedValue([
        parentCategory,
        mockCategory,
      ]);

      const result = await service.getParentChain(categoryId);

      expect(mockHierarchyService.getParentChain).toHaveBeenCalledWith(
        categoryId,
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('reorderCategories', () => {
    it('should delegate to hierarchy service', async () => {
      const categoryIds = [generateObjectId(), generateObjectId()];
      mockHierarchyService.reorderCategories.mockResolvedValue(undefined);

      await service.reorderCategories(categoryIds);

      expect(mockHierarchyService.reorderCategories).toHaveBeenCalledWith(
        categoryIds,
      );
    });
  });

  describe('delete with deletedBy', () => {
    it('should pass deletedBy to crud service', async () => {
      const deletedBy = generateObjectId();
      mockCrudService.delete.mockResolvedValue(undefined);

      await service.delete(categoryId, deletedBy);

      expect(mockCrudService.delete).toHaveBeenCalledWith(
        categoryId,
        deletedBy,
      );
    });
  });

  describe('findById with includeSubcategories', () => {
    it('should pass includeSubcategories to query service', async () => {
      mockQueryService.findById.mockResolvedValue(mockCategory);

      const result = await service.findById(categoryId, true);

      expect(mockQueryService.findById).toHaveBeenCalledWith(categoryId, true);
    });
  });

  describe('findBySlug with includeSubcategories', () => {
    it('should pass includeSubcategories to query service', async () => {
      mockQueryService.findBySlug.mockResolvedValue(mockCategory);

      const result = await service.findBySlug('electronics', true);

      expect(mockQueryService.findBySlug).toHaveBeenCalledWith(
        'electronics',
        true,
      );
    });
  });
});
