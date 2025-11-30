import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserActivityRepository } from './user-activity.repository';
import { UserActivity } from '../../../../database/schemas/user-activity.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('UserActivityRepository', () => {
  let repository: UserActivityRepository;
  let mockModel: any;

  const userId = generateObjectId();
  const sessionId = 'session-123';

  const mockActivity = {
    _id: generateObjectId(),
    userId,
    sessionId,
    events: [{ type: 'page_view', data: {}, timestamp: new Date() }],
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockActivity]);
    mockModel.findOneAndUpdate = jest.fn().mockResolvedValue(mockActivity);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserActivityRepository,
        { provide: getModelToken(UserActivity.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<UserActivityRepository>(UserActivityRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserAndSession', () => {
    it('should find activity by user and session', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockActivity),
      });

      const result = await repository.findByUserAndSession(userId, sessionId);

      expect(result).toEqual(mockActivity);
    });
  });

  describe('findByUserId', () => {
    it('should find all activities by user ID', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockActivity]),
      });

      const result = await repository.findByUserId(userId);

      expect(result).toEqual([mockActivity]);
    });
  });

  describe('addEventToSession', () => {
    it('should add event to existing session', async () => {
      const event = { type: 'click', data: {}, timestamp: new Date() };

      const result = await repository.addEventToSession(sessionId, event);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
