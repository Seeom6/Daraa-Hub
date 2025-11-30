import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductVariantService } from './product-variant.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductVariant } from '../../../../database/schemas/product-variant.schema';

describe('ProductVariantService', () => {
  let service: ProductVariantService;
  let productRepository: jest.Mocked<ProductRepository>;
  let variantModel: any;

  const mockProduct = {
    _id: new Types.ObjectId(),
    name: 'Test Product',
    storeId: new Types.ObjectId(),
  };

  const mockVariant = {
    _id: new Types.ObjectId(),
    productId: mockProduct._id,
    name: 'Red - Large',
    sku: 'TEST-SKU-001',
    price: 100,
    attributes: { color: 'red', size: 'large' },
    save: jest.fn().mockResolvedValue(this),
  };

  const mockProductModel = {
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const mockVariantModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: new Types.ObjectId(),
      save: jest.fn().mockResolvedValue({ ...data, _id: new Types.ObjectId() }),
    }));
    mockVariantModel.findOne = jest.fn().mockReturnThis();
    mockVariantModel.find = jest.fn().mockReturnThis();
    mockVariantModel.findById = jest.fn().mockReturnThis();
    mockVariantModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockVariantModel.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantService,
        {
          provide: ProductRepository,
          useValue: {
            getModel: jest.fn().mockReturnValue(mockProductModel),
          },
        },
        {
          provide: getModelToken(ProductVariant.name),
          useValue: mockVariantModel,
        },
      ],
    }).compile();

    service = module.get<ProductVariantService>(ProductVariantService);
    productRepository = module.get(ProductRepository);
    variantModel = module.get(getModelToken(ProductVariant.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVariant', () => {
    it('should create variant successfully', async () => {
      mockProductModel.exec.mockResolvedValue(mockProduct);
      variantModel.findOne().exec.mockResolvedValue(null);

      const result = await service.createVariant({
        productId: mockProduct._id.toString(),
        name: 'Red - Large',
        sku: 'NEW-SKU',
        price: 100,
      });

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductModel.exec.mockResolvedValue(null);

      await expect(
        service.createVariant({
          productId: new Types.ObjectId().toString(),
          name: 'Red - Large',
          price: 100,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when SKU already exists', async () => {
      mockProductModel.exec.mockResolvedValue(mockProduct);
      variantModel.findOne().exec.mockResolvedValue(mockVariant);

      await expect(
        service.createVariant({
          productId: mockProduct._id.toString(),
          name: 'Red - Large',
          sku: 'TEST-SKU-001',
          price: 100,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findVariantsByProduct', () => {
    it('should return variants for product', async () => {
      variantModel.find().exec.mockResolvedValue([mockVariant]);

      const result = await service.findVariantsByProduct(
        mockProduct._id.toString(),
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('updateVariant', () => {
    it('should update variant successfully', async () => {
      const existingVariant = {
        ...mockVariant,
        sku: 'OLD-SKU',
        save: jest.fn().mockResolvedValue(mockVariant),
      };
      variantModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingVariant),
      });
      variantModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.updateVariant(mockVariant._id.toString(), {
        name: 'Updated',
      });

      expect(existingVariant.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(
        service.updateVariant('invalid', { name: 'Updated' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when variant not found', async () => {
      variantModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateVariant(new Types.ObjectId().toString(), {
          name: 'Updated',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating to existing SKU', async () => {
      const existingVariant = {
        ...mockVariant,
        sku: 'OLD-SKU',
        save: jest.fn().mockResolvedValue(mockVariant),
      };
      variantModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingVariant),
      });
      variantModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ sku: 'EXISTING-SKU' }),
      });

      await expect(
        service.updateVariant(mockVariant._id.toString(), {
          sku: 'EXISTING-SKU',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating with same SKU', async () => {
      const existingVariant = {
        ...mockVariant,
        save: jest.fn().mockResolvedValue(mockVariant),
      };
      variantModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingVariant),
      });

      await service.updateVariant(mockVariant._id.toString(), {
        sku: mockVariant.sku,
      });

      expect(existingVariant.save).toHaveBeenCalled();
    });
  });

  describe('removeVariant', () => {
    it('should remove variant successfully', async () => {
      variantModel.findById().exec.mockResolvedValue(mockVariant);
      mockProductModel.exec.mockResolvedValue(mockProduct);
      variantModel.findByIdAndDelete().exec.mockResolvedValue(mockVariant);

      await expect(
        service.removeVariant(mockVariant._id.toString()),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.removeVariant('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when variant not found', async () => {
      variantModel.findById().exec.mockResolvedValue(null);

      await expect(
        service.removeVariant(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
