import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditLogStatsService } from './audit-log-stats.service';
import { AuditLog } from '../../../../database/schemas/audit-log.schema';

describe('AuditLogStatsService', () => {
  let service: AuditLogStatsService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = {
      countDocuments: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(100) }),
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: 'AUTH', count: 50 }]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogStatsService,
        { provide: getModelToken(AuditLog.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<AuditLogStatsService>(AuditLogStatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      const result = await service.getStatistics();

      expect(result.totalLogs).toBe(100);
      expect(result.byCategory).toBeDefined();
      expect(result.byActionType).toBeDefined();
      expect(result.byStatus).toBeDefined();
      expect(result.topUsers).toBeDefined();
    });

    it('should apply date filters', async () => {
      await service.getStatistics({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(mockModel.countDocuments).toHaveBeenCalled();
      expect(mockModel.aggregate).toHaveBeenCalled();
    });
  });
});
