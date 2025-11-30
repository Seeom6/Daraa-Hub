import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from '../services/audit-logs.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../admin/guards/admin.guard';
import { generateObjectId } from '../../testing';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  const mockLog = {
    _id: generateObjectId(),
    performedBy: generateObjectId(),
    action: 'CREATE',
    category: 'USER',
    targetId: generateObjectId(),
    status: 'success',
  };

  beforeEach(async () => {
    auditLogsService = {
      findAll: jest.fn().mockResolvedValue({ data: [mockLog], total: 1 }),
      getStatistics: jest.fn().mockResolvedValue({ totalLogs: 100 }),
      exportLogs: jest.fn().mockResolvedValue([mockLog]),
      findByUser: jest.fn().mockResolvedValue([mockLog]),
      findByTarget: jest.fn().mockResolvedValue([mockLog]),
      findByCategory: jest.fn().mockResolvedValue([mockLog]),
      findById: jest.fn().mockResolvedValue(mockLog),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [{ provide: AuditLogsService, useValue: auditLogsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLogs', () => {
    it('should return all logs', async () => {
      const result = await controller.getAllLogs();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ data: [mockLog], total: 1 });
    });

    it('should filter logs by parameters', async () => {
      await controller.getAllLogs(
        'user1',
        'CREATE',
        'USER',
        'target1',
        'success',
      );

      expect(auditLogsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          performedBy: 'user1',
          action: 'CREATE',
          category: 'USER',
          targetId: 'target1',
          status: 'success',
        }),
      );
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      const result = await controller.getStatistics();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ totalLogs: 100 });
    });
  });

  describe('exportLogs', () => {
    it('should export logs', async () => {
      const result = await controller.exportLogs();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockLog]);
      expect(result.count).toBe(1);
    });
  });

  describe('getUserLogs', () => {
    it('should return logs by user', async () => {
      const userId = generateObjectId();

      const result = await controller.getUserLogs(userId);

      expect(result.success).toBe(true);
      expect(auditLogsService.findByUser).toHaveBeenCalledWith(userId, 50);
    });
  });

  describe('getTargetLogs', () => {
    it('should return logs by target', async () => {
      const targetId = generateObjectId();

      const result = await controller.getTargetLogs(targetId);

      expect(result.success).toBe(true);
      expect(auditLogsService.findByTarget).toHaveBeenCalledWith(targetId, 50);
    });
  });

  describe('getCategoryLogs', () => {
    it('should return logs by category', async () => {
      const result = await controller.getCategoryLogs('USER');

      expect(result.success).toBe(true);
      expect(auditLogsService.findByCategory).toHaveBeenCalledWith('USER', 50);
    });
  });

  describe('getLogById', () => {
    it('should return log by ID', async () => {
      const result = await controller.getLogById(mockLog._id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLog);
    });
  });

  describe('getAllLogs with date filters', () => {
    it('should filter by startDate', async () => {
      const startDate = '2024-01-01';
      await controller.getAllLogs(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        startDate,
      );

      expect(auditLogsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: new Date(startDate),
        }),
      );
    });

    it('should filter by endDate', async () => {
      const endDate = '2024-12-31';
      await controller.getAllLogs(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        endDate,
      );

      expect(auditLogsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          endDate: new Date(endDate),
        }),
      );
    });

    it('should use custom page and limit', async () => {
      await controller.getAllLogs(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        '3',
        '100',
      );

      expect(auditLogsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 3,
          limit: 100,
        }),
      );
    });

    it('should use default page and limit when not provided', async () => {
      await controller.getAllLogs();

      expect(auditLogsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 50,
        }),
      );
    });
  });

  describe('getStatistics with date filters', () => {
    it('should filter by startDate', async () => {
      const startDate = '2024-01-01';
      await controller.getStatistics(startDate);

      expect(auditLogsService.getStatistics).toHaveBeenCalledWith({
        startDate: new Date(startDate),
        endDate: undefined,
      });
    });

    it('should filter by endDate', async () => {
      const endDate = '2024-12-31';
      await controller.getStatistics(undefined, endDate);

      expect(auditLogsService.getStatistics).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: new Date(endDate),
      });
    });
  });

  describe('exportLogs with filters', () => {
    it('should filter by performedBy', async () => {
      await controller.exportLogs('user1');

      expect(auditLogsService.exportLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          performedBy: 'user1',
        }),
      );
    });

    it('should filter by category', async () => {
      await controller.exportLogs(undefined, 'ORDER');

      expect(auditLogsService.exportLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ORDER',
        }),
      );
    });

    it('should filter by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      await controller.exportLogs(undefined, undefined, startDate, endDate);

      expect(auditLogsService.exportLogs).toHaveBeenCalledWith({
        performedBy: undefined,
        category: undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    });
  });

  describe('getUserLogs with custom limit', () => {
    it('should use custom limit', async () => {
      const userId = generateObjectId();
      await controller.getUserLogs(userId, '100');

      expect(auditLogsService.findByUser).toHaveBeenCalledWith(userId, 100);
    });
  });

  describe('getTargetLogs with custom limit', () => {
    it('should use custom limit', async () => {
      const targetId = generateObjectId();
      await controller.getTargetLogs(targetId, '100');

      expect(auditLogsService.findByTarget).toHaveBeenCalledWith(targetId, 100);
    });
  });

  describe('getCategoryLogs with custom limit', () => {
    it('should use custom limit', async () => {
      await controller.getCategoryLogs('ORDER', '100');

      expect(auditLogsService.findByCategory).toHaveBeenCalledWith(
        'ORDER',
        100,
      );
    });
  });
});
