import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductMediaService } from './product-media.service';
import { ProductRepository } from '../repositories/product.repository';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';

describe('ProductMediaService', () => {
  let service: ProductMediaService;
  let productRepository: jest.Mocked<ProductRepository>;
  let storeProfileModel: any;

  const mockProductId = new Types.ObjectId().toString();
  const mockStoreId = new Types.ObjectId().toString();

  const mockProduct = {
    _id: mockProductId,
    storeId: mockStoreId,
    images: ['image1.jpg', 'image2.jpg'],
    mainImage: 'image1.jpg',
    save: jest.fn(),
  };

  const mockStoreProfile = {
    _id: mockStoreId,
    maxImagesPerProduct: 10,
  };

  beforeEach(async () => {
    const mockProductRepository = {
      getModel: jest.fn().mockReturnValue({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn(),
        }),
      }),
    };

    const mockStoreProfileModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductMediaService,
        { provide: ProductRepository, useValue: mockProductRepository },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreProfileModel,
        },
      ],
    }).compile();

    service = module.get<ProductMediaService>(ProductMediaService);
    productRepository = module.get(ProductRepository);
    storeProfileModel = module.get(getModelToken(StoreOwnerProfile.name));
  });

  describe('addImages', () => {
    it('should add images successfully', async () => {
      const product = {
        ...mockProduct,
        save: jest.fn().mockResolvedValue(mockProduct),
      };
      productRepository.getModel().findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreProfile),
      });

      await service.addImages(mockProductId, ['image3.jpg']);

      expect(product.save).toHaveBeenCalled();
      expect(product.images).toContain('image3.jpg');
    });

    it('should throw BadRequestException for invalid product ID', async () => {
      await expect(
        service.addImages('invalid-id', ['image.jpg']),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when product not found', async () => {
      productRepository.getModel().findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.addImages(mockProductId, ['image.jpg']),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when image limit exceeded', async () => {
      const product = {
        ...mockProduct,
        images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'],
      };
      productRepository.getModel().findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ maxImagesPerProduct: 5 }),
      });

      await expect(
        service.addImages(mockProductId, ['new.jpg']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should set mainImage if not set', async () => {
      const product = {
        ...mockProduct,
        images: [],
        mainImage: null,
        save: jest.fn().mockResolvedValue(mockProduct),
      };
      productRepository.getModel().findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreProfile),
      });

      await service.addImages(mockProductId, ['first.jpg']);

      expect(product.mainImage).toBe('first.jpg');
    });

    it('should use default max images when store profile not found', async () => {
      const product = {
        ...mockProduct,
        save: jest.fn().mockResolvedValue(mockProduct),
      };
      productRepository.getModel().findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.addImages(mockProductId, ['image.jpg']);

      expect(product.save).toHaveBeenCalled();
    });
  });

  describe('removeImage', () => {
    it('should remove image successfully', async () => {
      const product = {
        ...mockProduct,
        save: jest.fn().mockResolvedValue(mockProduct),
      };
      productRepository.getModel().findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      await service.removeImage(mockProductId, 'image2.jpg');

      expect(product.save).toHaveBeenCalled();
      expect(product.images).not.toContain('image2.jpg');
    });

    it('should throw BadRequestException for invalid product ID', async () => {
      await expect(
        service.removeImage('invalid-id', 'image.jpg'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when product not found', async () => {
      productRepository.getModel().findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.removeImage(mockProductId, 'image.jpg'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update mainImage when removed', async () => {
      const product = {
        ...mockProduct,
        mainImage: 'image1.jpg',
        save: jest.fn().mockResolvedValue(mockProduct),
      };
      productRepository.getModel().findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      await service.removeImage(mockProductId, 'image1.jpg');

      expect(product.mainImage).toBe('image2.jpg');
    });

    it('should set mainImage to undefined when all images removed', async () => {
      const product = {
        ...mockProduct,
        images: ['only.jpg'],
        mainImage: 'only.jpg',
        save: jest.fn().mockResolvedValue(mockProduct),
      };
      productRepository.getModel().findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      await service.removeImage(mockProductId, 'only.jpg');

      expect(product.mainImage).toBeUndefined();
    });
  });
});
