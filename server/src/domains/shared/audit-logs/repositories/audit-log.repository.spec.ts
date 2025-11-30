import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLog } from '../../../../database/schemas/audit-log.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('AuditLogRepository', () => {
  let repository: AuditLogRepository;
  let mockModel: any;

  const logId = generateObjectId();
  const userId = generateObjectId();
  const entityId = generateObjectId();

  const mockLog = {
    _id: logId,
    userId,
    action: 'CREATE',
    entityType: 'Order',
    entityId,
    details: { orderId: entityId },
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockLog]);
    mockModel.aggregate = jest
      .fn()
      .mockResolvedValue([{ _id: 'CREATE', count: 10 }]);
    mockModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 5 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogRepository,
        { provide: getModelToken(AuditLog.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<AuditLogRepository>(AuditLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should find logs by user ID with pagination', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockLog]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByUserId(userId, 1, 10);

      expect(result.data).toEqual([mockLog]);
      expect(result.total).toBe(1);
    });
  });

  describe('findByAction', () => {
    it('should find logs by action', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockLog]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByAction('CREATE', 1, 10);

      expect(result.data).toEqual([mockLog]);
    });
  });

  describe('findByEntity', () => {
    it('should find logs by entity', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockLog]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByEntity('Order', entityId, 1, 10);

      expect(result.data).toEqual([mockLog]);
    });
  });

  describe('findByDateRange', () => {
    it('should find logs by date range', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockLog]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByDateRange(
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        1,
        10,
      );

      expect(result.data).toEqual([mockLog]);
    });
  });

  describe('deleteOldLogs', () => {
    it('should delete old logs with default 90 days', async () => {
      const result = await repository.deleteOldLogs();

      expect(mockModel.deleteMany).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should delete old logs with custom days', async () => {
      const result = await repository.deleteOldLogs(30);

      expect(mockModel.deleteMany).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });

  describe('getActivitySummary', () => {
    it('should return activity summary with userId', async () => {
      const result = await repository.getActivitySummary(userId);

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual([{ _id: 'CREATE', count: 10 }]);
    });

    it('should return activity summary without userId', async () => {
      const result = await repository.getActivitySummary();

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual([{ _id: 'CREATE', count: 10 }]);
    });
  });

  describe('findByUserId with default pagination', () => {
    it('should use default page and limit', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockLog]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByUserId(userId);

      expect(result.data).toEqual([mockLog]);
      expect(result.total).toBe(1);
    });
  });

  describe('findByAction with default pagination', () => {
    it('should use default page and limit', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockLog]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByAction('CREATE');

      expect(result.data).toEqual([mockLog]);
    });
  });

  describe('findByEntity with default pagination', () => {
    it('should use default page and limit', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockLog]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByEntity('Order', entityId);

      expect(result.data).toEqual([mockLog]);
    });
  });

  describe('findByDateRange with default pagination', () => {
    it('should use default page and limit', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockLog]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByDateRange(
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result.data).toEqual([mockLog]);
    });
  });
});
