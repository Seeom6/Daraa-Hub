import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditLogQueryService } from './audit-log-query.service';
import { AuditLog } from '../../../../database/schemas/audit-log.schema';
import { generateObjectId } from '../../testing';

describe('AuditLogQueryService', () => {
  let service: AuditLogQueryService;
  let mockModel: any;

  const mockLog = {
    _id: generateObjectId(),
    performedBy: generateObjectId(),
    action: 'USER_LOGIN',
    category: 'AUTH',
    status: 'success',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockModel = {
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockLog]),
      }),
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLog),
      }),
      countDocuments: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogQueryService,
        { provide: getModelToken(AuditLog.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<AuditLogQueryService>(AuditLogQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated logs', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.logs).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply filters', async () => {
      await service.findAll({
        performedBy: generateObjectId(),
        action: 'LOGIN',
        category: 'AUTH',
        status: 'success',
        startDate: new Date(),
        endDate: new Date(),
      });

      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return log by id', async () => {
      const result = await service.findById(generateObjectId());

      expect(result).toEqual(mockLog);
    });
  });

  describe('findByUser', () => {
    it('should return logs by user', async () => {
      const result = await service.findByUser(generateObjectId());

      expect(result).toHaveLength(1);
    });
  });

  describe('findByTarget', () => {
    it('should return logs by target', async () => {
      const result = await service.findByTarget(generateObjectId());

      expect(result).toHaveLength(1);
    });
  });

  describe('findByCategory', () => {
    it('should return logs by category', async () => {
      const result = await service.findByCategory('AUTH');

      expect(result).toHaveLength(1);
    });
  });

  describe('exportLogs', () => {
    it('should export logs with filters', async () => {
      const result = await service.exportLogs({
        performedBy: generateObjectId(),
        category: 'AUTH',
        startDate: new Date(),
        endDate: new Date(),
      });

      expect(result).toHaveLength(1);
    });
  });
});
