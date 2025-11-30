import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReferralQueryService } from './referral-query.service';
import {
  Referral,
  ReferralStatus,
} from '../../../../database/schemas/referral.schema';
import { generateObjectId } from '../../testing';

describe('ReferralQueryService', () => {
  let service: ReferralQueryService;
  let referralModel: any;

  const referralId = generateObjectId();
  const customerId = generateObjectId();

  const mockReferral = {
    _id: referralId,
    referrerId: customerId,
    referredId: generateObjectId(),
    code: 'ABC12345',
    status: ReferralStatus.COMPLETED,
    reward: { referrerReward: { value: 100 } },
  };

  beforeEach(async () => {
    referralModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue([mockReferral]),
                  }),
                }),
              }),
            }),
          }),
        }),
        exec: jest.fn().mockResolvedValue([mockReferral]),
      }),
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockReferral),
            }),
          }),
        }),
      }),
      countDocuments: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralQueryService,
        { provide: getModelToken(Referral.name), useValue: referralModel },
      ],
    }).compile();

    service = module.get<ReferralQueryService>(ReferralQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated referrals', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockReferral]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by referrer ID', async () => {
      await service.findAll({ referrerId: customerId });

      expect(referralModel.find).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      await service.findAll({ status: ReferralStatus.COMPLETED });

      expect(referralModel.find).toHaveBeenCalled();
    });

    it('should throw for invalid referrer ID', async () => {
      await expect(service.findAll({ referrerId: 'invalid' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should filter by referred ID', async () => {
      const referredId = generateObjectId();
      await service.findAll({ referredId });

      expect(referralModel.find).toHaveBeenCalled();
    });

    it('should throw for invalid referred ID', async () => {
      await expect(service.findAll({ referredId: 'invalid' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should filter by search', async () => {
      await service.findAll({ search: 'ABC' });

      expect(referralModel.find).toHaveBeenCalled();
    });

    it('should use default pagination values', async () => {
      const result = await service.findAll({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should sort by specified field and order', async () => {
      await service.findAll({ sortBy: 'code', sortOrder: 'asc' });

      expect(referralModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return referral by ID', async () => {
      const result = await service.findOne(referralId);

      expect(result).toEqual(mockReferral);
    });

    it('should throw if not found', async () => {
      referralModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(null),
            }),
          }),
        }),
      });

      await expect(service.findOne(referralId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw for invalid ID', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getReferralStats', () => {
    it('should return referral statistics', async () => {
      const result = await service.getReferralStats(customerId);

      expect(result).toHaveProperty('totalReferrals');
      expect(result).toHaveProperty('completedReferrals');
      expect(result).toHaveProperty('pendingReferrals');
      expect(result).toHaveProperty('totalRewardsEarned');
    });

    it('should throw for invalid customer ID', async () => {
      await expect(service.getReferralStats('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should calculate stats correctly', async () => {
      const mockReferrals = [
        {
          referredId: generateObjectId(),
          status: ReferralStatus.COMPLETED,
          reward: { referrerReward: { value: 100 } },
        },
        {
          referredId: generateObjectId(),
          status: ReferralStatus.REWARDED,
          reward: { referrerReward: { value: 200 } },
        },
        {
          referredId: generateObjectId(),
          status: ReferralStatus.PENDING,
          reward: { referrerReward: { value: 0 } },
        },
        {
          referredId: null,
          status: ReferralStatus.PENDING,
          reward: { referrerReward: { value: 0 } },
        },
      ];
      referralModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReferrals),
      });

      const result = await service.getReferralStats(customerId);

      expect(result.totalReferrals).toBe(3);
      expect(result.completedReferrals).toBe(2);
      expect(result.pendingReferrals).toBe(1);
      expect(result.totalRewardsEarned).toBe(200);
    });
  });
});
