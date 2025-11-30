import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from '../services/product.service';
import { ProductVariantService } from '../services/product-variant.service';
import { ProductMediaService } from '../services/product-media.service';
import { StorageService } from '../../../../infrastructure/storage/storage.service';
import { generateObjectId } from '../../../shared/testing';
import { FakerDataFactory } from '../../../shared/testing/mock-data.factory';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: jest.Mocked<ProductService>;
  let productVariantService: jest.Mocked<ProductVariantService>;
  let productMediaService: jest.Mocked<ProductMediaService>;
  let storageService: jest.Mocked<StorageService>;

  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    verifyOwnership: jest.fn(),
  };

  const mockProductVariantService = {
    createVariant: jest.fn(),
    findVariantsByProduct: jest.fn(),
    updateVariant: jest.fn(),
    removeVariant: jest.fn(),
  };

  const mockProductMediaService = {
    addImages: jest.fn(),
    removeImage: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: ProductVariantService, useValue: mockProductVariantService },
        { provide: ProductMediaService, useValue: mockProductMediaService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get(ProductService);
    productVariantService = module.get(ProductVariantService);
    productMediaService = module.get(ProductMediaService);
    storageService = module.get(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = {
        name: 'Test Product',
        storeId: generateObjectId(),
        price: 100,
      };
      const mockProduct = FakerDataFactory.createProduct(createDto);
      const user = { userId: generateObjectId(), role: 'store_owner' };

      mockProductService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createDto as any, user);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product created successfully');
      expect(mockProductService.create).toHaveBeenCalledWith(
        createDto,
        user.userId,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = FakerDataFactory.createMany(
        () => FakerDataFactory.createProduct(),
        5,
      );
      const mockResult = { data: mockProducts, total: 5, page: 1, limit: 20 };

      mockProductService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll({ page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(5);
      expect(result.meta.total).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const productId = generateObjectId();
      const mockProduct = FakerDataFactory.createProduct({ _id: productId });

      mockProductService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(productId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });

  describe('findBySlug', () => {
    it('should return a product by slug', async () => {
      const mockProduct = FakerDataFactory.createProduct({
        slug: 'test-product',
      });

      mockProductService.findBySlug.mockResolvedValue(mockProduct);

      const result = await controller.findBySlug('test-product');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should update a product for admin', async () => {
      const productId = generateObjectId();
      const updateDto = { name: 'Updated Product' };
      const user = { userId: generateObjectId(), role: 'admin' };
      const mockProduct = FakerDataFactory.createProduct({
        name: 'Updated Product',
      });

      mockProductService.update.mockResolvedValue(mockProduct);

      const result = await controller.update(productId, updateDto as any, user);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product updated successfully');
    });

    it('should verify ownership for store owner', async () => {
      const productId = generateObjectId();
      const updateDto = { name: 'Updated Product' };
      const user = {
        userId: generateObjectId(),
        role: 'store_owner',
        profileId: generateObjectId(),
      };
      const mockProduct = FakerDataFactory.createProduct({
        name: 'Updated Product',
      });

      mockProductService.verifyOwnership.mockResolvedValue(true);
      mockProductService.update.mockResolvedValue(mockProduct);

      const result = await controller.update(productId, updateDto as any, user);

      expect(mockProductService.verifyOwnership).toHaveBeenCalledWith(
        productId,
        user.profileId,
      );
      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException when store owner does not own product', async () => {
      const productId = generateObjectId();
      const user = {
        userId: generateObjectId(),
        role: 'store_owner',
        profileId: generateObjectId(),
      };

      mockProductService.verifyOwnership.mockResolvedValue(false);

      await expect(
        controller.update(productId, {} as any, user),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const productId = generateObjectId();
      const user = { userId: generateObjectId(), role: 'admin' };

      mockProductService.remove.mockResolvedValue(undefined);

      await controller.remove(productId, user);

      expect(mockProductService.remove).toHaveBeenCalledWith(
        productId,
        user.userId,
      );
    });
  });

  describe('getVariants', () => {
    it('should return product variants', async () => {
      const productId = generateObjectId();
      const mockVariants = [{ _id: generateObjectId(), name: 'Variant 1' }];

      mockProductVariantService.findVariantsByProduct.mockResolvedValue(
        mockVariants,
      );

      const result = await controller.getVariants(productId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVariants);
    });
  });

  describe('remove for store owner', () => {
    it('should verify ownership for store owner', async () => {
      const productId = generateObjectId();
      const user = {
        userId: generateObjectId(),
        role: 'store_owner',
        profileId: generateObjectId(),
      };

      mockProductService.verifyOwnership.mockResolvedValue(true);
      mockProductService.remove.mockResolvedValue(undefined);

      await controller.remove(productId, user);

      expect(mockProductService.verifyOwnership).toHaveBeenCalledWith(
        productId,
        user.profileId,
      );
    });

    it('should throw ForbiddenException when store owner does not own product', async () => {
      const productId = generateObjectId();
      const user = {
        userId: generateObjectId(),
        role: 'store_owner',
        profileId: generateObjectId(),
      };

      mockProductService.verifyOwnership.mockResolvedValue(false);

      await expect(controller.remove(productId, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('uploadImages', () => {
    it('should upload images successfully', async () => {
      const productId = generateObjectId();
      const user = { userId: generateObjectId(), role: 'admin' };
      const files = [
        { originalname: 'image1.jpg', buffer: Buffer.from('test') },
        { originalname: 'image2.jpg', buffer: Buffer.from('test') },
      ] as Express.Multer.File[];
      const mockProduct = FakerDataFactory.createProduct();

      mockStorageService.uploadFile.mockResolvedValue({
        url: 'https://example.com/image.jpg',
      });
      mockProductMediaService.addImages.mockResolvedValue(mockProduct);

      const result = await controller.uploadImages(productId, files, user);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Images uploaded successfully');
      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(2);
    });

    it('should return error when no files uploaded', async () => {
      const productId = generateObjectId();
      const user = { userId: generateObjectId(), role: 'admin' };

      const result = await controller.uploadImages(productId, [], user);

      expect(result.success).toBe(false);
      expect(result.message).toBe('No files uploaded');
    });

    it('should return error when files is undefined', async () => {
      const productId = generateObjectId();
      const user = { userId: generateObjectId(), role: 'admin' };

      const result = await controller.uploadImages(
        productId,
        undefined as any,
        user,
      );

      expect(result.success).toBe(false);
    });

    it('should verify ownership for store owner', async () => {
      const productId = generateObjectId();
      const user = {
        userId: generateObjectId(),
        role: 'store_owner',
        profileId: generateObjectId(),
      };
      const files = [
        { originalname: 'image.jpg', buffer: Buffer.from('test') },
      ] as Express.Multer.File[];
      const mockProduct = FakerDataFactory.createProduct();

      mockProductService.verifyOwnership.mockResolvedValue(true);
      mockStorageService.uploadFile.mockResolvedValue({
        url: 'https://example.com/image.jpg',
      });
      mockProductMediaService.addImages.mockResolvedValue(mockProduct);

      await controller.uploadImages(productId, files, user);

      expect(mockProductService.verifyOwnership).toHaveBeenCalledWith(
        productId,
        user.profileId,
      );
    });

    it('should throw ForbiddenException when store owner does not own product', async () => {
      const productId = generateObjectId();
      const user = {
        userId: generateObjectId(),
        role: 'store_owner',
        profileId: generateObjectId(),
      };
      const files = [
        { originalname: 'image.jpg', buffer: Buffer.from('test') },
      ] as Express.Multer.File[];

      mockProductService.verifyOwnership.mockResolvedValue(false);

      await expect(
        controller.uploadImages(productId, files, user),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeImage', () => {
    it('should remove image successfully', async () => {
      const productId = generateObjectId();
      const user = { userId: generateObjectId(), role: 'admin' };
      const imageUrl = 'https://example.com/image.jpg';
      const mockProduct = FakerDataFactory.createProduct();

      mockProductMediaService.removeImage.mockResolvedValue(mockProduct);

      const result = await controller.removeImage(productId, imageUrl, user);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Image removed successfully');
    });

    it('should verify ownership for store owner', async () => {
      const productId = generateObjectId();
      const user = {
        userId: generateObjectId(),
        role: 'store_owner',
        profileId: generateObjectId(),
      };
      const imageUrl = 'https://example.com/image.jpg';
      const mockProduct = FakerDataFactory.createProduct();

      mockProductService.verifyOwnership.mockResolvedValue(true);
      mockProductMediaService.removeImage.mockResolvedValue(mockProduct);

      await controller.removeImage(productId, imageUrl, user);

      expect(mockProductService.verifyOwnership).toHaveBeenCalledWith(
        productId,
        user.profileId,
      );
    });

    it('should throw ForbiddenException when store owner does not own product', async () => {
      const productId = generateObjectId();
      const user = {
        userId: generateObjectId(),
        role: 'store_owner',
        profileId: generateObjectId(),
      };
      const imageUrl = 'https://example.com/image.jpg';

      mockProductService.verifyOwnership.mockResolvedValue(false);

      await expect(
        controller.removeImage(productId, imageUrl, user),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createVariant', () => {
    it('should create variant successfully', async () => {
      const productId = generateObjectId();
      const user = { userId: generateObjectId(), role: 'admin' };
      const createDto = { name: 'Variant 1', price: 100 } as any;
      const mockVariant = { _id: generateObjectId(), ...createDto };

      mockProductVariantService.createVariant.mockResolvedValue(mockVariant);

      const result = await controller.createVariant(productId, createDto, user);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Variant created successfully');
      expect(createDto.productId).toBe(productId);
    });

    it('should verify ownership for store owner', async () => {
      const productId = generateObjectId();
      const user = {
        userId: generateObjectId(),
        role: 'store_owner',
        profileId: generateObjectId(),
      };
      const createDto = { name: 'Variant 1', price: 100 } as any;
      const mockVariant = { _id: generateObjectId(), ...createDto };

      mockProductService.verifyOwnership.mockResolvedValue(true);
      mockProductVariantService.createVariant.mockResolvedValue(mockVariant);

      await controller.createVariant(productId, createDto, user);

      expect(mockProductService.verifyOwnership).toHaveBeenCalledWith(
        productId,
        user.profileId,
      );
    });

    it('should throw ForbiddenException when store owner does not own product', async () => {
      const productId = generateObjectId();
      const user = {
        userId: generateObjectId(),
        role: 'store_owner',
        profileId: generateObjectId(),
      };
      const createDto = { name: 'Variant 1', price: 100 } as any;

      mockProductService.verifyOwnership.mockResolvedValue(false);

      await expect(
        controller.createVariant(productId, createDto, user),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateVariant', () => {
    it('should update variant successfully', async () => {
      const variantId = generateObjectId();
      const user = { userId: generateObjectId(), role: 'admin' };
      const updateDto = { name: 'Updated Variant' } as any;
      const mockVariant = { _id: variantId, ...updateDto };

      mockProductVariantService.updateVariant.mockResolvedValue(mockVariant);

      const result = await controller.updateVariant(variantId, updateDto, user);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Variant updated successfully');
    });
  });

  describe('removeVariant', () => {
    it('should remove variant successfully', async () => {
      const variantId = generateObjectId();
      const user = { userId: generateObjectId(), role: 'admin' };

      mockProductVariantService.removeVariant.mockResolvedValue(undefined);

      await controller.removeVariant(variantId, user);

      expect(mockProductVariantService.removeVariant).toHaveBeenCalledWith(
        variantId,
      );
    });
  });
});
