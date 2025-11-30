import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PointsTransactionRepository } from './points-transaction.repository';
import { PointsTransaction } from '../../../../database/schemas/points-transaction.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('PointsTransactionRepository', () => {
  let repository: PointsTransactionRepository;
  let mockModel: any;

  const transactionId = generateObjectId();
  const userId = generateObjectId();

  const mockTransaction = {
    _id: transactionId,
    userId,
    points: 100,
    type: 'earned',
    description: 'Order completed',
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockTransaction]);
    mockModel.aggregate = jest.fn().mockResolvedValue([{ total: 500 }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsTransactionRepository,
        { provide: getModelToken(PointsTransaction.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<PointsTransactionRepository>(
      PointsTransactionRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should find transactions by user ID with pagination', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByUserId(userId, 1, 10);

      expect(result.data).toEqual([mockTransaction]);
      expect(result.total).toBe(1);
    });
  });

  describe('findByType', () => {
    it('should find transactions by type', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByType(userId, 'earned', 1, 10);

      expect(result.data).toEqual([mockTransaction]);
    });
  });

  describe('getTotalPoints', () => {
    it('should return total points for user', async () => {
      const result = await repository.getTotalPoints(userId);

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result).toBe(500);
    });

    it('should return 0 if no transactions', async () => {
      mockModel.aggregate.mockResolvedValue([]);

      const result = await repository.getTotalPoints(userId);

      expect(result).toBe(0);
    });
  });

  describe('getPointsSummary', () => {
    it('should return points summary by type', async () => {
      mockModel.aggregate.mockResolvedValue([
        { _id: 'earned', totalPoints: 500, count: 5 },
      ]);

      const result = await repository.getPointsSummary(userId);

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual([{ _id: 'earned', totalPoints: 500, count: 5 }]);
    });

    it('should return empty array when no transactions', async () => {
      mockModel.aggregate.mockResolvedValue([]);

      const result = await repository.getPointsSummary(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findByDateRange', () => {
    it('should find transactions by date range', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });

      const result = await repository.findByDateRange(
        userId,
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result).toEqual([mockTransaction]);
    });

    it('should return empty array when no transactions in range', async () => {
      mockModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      const result = await repository.findByDateRange(
        userId,
        new Date('2020-01-01'),
        new Date('2020-12-31'),
      );

      expect(result).toEqual([]);
    });
  });

  describe('findByUserId with default pagination', () => {
    it('should use default page and limit', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByUserId(userId);

      expect(result.data).toEqual([mockTransaction]);
      expect(result.total).toBe(1);
    });
  });

  describe('findByType with default pagination', () => {
    it('should use default page and limit', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByType(userId, 'redeemed');

      expect(result.data).toEqual([mockTransaction]);
    });
  });
});
