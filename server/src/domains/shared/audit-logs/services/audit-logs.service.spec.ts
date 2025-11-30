import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogWriterService } from './audit-log-writer.service';
import { AuditLogQueryService } from './audit-log-query.service';
import { AuditLogStatsService } from './audit-log-stats.service';
import { generateObjectId } from '../../testing';

describe('AuditLogsService', () => {
  let service: AuditLogsService;

  const mockWriterService = {
    create: jest.fn(),
    log: jest.fn(),
    deleteOldLogs: jest.fn(),
  };

  const mockQueryService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findByTarget: jest.fn(),
    findByCategory: jest.fn(),
    exportLogs: jest.fn(),
  };

  const mockStatsService = {
    getStatistics: jest.fn(),
  };

  const logId = generateObjectId();
  const userId = generateObjectId();

  const mockLog = {
    _id: logId,
    performedBy: userId,
    action: 'user.login',
    category: 'auth',
    status: 'success',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: AuditLogWriterService, useValue: mockWriterService },
        { provide: AuditLogQueryService, useValue: mockQueryService },
        { provide: AuditLogStatsService, useValue: mockStatsService },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to writer service', async () => {
      mockWriterService.create.mockResolvedValue(mockLog);

      const result = await service.create({ action: 'user.login' } as any);

      expect(result).toEqual(mockLog);
    });
  });

  describe('log', () => {
    it('should delegate to writer service', async () => {
      mockWriterService.log.mockResolvedValue(mockLog);

      const result = await service.log(
        userId,
        'user.login',
        'auth',
        'login',
        '127.0.0.1',
      );

      expect(result).toEqual(mockLog);
    });
  });

  describe('deleteOldLogs', () => {
    it('should delegate to writer service', async () => {
      mockWriterService.deleteOldLogs.mockResolvedValue(100);

      const result = await service.deleteOldLogs(365);

      expect(result).toBe(100);
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({ logs: [mockLog], total: 1 });

      const result = await service.findAll({});

      expect(result.logs).toEqual([mockLog]);
    });
  });

  describe('findById', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findById.mockResolvedValue(mockLog);

      const result = await service.findById(logId);

      expect(result).toEqual(mockLog);
    });
  });

  describe('findByUser', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findByUser.mockResolvedValue([mockLog]);

      const result = await service.findByUser(userId);

      expect(result).toEqual([mockLog]);
    });
  });

  describe('findByCategory', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findByCategory.mockResolvedValue([mockLog]);

      const result = await service.findByCategory('auth');

      expect(result).toEqual([mockLog]);
    });
  });

  describe('findByTarget', () => {
    it('should delegate to query service', async () => {
      const targetId = generateObjectId();
      mockQueryService.findByTarget.mockResolvedValue([mockLog]);

      const result = await service.findByTarget(targetId);

      expect(result).toEqual([mockLog]);
      expect(mockQueryService.findByTarget).toHaveBeenCalledWith(targetId, 50);
    });

    it('should use custom limit when provided', async () => {
      const targetId = generateObjectId();
      mockQueryService.findByTarget.mockResolvedValue([mockLog]);

      await service.findByTarget(targetId, 100);

      expect(mockQueryService.findByTarget).toHaveBeenCalledWith(targetId, 100);
    });
  });

  describe('exportLogs', () => {
    it('should delegate to query service', async () => {
      mockQueryService.exportLogs.mockResolvedValue([mockLog]);

      const result = await service.exportLogs({ category: 'auth' });

      expect(result).toEqual([mockLog]);
      expect(mockQueryService.exportLogs).toHaveBeenCalledWith({
        category: 'auth',
      });
    });
  });

  describe('getStatistics', () => {
    it('should delegate to stats service', async () => {
      mockStatsService.getStatistics.mockResolvedValue({ totalLogs: 1000 });

      const result = await service.getStatistics({});

      expect(result.totalLogs).toBe(1000);
    });
  });
});
