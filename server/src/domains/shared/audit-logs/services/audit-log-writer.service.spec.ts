import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditLogWriterService } from './audit-log-writer.service';
import { AuditLog } from '../../../../database/schemas/audit-log.schema';
import { generateObjectId } from '../../testing';

describe('AuditLogWriterService', () => {
  let service: AuditLogWriterService;
  let mockModel: any;
  let mockSave: jest.Mock;

  beforeEach(async () => {
    mockSave = jest.fn().mockResolvedValue({ _id: generateObjectId() });
    mockModel = jest.fn().mockImplementation(() => ({ save: mockSave }));
    mockModel.deleteMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 10 }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogWriterService,
        { provide: getModelToken(AuditLog.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<AuditLogWriterService>(AuditLogWriterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create audit log', async () => {
      const dto = {
        performedBy: generateObjectId(),
        action: 'USER_LOGIN',
        category: 'AUTH' as any,
        actionType: 'LOGIN' as any,
        ipAddress: '127.0.0.1',
      };

      await service.create(dto);

      expect(mockSave).toHaveBeenCalled();
    });

    it('should create audit log with targetId', async () => {
      const dto = {
        performedBy: generateObjectId(),
        action: 'USER_UPDATE',
        category: 'USER' as any,
        actionType: 'UPDATE' as any,
        ipAddress: '127.0.0.1',
        targetId: generateObjectId(),
      };

      await service.create(dto);

      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      mockSave.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.create({
          performedBy: generateObjectId(),
          action: 'TEST',
          category: 'AUTH' as any,
          actionType: 'LOGIN' as any,
          ipAddress: '127.0.0.1',
        }),
      ).rejects.toThrow('DB Error');
    });
  });

  describe('log', () => {
    it('should log action', async () => {
      await service.log(
        generateObjectId(),
        'USER_LOGIN',
        'AUTH',
        'LOGIN',
        '127.0.0.1',
      );

      expect(mockSave).toHaveBeenCalled();
    });

    it('should log action with options', async () => {
      await service.log(
        generateObjectId(),
        'USER_UPDATE',
        'USER',
        'UPDATE',
        '127.0.0.1',
        {
          targetId: generateObjectId(),
          metadata: { key: 'value' },
          status: 'success',
        },
      );

      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('deleteOldLogs', () => {
    it('should delete old logs', async () => {
      const result = await service.deleteOldLogs(365);

      expect(result).toBe(10);
      expect(mockModel.deleteMany).toHaveBeenCalled();
    });
  });
});
