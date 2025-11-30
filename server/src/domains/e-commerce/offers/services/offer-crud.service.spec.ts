import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OfferCrudService } from './offer-crud.service';
import { OfferRepository } from '../repositories/offer.repository';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { DiscountType } from '../../../../database/schemas/offer.schema';

describe('OfferCrudService', () => {
  let service: OfferCrudService;
  let offerRepository: jest.Mocked<OfferRepository>;
  let storeOwnerProfileModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockStoreId = new Types.ObjectId();
  const mockOfferId = new Types.ObjectId();

  const mockOffer = {
    _id: mockOfferId,
    storeId: mockStoreId,
    title: 'Test Offer',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const mockModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferCrudService,
        {
          provide: OfferRepository,
          useValue: {
            create: jest.fn(),
            getModel: jest.fn().mockReturnValue(mockModel),
            delete: jest.fn(),
          },
        },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OfferCrudService>(OfferCrudService);
    offerRepository = module.get(OfferRepository);
    storeOwnerProfileModel = module.get(getModelToken(StoreOwnerProfile.name));
    eventEmitter = module.get(EventEmitter2);
  });

  describe('create', () => {
    const createDto = {
      title: 'Test Offer',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    };

    it('should create offer successfully', async () => {
      storeOwnerProfileModel.findById.mockResolvedValue({ _id: mockStoreId });
      offerRepository.create.mockResolvedValue(mockOffer as any);

      const result = await service.create(
        createDto as any,
        mockStoreId.toString(),
      );

      expect(result).toEqual(mockOffer);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'offer.created',
        expect.any(Object),
      );
    });

    it('should throw BadRequestException for invalid store id', async () => {
      await expect(
        service.create(createDto as any, 'invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when store not found', async () => {
      storeOwnerProfileModel.findById.mockResolvedValue(null);

      await expect(
        service.create(createDto as any, mockStoreId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when start date is after end date', async () => {
      storeOwnerProfileModel.findById.mockResolvedValue({ _id: mockStoreId });

      await expect(
        service.create(
          {
            ...createDto,
            startDate: '2024-12-31',
            endDate: '2024-01-01',
          } as any,
          mockStoreId.toString(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when percentage discount exceeds 100', async () => {
      storeOwnerProfileModel.findById.mockResolvedValue({ _id: mockStoreId });

      await expect(
        service.create(
          {
            ...createDto,
            discountValue: 150,
          } as any,
          mockStoreId.toString(),
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update offer successfully', async () => {
      (offerRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockOffer,
      );

      const result = await service.update(
        mockOfferId.toString(),
        { title: 'Updated' },
        mockStoreId.toString(),
      );

      expect(mockOffer.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid offer id', async () => {
      await expect(
        service.update('invalid-id', {}, mockStoreId.toString()),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when offer not found', async () => {
      (offerRepository.getModel().findById as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.update(mockOfferId.toString(), {}, mockStoreId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when store does not own offer', async () => {
      (offerRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockOffer,
      );

      await expect(
        service.update(
          mockOfferId.toString(),
          {},
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove offer successfully', async () => {
      (offerRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockOffer,
      );
      offerRepository.delete.mockResolvedValue(true as any);

      await service.remove(mockOfferId.toString(), mockStoreId.toString());

      expect(offerRepository.delete).toHaveBeenCalledWith(
        mockOfferId.toString(),
      );
    });

    it('should throw ForbiddenException when store does not own offer', async () => {
      (offerRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockOffer,
      );

      await expect(
        service.remove(mockOfferId.toString(), new Types.ObjectId().toString()),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
