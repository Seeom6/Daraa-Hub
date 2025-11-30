import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomerProfileRepository } from './customer-profile.repository';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';

describe('CustomerProfileRepository', () => {
  let repository: CustomerProfileRepository;
  let mockModel: Partial<Model<any>>;

  const mockCustomerProfile = {
    _id: '507f1f77bcf86cd799439011',
    accountId: '507f1f77bcf86cd799439012',
    fullName: 'Test Customer',
    loyaltyPoints: 100,
    tier: 'silver',
    totalOrders: 5,
    totalSpent: 500,
  };

  beforeEach(async () => {
    mockModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCustomerProfile),
      }),
      findOneAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCustomerProfile),
      }),
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockCustomerProfile]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerProfileRepository,
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<CustomerProfileRepository>(
      CustomerProfileRepository,
    );
  });

  describe('findByAccountId', () => {
    it('should find customer profile by account ID', async () => {
      const result = await repository.findByAccountId(
        '507f1f77bcf86cd799439012',
      );

      expect(mockModel.findOne).toHaveBeenCalledWith({
        accountId: '507f1f77bcf86cd799439012',
      });
      expect(result).toEqual(mockCustomerProfile);
    });

    it('should return null if profile not found', async () => {
      (mockModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByAccountId('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateLoyaltyPoints', () => {
    it('should increment loyalty points', async () => {
      const result = await repository.updateLoyaltyPoints(
        '507f1f77bcf86cd799439012',
        50,
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { accountId: '507f1f77bcf86cd799439012' },
        { $inc: { loyaltyPoints: 50 } },
        { new: true },
      );
      expect(result).toEqual(mockCustomerProfile);
    });

    it('should decrement loyalty points with negative value', async () => {
      await repository.updateLoyaltyPoints('507f1f77bcf86cd799439012', -25);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { accountId: '507f1f77bcf86cd799439012' },
        { $inc: { loyaltyPoints: -25 } },
        { new: true },
      );
    });

    it('should return null if customer not found', async () => {
      (mockModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.updateLoyaltyPoints('nonexistent', 50);
      expect(result).toBeNull();
    });
  });

  describe('findByTier', () => {
    it('should find customers by bronze tier', async () => {
      const result = await repository.findByTier('bronze');

      expect(mockModel.find).toHaveBeenCalledWith({ tier: 'bronze' });
      expect(result).toEqual([mockCustomerProfile]);
    });

    it('should find customers by silver tier', async () => {
      await repository.findByTier('silver');
      expect(mockModel.find).toHaveBeenCalledWith({ tier: 'silver' });
    });

    it('should find customers by gold tier', async () => {
      await repository.findByTier('gold');
      expect(mockModel.find).toHaveBeenCalledWith({ tier: 'gold' });
    });

    it('should find customers by platinum tier', async () => {
      await repository.findByTier('platinum');
      expect(mockModel.find).toHaveBeenCalledWith({ tier: 'platinum' });
    });

    it('should return empty array if no customers in tier', async () => {
      (mockModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findByTier('platinum');
      expect(result).toEqual([]);
    });
  });
});
