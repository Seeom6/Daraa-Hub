import { Test, TestingModule } from '@nestjs/testing';
import { ReferralService } from './referral.service';
import { ReferralCodeService } from './referral-code.service';
import { ReferralRewardService } from './referral-reward.service';
import { ReferralQueryService } from './referral-query.service';
import { generateObjectId } from '../../testing';

describe('ReferralService', () => {
  let service: ReferralService;

  const mockCodeService = {
    getOrCreateReferralCode: jest.fn(),
    applyReferralCode: jest.fn(),
    completeReferral: jest.fn(),
  };

  const mockRewardService = {
    distributeRewards: jest.fn(),
  };

  const mockQueryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getReferralStats: jest.fn(),
  };

  const referralId = generateObjectId();
  const customerId = generateObjectId();
  const referredId = generateObjectId();

  const mockReferral = {
    _id: referralId,
    referrerId: customerId,
    referredId,
    code: 'REF123',
    status: 'pending',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralService,
        { provide: ReferralCodeService, useValue: mockCodeService },
        { provide: ReferralRewardService, useValue: mockRewardService },
        { provide: ReferralQueryService, useValue: mockQueryService },
      ],
    }).compile();

    service = module.get<ReferralService>(ReferralService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateReferralCode', () => {
    it('should delegate to code service', async () => {
      mockCodeService.getOrCreateReferralCode.mockResolvedValue(mockReferral);

      const result = await service.getOrCreateReferralCode(customerId);

      expect(result).toEqual(mockReferral);
    });
  });

  describe('applyReferralCode', () => {
    it('should delegate to code service', async () => {
      mockCodeService.applyReferralCode.mockResolvedValue(mockReferral);

      const result = await service.applyReferralCode('REF123', referredId);

      expect(result).toEqual(mockReferral);
    });
  });

  describe('completeReferral', () => {
    it('should delegate to code service', async () => {
      mockCodeService.completeReferral.mockResolvedValue({
        ...mockReferral,
        status: 'completed',
      });

      const result = await service.completeReferral(
        referredId,
        generateObjectId(),
      );

      expect(result.status).toBe('completed');
    });
  });

  describe('distributeRewards', () => {
    it('should delegate to reward service', async () => {
      mockRewardService.distributeRewards.mockResolvedValue({
        ...mockReferral,
        rewardsDistributed: true,
      });

      const result = await service.distributeRewards(referralId);

      expect(result.rewardsDistributed).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [mockReferral],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll({});

      expect(result.data).toEqual([mockReferral]);
    });
  });

  describe('findOne', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findOne.mockResolvedValue(mockReferral);

      const result = await service.findOne(referralId);

      expect(result).toEqual(mockReferral);
    });
  });

  describe('getReferralStats', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getReferralStats.mockResolvedValue({
        totalReferrals: 10,
        completedReferrals: 5,
        pendingReferrals: 5,
        totalRewardsEarned: 5000,
      });

      const result = await service.getReferralStats(customerId);

      expect(result.totalReferrals).toBe(10);
      expect(result.completedReferrals).toBe(5);
    });
  });
});
