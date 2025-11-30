import { Test, TestingModule } from '@nestjs/testing';
import { ReferralController } from './referral.controller';
import { ReferralService } from '../services/referral.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { generateObjectId } from '../../testing';

describe('ReferralController', () => {
  let controller: ReferralController;
  let referralService: jest.Mocked<ReferralService>;

  const userId = generateObjectId();
  const profileId = generateObjectId();
  const mockUser = { userId, profileId };

  const mockReferral = {
    _id: generateObjectId(),
    code: 'ABC12345',
    referrerId: profileId,
  };

  beforeEach(async () => {
    referralService = {
      getOrCreateReferralCode: jest.fn().mockResolvedValue(mockReferral),
      applyReferralCode: jest.fn().mockResolvedValue(mockReferral),
      getReferralStats: jest.fn().mockResolvedValue({ totalReferrals: 5 }),
      findAll: jest.fn().mockResolvedValue({ data: [mockReferral], total: 1 }),
      findOne: jest.fn().mockResolvedValue(mockReferral),
      distributeRewards: jest.fn().mockResolvedValue(mockReferral),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferralController],
      providers: [{ provide: ReferralService, useValue: referralService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReferralController>(ReferralController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyReferralCode', () => {
    it('should return referral code', async () => {
      const result = await controller.getMyReferralCode(mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReferral);
      expect(referralService.getOrCreateReferralCode).toHaveBeenCalledWith(
        profileId,
      );
    });
  });

  describe('applyReferralCode', () => {
    it('should apply referral code', async () => {
      const applyDto = { code: 'ABC12345', referredId: '' };

      const result = await controller.applyReferralCode(mockUser, applyDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Referral code applied successfully');
      expect(referralService.applyReferralCode).toHaveBeenCalledWith(
        'ABC12345',
        profileId,
      );
    });
  });

  describe('getMyReferralStats', () => {
    it('should return referral stats', async () => {
      const result = await controller.getMyReferralStats(mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ totalReferrals: 5 });
    });
  });

  describe('getMyReferrals', () => {
    it('should return user referrals', async () => {
      const queryDto = { page: 1, limit: 10 } as any;

      const result = await controller.getMyReferrals(mockUser, queryDto);

      expect(result.success).toBe(true);
      expect(referralService.findAll).toHaveBeenCalled();
    });
  });

  describe('getAllReferrals', () => {
    it('should return all referrals for admin', async () => {
      const queryDto = { page: 1, limit: 10 } as any;

      const result = await controller.getAllReferrals(queryDto);

      expect(result.success).toBe(true);
      expect(referralService.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('getReferral', () => {
    it('should return referral by ID', async () => {
      const result = await controller.getReferral(mockReferral._id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReferral);
    });
  });

  describe('distributeRewards', () => {
    it('should distribute rewards', async () => {
      const result = await controller.distributeRewards(mockReferral._id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Rewards distributed successfully');
      expect(referralService.distributeRewards).toHaveBeenCalledWith(
        mockReferral._id,
      );
    });
  });
});
