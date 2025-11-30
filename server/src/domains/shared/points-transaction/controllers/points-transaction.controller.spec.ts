import { Test, TestingModule } from '@nestjs/testing';
import { PointsTransactionController } from './points-transaction.controller';
import { PointsTransactionService } from '../services/points-transaction.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { TransactionType } from '../../../../database/schemas/points-transaction.schema';
import { generateObjectId } from '../../testing';

describe('PointsTransactionController', () => {
  let controller: PointsTransactionController;
  let pointsService: jest.Mocked<PointsTransactionService>;

  const userId = generateObjectId();
  const profileId = generateObjectId();
  const mockUser = { userId, profileId };

  const mockTransaction = {
    _id: generateObjectId(),
    customerId: profileId,
    type: TransactionType.EARNED,
    amount: 100,
  };

  beforeEach(async () => {
    pointsService = {
      getBalance: jest.fn().mockResolvedValue({ balance: 500, tier: 'gold' }),
      findAll: jest
        .fn()
        .mockResolvedValue({ data: [mockTransaction], total: 1 }),
      findOne: jest.fn().mockResolvedValue(mockTransaction),
      redeemPoints: jest.fn().mockResolvedValue(mockTransaction),
      getExpiringPoints: jest
        .fn()
        .mockResolvedValue({ expiringPoints: 50, transactions: [] }),
      create: jest.fn().mockResolvedValue(mockTransaction),
      awardPoints: jest.fn().mockResolvedValue(mockTransaction),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointsTransactionController],
      providers: [
        { provide: PointsTransactionService, useValue: pointsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PointsTransactionController>(
      PointsTransactionController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return user balance', async () => {
      const result = await controller.getBalance(mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ balance: 500, tier: 'gold' });
      expect(pointsService.getBalance).toHaveBeenCalledWith(profileId);
    });
  });

  describe('getTransactions', () => {
    it('should return user transactions', async () => {
      const queryDto = { page: 1, limit: 10 } as any;

      const result = await controller.getTransactions(mockUser, queryDto);

      expect(result.success).toBe(true);
      expect(pointsService.findAll).toHaveBeenCalled();
    });
  });

  describe('getTransaction', () => {
    it('should return transaction by ID', async () => {
      const result = await controller.getTransaction(mockTransaction._id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTransaction);
    });
  });

  describe('redeemPoints', () => {
    it('should redeem points', async () => {
      const redeemDto = { points: 50, description: 'Discount' };

      const result = await controller.redeemPoints(mockUser, redeemDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Points redeemed successfully');
      expect(pointsService.redeemPoints).toHaveBeenCalledWith(
        profileId,
        redeemDto,
      );
    });
  });

  describe('getExpiringPoints', () => {
    it('should return expiring points', async () => {
      const result = await controller.getExpiringPoints(mockUser, 30);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('expiringPoints');
    });
  });

  describe('createTransaction', () => {
    it('should create transaction for admin', async () => {
      const createDto = {
        customerId: profileId,
        type: TransactionType.EARNED,
        amount: 100,
        description: 'Bonus',
      };

      const result = await controller.createTransaction(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Transaction created successfully');
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions for admin', async () => {
      const queryDto = { page: 1, limit: 10 } as any;

      const result = await controller.getAllTransactions(queryDto);

      expect(result.success).toBe(true);
      expect(pointsService.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('awardPoints', () => {
    it('should award points for admin', async () => {
      const awardDto = {
        customerId: profileId,
        amount: 100,
        description: 'Bonus',
      };

      const result = await controller.awardPoints(awardDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Points awarded successfully');
    });
  });
});
