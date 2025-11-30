import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PointsEarningService } from './points-earning.service';
import {
  PointsTransaction,
  TransactionType,
} from '../../../../database/schemas/points-transaction.schema';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';
import { generateObjectId, createMockEventEmitter } from '../../testing';

describe('PointsEarningService', () => {
  let service: PointsEarningService;
  let pointsTransactionModel: any;
  let customerProfileModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const customerId = generateObjectId();
  const transactionId = generateObjectId();

  const mockCustomer = {
    _id: customerId,
    loyaltyPoints: 100,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockTransaction = {
    _id: transactionId,
    customerId,
    type: TransactionType.EARNED,
    amount: 50,
    balanceBefore: 100,
    balanceAfter: 150,
  };

  beforeEach(async () => {
    pointsTransactionModel = {
      create: jest.fn().mockResolvedValue(mockTransaction),
    };

    customerProfileModel = {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockCustomer) }),
    };

    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsEarningService,
        {
          provide: getModelToken(PointsTransaction.name),
          useValue: pointsTransactionModel,
        },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: customerProfileModel,
        },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<PointsEarningService>(PointsEarningService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      customerId,
      type: TransactionType.EARNED,
      amount: 50,
      description: 'Order reward',
    };

    it('should create points transaction', async () => {
      const result = await service.create(createDto);

      expect(pointsTransactionModel.create).toHaveBeenCalled();
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'points.transaction.created',
        expect.any(Object),
      );
    });

    it('should throw for invalid customer ID', async () => {
      await expect(
        service.create({ ...createDto, customerId: 'invalid' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if customer not found', async () => {
      customerProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if insufficient balance for deduction', async () => {
      const deductDto = { ...createDto, amount: -200 };

      await expect(service.create(deductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('awardPoints', () => {
    it('should award points to customer', async () => {
      const result = await service.awardPoints(customerId, 50, 'Bonus points');

      expect(pointsTransactionModel.create).toHaveBeenCalled();
    });

    it('should throw for invalid customer ID', async () => {
      await expect(service.awardPoints('invalid', 50, 'test')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw for non-positive amount', async () => {
      await expect(service.awardPoints(customerId, 0, 'test')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw for negative amount', async () => {
      await expect(
        service.awardPoints(customerId, -10, 'test'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
