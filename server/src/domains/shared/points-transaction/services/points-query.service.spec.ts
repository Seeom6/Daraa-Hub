import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PointsQueryService } from './points-query.service';
import {
  PointsTransaction,
  TransactionType,
} from '../../../../database/schemas/points-transaction.schema';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';
import { generateObjectId } from '../../testing';

describe('PointsQueryService', () => {
  let service: PointsQueryService;
  let pointsTransactionModel: any;
  let customerProfileModel: any;

  const customerId = generateObjectId();
  const transactionId = generateObjectId();

  const mockCustomer = {
    _id: customerId,
    loyaltyPoints: 100,
    tier: 'gold',
  };

  const mockTransaction = {
    _id: transactionId,
    customerId,
    type: TransactionType.EARNED,
    amount: 50,
  };

  beforeEach(async () => {
    pointsTransactionModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  exec: jest.fn().mockResolvedValue([mockTransaction]),
                }),
              }),
            }),
          }),
          exec: jest.fn().mockResolvedValue([mockTransaction]),
        }),
      }),
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockTransaction),
          }),
        }),
      }),
      countDocuments: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
    };

    customerProfileModel = {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockCustomer) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsQueryService,
        {
          provide: getModelToken(PointsTransaction.name),
          useValue: pointsTransactionModel,
        },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: customerProfileModel,
        },
      ],
    }).compile();

    service = module.get<PointsQueryService>(PointsQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return customer balance and tier', async () => {
      const result = await service.getBalance(customerId);

      expect(result).toEqual({ balance: 100, tier: 'gold' });
    });

    it('should throw for invalid customer ID', async () => {
      await expect(service.getBalance('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if customer not found', async () => {
      customerProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getBalance(customerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockTransaction]);
      expect(result.total).toBe(1);
    });

    it('should filter by customer ID', async () => {
      await service.findAll({ customerId });

      expect(pointsTransactionModel.find).toHaveBeenCalled();
    });

    it('should throw for invalid customer ID', async () => {
      await expect(service.findAll({ customerId: 'invalid' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should filter by type', async () => {
      await service.findAll({ type: TransactionType.EARNED });

      expect(pointsTransactionModel.find).toHaveBeenCalled();
    });

    it('should filter by orderId', async () => {
      const orderId = generateObjectId();
      await service.findAll({ orderId });

      expect(pointsTransactionModel.find).toHaveBeenCalled();
    });

    it('should throw for invalid order ID', async () => {
      await expect(service.findAll({ orderId: 'invalid' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should filter by isExpired', async () => {
      await service.findAll({ isExpired: true });

      expect(pointsTransactionModel.find).toHaveBeenCalled();
    });

    it('should filter by search', async () => {
      await service.findAll({ search: 'test' });

      expect(pointsTransactionModel.find).toHaveBeenCalled();
    });

    it('should use default pagination values', async () => {
      const result = await service.findAll({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should sort by specified field and order', async () => {
      await service.findAll({ sortBy: 'amount', sortOrder: 'asc' });

      expect(pointsTransactionModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return transaction by ID', async () => {
      const result = await service.findOne(transactionId);

      expect(result).toEqual(mockTransaction);
    });

    it('should throw for invalid ID', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if not found', async () => {
      pointsTransactionModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.findOne(transactionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getExpiringPoints', () => {
    it('should return expiring points', async () => {
      const result = await service.getExpiringPoints(customerId, 30);

      expect(result).toHaveProperty('expiringPoints');
      expect(result).toHaveProperty('transactions');
    });

    it('should throw for invalid customer ID', async () => {
      await expect(service.getExpiringPoints('invalid', 30)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should use default daysAhead value', async () => {
      const result = await service.getExpiringPoints(customerId);

      expect(result).toHaveProperty('expiringPoints');
    });

    it('should calculate total expiring points', async () => {
      const mockTransactions = [
        { ...mockTransaction, amount: 50 },
        { ...mockTransaction, amount: 30 },
      ];
      pointsTransactionModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockTransactions),
        }),
      });

      const result = await service.getExpiringPoints(customerId, 30);

      expect(result.expiringPoints).toBe(80);
    });
  });
});
