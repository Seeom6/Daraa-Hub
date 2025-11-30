import { Test, TestingModule } from '@nestjs/testing';
import { PointsTransactionService } from './points-transaction.service';
import { PointsEarningService } from './points-earning.service';
import { PointsRedemptionService } from './points-redemption.service';
import { PointsQueryService } from './points-query.service';
import { generateObjectId } from '../../testing';

describe('PointsTransactionService', () => {
  let service: PointsTransactionService;

  const mockEarningService = {
    create: jest.fn(),
    awardPoints: jest.fn(),
  };

  const mockRedemptionService = {
    redeemPoints: jest.fn(),
    expirePoints: jest.fn(),
  };

  const mockQueryService = {
    getBalance: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getExpiringPoints: jest.fn(),
  };

  const transactionId = generateObjectId();
  const customerId = generateObjectId();
  const orderId = generateObjectId();

  const mockTransaction = {
    _id: transactionId,
    customerId,
    amount: 100,
    type: 'earn',
    description: 'Order reward',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsTransactionService,
        { provide: PointsEarningService, useValue: mockEarningService },
        { provide: PointsRedemptionService, useValue: mockRedemptionService },
        { provide: PointsQueryService, useValue: mockQueryService },
      ],
    }).compile();

    service = module.get<PointsTransactionService>(PointsTransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to earning service', async () => {
      mockEarningService.create.mockResolvedValue(mockTransaction);

      const result = await service.create({ customerId, amount: 100 } as any);

      expect(result).toEqual(mockTransaction);
    });
  });

  describe('awardPoints', () => {
    it('should delegate to earning service', async () => {
      mockEarningService.awardPoints.mockResolvedValue(mockTransaction);

      const result = await service.awardPoints(
        customerId,
        100,
        'Order reward',
        orderId,
      );

      expect(result).toEqual(mockTransaction);
    });
  });

  describe('redeemPoints', () => {
    it('should delegate to redemption service', async () => {
      mockRedemptionService.redeemPoints.mockResolvedValue({
        ...mockTransaction,
        type: 'redeem',
        amount: -50,
      });

      const result = await service.redeemPoints(customerId, {
        amount: 50,
      } as any);

      expect(result.type).toBe('redeem');
    });
  });

  describe('expirePoints', () => {
    it('should delegate to redemption service', async () => {
      mockRedemptionService.expirePoints.mockResolvedValue(5);

      const result = await service.expirePoints();

      expect(result).toBe(5);
    });
  });

  describe('getBalance', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getBalance.mockResolvedValue({
        balance: 500,
        tier: 'gold',
      });

      const result = await service.getBalance(customerId);

      expect(result.balance).toBe(500);
      expect(result.tier).toBe('gold');
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [mockTransaction],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll({});

      expect(result.data).toEqual([mockTransaction]);
    });
  });

  describe('findOne', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne(transactionId);

      expect(result).toEqual(mockTransaction);
      expect(mockQueryService.findOne).toHaveBeenCalledWith(transactionId);
    });
  });

  describe('getExpiringPoints', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getExpiringPoints.mockResolvedValue({
        expiringPoints: 100,
        transactions: [mockTransaction],
      });

      const result = await service.getExpiringPoints(customerId, 30);

      expect(result.expiringPoints).toBe(100);
    });
  });
});
