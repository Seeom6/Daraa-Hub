import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationRepository } from './notification.repository';
import { Notification } from '../../../../database/schemas/notification.schema';
import { MockModelFactory, generateObjectId } from '../../testing';
import { FakerDataFactory } from '../../testing/mock-data.factory';

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = MockModelFactory.create();
    mockModel.updateMany = jest.fn();
    mockModel.deleteMany = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        {
          provide: getModelToken(Notification.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<NotificationRepository>(NotificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByRecipientId', () => {
    it('should find notifications by recipient id', async () => {
      const recipientId = generateObjectId();
      const mockNotifications = FakerDataFactory.createMany(
        () => FakerDataFactory.createNotification({ recipientId }),
        5,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotifications),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await repository.findByRecipientId(recipientId);

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
    });

    it('should filter by isRead when provided', async () => {
      const recipientId = generateObjectId();
      const mockNotifications = [
        FakerDataFactory.createNotification({ isRead: false }),
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotifications),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByRecipientId(recipientId, {
        isRead: false,
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = generateObjectId();
      const mockNotification = FakerDataFactory.createNotification({
        isRead: true,
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotification),
      });

      const result = await repository.markAsRead(notificationId);

      expect(result?.isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      const recipientId = generateObjectId();
      mockModel.updateMany.mockResolvedValue({ modifiedCount: 10 });

      const result = await repository.markAllAsRead(recipientId);

      expect(result).toBe(10);
      expect(mockModel.updateMany).toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const recipientId = generateObjectId();
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await repository.getUnreadCount(recipientId);

      expect(result).toBe(5);
    });
  });

  describe('deleteOldNotifications', () => {
    it('should delete old read notifications', async () => {
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 100 });

      const result = await repository.deleteOldNotifications(30);

      expect(result).toBe(100);
      expect(mockModel.deleteMany).toHaveBeenCalled();
    });
  });
});
