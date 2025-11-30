import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReferralRewardService } from './referral-reward.service';
import {
  Referral,
  ReferralStatus,
  RewardType,
} from '../../../../database/schemas/referral.schema';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';
import { generateObjectId, createMockEventEmitter } from '../../testing';

describe('ReferralRewardService', () => {
  let service: ReferralRewardService;
  let referralModel: any;
  let customerProfileModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const referralId = generateObjectId();
  const referrerId = generateObjectId();
  const referredId = generateObjectId();

  const mockReferrer = {
    _id: referrerId,
    loyaltyPoints: 100,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockReferred = {
    _id: referredId,
    accountId: 'referred123',
    loyaltyPoints: 50,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockReferral = {
    _id: referralId,
    referrerId,
    referredId,
    code: 'ABC12345',
    status: ReferralStatus.COMPLETED,
    reward: {
      referrerReward: { type: RewardType.POINTS, value: 100 },
      referredReward: { type: RewardType.POINTS, value: 50 },
    },
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    referralModel = {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockReferral) }),
      find: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([mockReferral]) }),
    };

    customerProfileModel = {
      findById: jest
        .fn()
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockReferrer),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockReferred),
        }),
    };

    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralRewardService,
        { provide: getModelToken(Referral.name), useValue: referralModel },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: customerProfileModel,
        },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<ReferralRewardService>(ReferralRewardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('distributeRewards', () => {
    it('should distribute rewards to both parties', async () => {
      await service.distributeRewards(referralId);

      expect(mockReferrer.save).toHaveBeenCalled();
      expect(mockReferred.save).toHaveBeenCalled();
      expect(mockReferral.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'referral.rewarded',
        expect.any(Object),
      );
    });

    it('should throw if referral not found', async () => {
      referralModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.distributeRewards(referralId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if referral not completed', async () => {
      referralModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockReferral,
          status: ReferralStatus.PENDING,
        }),
      });

      await expect(service.distributeRewards(referralId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw for invalid referral ID', async () => {
      await expect(service.distributeRewards('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getTotalRewardsEarned', () => {
    it('should calculate total rewards', async () => {
      referralModel.find.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            { ...mockReferral, status: ReferralStatus.REWARDED },
          ]),
      });

      const result = await service.getTotalRewardsEarned(referrerId);

      expect(result).toBe(100);
    });

    it('should return 0 if no rewarded referrals', async () => {
      referralModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getTotalRewardsEarned(referrerId);

      expect(result).toBe(0);
    });

    it('should throw for invalid customer ID', async () => {
      await expect(service.getTotalRewardsEarned('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
