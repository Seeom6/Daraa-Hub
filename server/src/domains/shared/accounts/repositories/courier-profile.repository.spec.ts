import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourierProfileRepository } from './courier-profile.repository';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';

describe('CourierProfileRepository', () => {
  let repository: CourierProfileRepository;
  let mockModel: Partial<Model<any>>;

  const mockCourierProfile = {
    _id: '507f1f77bcf86cd799439011',
    accountId: '507f1f77bcf86cd799439012',
    fullName: 'Test Courier',
    isAvailableForDelivery: true,
    isCourierSuspended: false,
    verificationStatus: 'approved',
    status: 'active',
    rating: 4.5,
    totalReviews: 10,
  };

  beforeEach(async () => {
    mockModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourierProfile),
      }),
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockCourierProfile]),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourierProfile),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierProfileRepository,
        {
          provide: getModelToken(CourierProfile.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<CourierProfileRepository>(CourierProfileRepository);
  });

  describe('findByAccountId', () => {
    it('should find courier profile by account ID', async () => {
      const result = await repository.findByAccountId(
        '507f1f77bcf86cd799439012',
      );

      expect(mockModel.findOne).toHaveBeenCalledWith({
        accountId: '507f1f77bcf86cd799439012',
      });
      expect(result).toEqual(mockCourierProfile);
    });

    it('should return null if profile not found', async () => {
      (mockModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByAccountId('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('findAvailableCouriers', () => {
    it('should find all available couriers', async () => {
      const result = await repository.findAvailableCouriers();

      expect(mockModel.find).toHaveBeenCalledWith({
        isAvailableForDelivery: true,
        isCourierSuspended: false,
        verificationStatus: 'approved',
        status: 'active',
      });
      expect(result).toEqual([mockCourierProfile]);
    });

    it('should return empty array if no available couriers', async () => {
      (mockModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findAvailableCouriers();
      expect(result).toEqual([]);
    });
  });

  describe('findByVerificationStatus', () => {
    it('should find couriers by verification status', async () => {
      const result = await repository.findByVerificationStatus('pending');

      expect(mockModel.find).toHaveBeenCalledWith({
        verificationStatus: 'pending',
      });
      expect(result).toEqual([mockCourierProfile]);
    });

    it('should find approved couriers', async () => {
      await repository.findByVerificationStatus('approved');

      expect(mockModel.find).toHaveBeenCalledWith({
        verificationStatus: 'approved',
      });
    });

    it('should find rejected couriers', async () => {
      await repository.findByVerificationStatus('rejected');

      expect(mockModel.find).toHaveBeenCalledWith({
        verificationStatus: 'rejected',
      });
    });
  });

  describe('updateRating', () => {
    it('should update courier rating', async () => {
      const result = await repository.updateRating(
        '507f1f77bcf86cd799439011',
        4.8,
        15,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { rating: 4.8, totalReviews: 15 },
        { new: true },
      );
      expect(result).toEqual(mockCourierProfile);
    });

    it('should return null if courier not found', async () => {
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.updateRating('nonexistent', 4.0, 5);
      expect(result).toBeNull();
    });
  });

  describe('findByVerificationStatus with suspended', () => {
    it('should find suspended couriers', async () => {
      await repository.findByVerificationStatus('suspended');

      expect(mockModel.find).toHaveBeenCalledWith({
        verificationStatus: 'suspended',
      });
    });
  });
});
