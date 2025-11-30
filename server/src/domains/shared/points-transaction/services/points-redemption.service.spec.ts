import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PointsRedemptionService } from './points-redemption.service';
import { PointsEarningService } from './points-earning.service';
import {
  PointsTransaction,
  TransactionType,
} from '../../../../database/schemas/points-transaction.schema';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';
import { generateObjectId } from '../../testing';

describe('PointsRedemptionService', () => {
  let service: PointsRedemptionService;
  let pointsTransactionModel: any;
  let customerProfileModel: any;
  let earningService: jest.Mocked<PointsEarningService>;

  const customerId = generateObjectId();
  const transactionId = generateObjectId();

  const mockCustomer = {
    _id: customerId,
    loyaltyPoints: 100,
  };

  const mockTransaction = {
    _id: transactionId,
    customerId,
    type: TransactionType.EARNED,
    amount: 50,
    isExpired: false,
    expiresAt: new Date(Date.now() - 1000),
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    pointsTransactionModel = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      }),
    };

    customerProfileModel = {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockCustomer) }),
    };

    earningService = {
      create: jest.fn().mockResolvedValue(mockTransaction),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsRedemptionService,
        {
          provide: getModelToken(PointsTransaction.name),
          useValue: pointsTransactionModel,
        },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: customerProfileModel,
        },
        { provide: PointsEarningService, useValue: earningService },
      ],
    }).compile();

    service = module.get<PointsRedemptionService>(PointsRedemptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('redeemPoints', () => {
    const redeemDto = {
      points: 50,
      description: 'Discount redemption',
    };

    it('should redeem points', async () => {
      const result = await service.redeemPoints(customerId, redeemDto);

      expect(earningService.create).toHaveBeenCalledWith({
        customerId,
        type: TransactionType.SPENT,
        amount: -50,
        description: 'Discount redemption',
      });
    });

    it('should throw for invalid customer ID', async () => {
      await expect(service.redeemPoints('invalid', redeemDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if customer not found', async () => {
      customerProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.redeemPoints(customerId, redeemDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if insufficient balance', async () => {
      await expect(
        service.redeemPoints(customerId, { points: 200, description: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('expirePoints', () => {
    it('should expire points and return count', async () => {
      const result = await service.expirePoints();

      expect(result).toBe(1);
      expect(mockTransaction.save).toHaveBeenCalled();
      expect(earningService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.EXPIRED,
        }),
      );
    });

    it('should return 0 if no expired transactions', async () => {
      pointsTransactionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.expirePoints();

      expect(result).toBe(0);
    });
  });
});
