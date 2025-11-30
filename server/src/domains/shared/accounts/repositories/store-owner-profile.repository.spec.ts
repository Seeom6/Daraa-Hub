import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoreOwnerProfileRepository } from './store-owner-profile.repository';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';

describe('StoreOwnerProfileRepository', () => {
  let repository: StoreOwnerProfileRepository;
  let mockModel: Partial<Model<any>>;

  const mockStoreOwnerProfile = {
    _id: '507f1f77bcf86cd799439011',
    accountId: '507f1f77bcf86cd799439012',
    storeName: 'Test Store',
    isStoreActive: true,
    isStoreSuspended: false,
    verificationStatus: 'approved',
    rating: 4.5,
    totalReviews: 20,
  };

  beforeEach(async () => {
    mockModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreOwnerProfile),
      }),
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockStoreOwnerProfile]),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreOwnerProfile),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreOwnerProfileRepository,
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<StoreOwnerProfileRepository>(
      StoreOwnerProfileRepository,
    );
  });

  describe('findByAccountId', () => {
    it('should find store owner profile by account ID', async () => {
      const result = await repository.findByAccountId(
        '507f1f77bcf86cd799439012',
      );

      expect(mockModel.findOne).toHaveBeenCalledWith({
        accountId: '507f1f77bcf86cd799439012',
      });
      expect(result).toEqual(mockStoreOwnerProfile);
    });

    it('should return null if profile not found', async () => {
      (mockModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByAccountId('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('findActiveStores', () => {
    it('should find all active stores', async () => {
      const result = await repository.findActiveStores();

      expect(mockModel.find).toHaveBeenCalledWith({
        isStoreActive: true,
        isStoreSuspended: false,
        verificationStatus: 'approved',
      });
      expect(result).toEqual([mockStoreOwnerProfile]);
    });

    it('should return empty array if no active stores', async () => {
      (mockModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findActiveStores();
      expect(result).toEqual([]);
    });
  });

  describe('findByVerificationStatus', () => {
    it('should find stores by pending status', async () => {
      const result = await repository.findByVerificationStatus('pending');

      expect(mockModel.find).toHaveBeenCalledWith({
        verificationStatus: 'pending',
      });
      expect(result).toEqual([mockStoreOwnerProfile]);
    });

    it('should find stores by approved status', async () => {
      await repository.findByVerificationStatus('approved');
      expect(mockModel.find).toHaveBeenCalledWith({
        verificationStatus: 'approved',
      });
    });

    it('should find stores by rejected status', async () => {
      await repository.findByVerificationStatus('rejected');
      expect(mockModel.find).toHaveBeenCalledWith({
        verificationStatus: 'rejected',
      });
    });

    it('should find stores by suspended status', async () => {
      await repository.findByVerificationStatus('suspended');
      expect(mockModel.find).toHaveBeenCalledWith({
        verificationStatus: 'suspended',
      });
    });
  });

  describe('updateRating', () => {
    it('should update store rating', async () => {
      const result = await repository.updateRating(
        '507f1f77bcf86cd799439011',
        4.8,
        25,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { rating: 4.8, totalReviews: 25 },
        { new: true },
      );
      expect(result).toEqual(mockStoreOwnerProfile);
    });

    it('should return null if store not found', async () => {
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.updateRating('nonexistent', 4.0, 5);
      expect(result).toBeNull();
    });
  });
});
