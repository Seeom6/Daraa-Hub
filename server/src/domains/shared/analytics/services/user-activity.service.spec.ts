import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserActivityService } from './user-activity.service';
import { UserActivityRepository } from '../repositories/user-activity.repository';
import { generateObjectId } from '../../testing';

describe('UserActivityService', () => {
  let service: UserActivityService;

  const mockRepository = {
    findByUserAndSession: jest.fn(),
    create: jest.fn(),
    findWithPagination: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const userId = generateObjectId();

  const mockActivity = {
    _id: generateObjectId(),
    userId,
    sessionId: 'session-123',
    events: [],
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserActivityService,
        { provide: UserActivityRepository, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<UserActivityService>(UserActivityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should add event to existing session', async () => {
      mockRepository.findByUserAndSession.mockResolvedValue(mockActivity);

      const result = await service.trackEvent(userId, {
        type: 'page_view',
        sessionId: 'session-123',
      } as any);

      expect(mockActivity.events.length).toBeGreaterThan(0);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'analytics.event.tracked',
        expect.any(Object),
      );
    });

    it('should create new session if not exists', async () => {
      mockRepository.findByUserAndSession.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockActivity);

      const result = await service.trackEvent(userId, {
        type: 'page_view',
      } as any);

      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('getUserActivity', () => {
    it('should return paginated activity', async () => {
      mockRepository.findWithPagination.mockResolvedValue({
        data: [mockActivity],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.getUserActivity(userId, {
        page: 1,
        limit: 10,
      } as any);

      expect(result.data).toEqual([mockActivity]);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by date range', async () => {
      mockRepository.findWithPagination.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const result = await service.getUserActivity(userId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      } as any);

      expect(result.data).toEqual([]);
    });
  });
});
