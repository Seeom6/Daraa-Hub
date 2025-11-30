import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReferralRepository } from './referral.repository';
import { Referral } from '../../../../database/schemas/referral.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('ReferralRepository', () => {
  let repository: ReferralRepository;
  let mockModel: any;

  const referralId = generateObjectId();
  const referrerId = generateObjectId();
  const referredId = generateObjectId();

  const mockReferral = {
    _id: referralId,
    referrerId,
    referredUserId: referredId,
    referralCode: 'REF123',
    isCompleted: false,
    rewardAmount: 0,
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockReferral]);
    mockModel.aggregate = jest
      .fn()
      .mockResolvedValue([{ totalReferrals: 5, completedReferrals: 3 }]);
    mockModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockReferral) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralRepository,
        { provide: getModelToken(Referral.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<ReferralRepository>(ReferralRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByReferrerId', () => {
    it('should find referrals by referrer ID with pagination', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockReferral]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByReferrerId(referrerId, 1, 10);

      expect(result.data).toEqual([mockReferral]);
      expect(result.total).toBe(1);
    });
  });

  describe('findByReferredId', () => {
    it('should find referral by referred user ID', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReferral),
      });

      const result = await repository.findByReferredId(referredId);

      expect(result).toEqual(mockReferral);
    });
  });

  describe('findByCode', () => {
    it('should find referral by code', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReferral),
      });

      const result = await repository.findByCode('REF123');

      expect(result).toEqual(mockReferral);
    });
  });

  describe('getReferralStats', () => {
    it('should return referral statistics', async () => {
      const result = await repository.getReferralStats(referrerId);

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual([{ totalReferrals: 5, completedReferrals: 3 }]);
    });
  });

  describe('markAsCompleted', () => {
    it('should mark referral as completed', async () => {
      const result = await repository.markAsCompleted(referralId, 100);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('getTopReferrers', () => {
    it('should return top referrers with custom limit', async () => {
      const result = await repository.getTopReferrers(5);

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual([{ totalReferrals: 5, completedReferrals: 3 }]);
    });

    it('should return top referrers with default limit', async () => {
      const result = await repository.getTopReferrers();

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual([{ totalReferrals: 5, completedReferrals: 3 }]);
    });
  });

  describe('findByReferrerId with default pagination', () => {
    it('should use default page and limit', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockReferral]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByReferrerId(referrerId);

      expect(result.data).toEqual([mockReferral]);
      expect(result.total).toBe(1);
    });
  });

  describe('findByReferredId when not found', () => {
    it('should return null when referral not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByReferredId(generateObjectId());

      expect(result).toBeNull();
    });
  });

  describe('findByCode when not found', () => {
    it('should return null when code not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByCode('INVALID');

      expect(result).toBeNull();
    });
  });
});
