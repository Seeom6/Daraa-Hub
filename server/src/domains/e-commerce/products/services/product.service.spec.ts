import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductCrudService } from './product-crud.service';
import { ProductQueryService } from './product-query.service';
import { ProductValidationService } from './product-validation.service';
import { generateObjectId } from '../../../shared/testing';

describe('ProductService', () => {
  let service: ProductService;

  const mockCrudService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockQueryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
  };

  const mockValidationService = {
    verifyOwnership: jest.fn(),
  };

  const productId = generateObjectId();
  const storeId = generateObjectId();
  const userId = generateObjectId();

  const mockProduct = {
    _id: productId,
    name: 'Test Product',
    slug: 'test-product',
    price: 10000,
    storeId,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductCrudService, useValue: mockCrudService },
        { provide: ProductQueryService, useValue: mockQueryService },
        { provide: ProductValidationService, useValue: mockValidationService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.create.mockResolvedValue(mockProduct);

      const result = await service.create(
        { name: 'Test Product' } as any,
        userId,
      );

      expect(result).toEqual(mockProduct);
      expect(mockCrudService.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.update.mockResolvedValue({
        ...mockProduct,
        name: 'Updated',
      });

      const result = await service.update(
        productId,
        { name: 'Updated' } as any,
        userId,
      );

      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.remove.mockResolvedValue(undefined);

      await service.remove(productId, userId);

      expect(mockCrudService.remove).toHaveBeenCalledWith(productId, userId);
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll({});

      expect(result.data).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(result).toEqual(mockProduct);
    });
  });

  describe('findBySlug', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findBySlug.mockResolvedValue(mockProduct);

      const result = await service.findBySlug('test-product');

      expect(result).toEqual(mockProduct);
    });
  });

  describe('verifyOwnership', () => {
    it('should delegate to validation service', async () => {
      mockValidationService.verifyOwnership.mockResolvedValue(true);

      const result = await service.verifyOwnership(productId, storeId);

      expect(result).toBe(true);
    });
  });
});
