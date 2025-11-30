import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from '../services/notifications.service';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let mockJwtService: any;
  let mockNotificationsService: any;
  let mockServer: any;

  beforeEach(async () => {
    mockJwtService = {
      verify: jest.fn().mockReturnValue({ sub: 'user-123' }),
    };

    mockNotificationsService = {
      getUnreadCount: jest.fn().mockResolvedValue(5),
      markAsRead: jest.fn().mockResolvedValue({}),
    };

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: mockJwtService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    gateway.server = mockServer;
  });

  describe('handleConnection', () => {
    it('should authenticate and connect client', async () => {
      const mockClient = {
        id: 'socket-123',
        handshake: { auth: { token: 'valid-token' }, headers: {} },
        data: {},
        join: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
      };

      await gateway.handleConnection(mockClient as any);

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(mockClient.join).toHaveBeenCalledWith('user:user-123');
      expect(mockClient.emit).toHaveBeenCalledWith('unread-count', {
        count: 5,
      });
    });

    it('should disconnect client without token', async () => {
      const mockClient = {
        id: 'socket-123',
        handshake: { auth: {}, headers: {} },
        disconnect: jest.fn(),
      };

      await gateway.handleConnection(mockClient as any);

      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client with invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const mockClient = {
        id: 'socket-123',
        handshake: { auth: { token: 'invalid-token' }, headers: {} },
        disconnect: jest.fn(),
      };

      await gateway.handleConnection(mockClient as any);

      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle client disconnection', () => {
      const mockClient = {
        id: 'socket-123',
        data: { userId: 'user-123' },
      };

      // First connect the client
      (gateway as any).userSockets.set('user-123', new Set(['socket-123']));

      gateway.handleDisconnect(mockClient as any);

      expect(gateway.isUserOnline('user-123')).toBe(false);
    });
  });

  describe('handleSubscribe', () => {
    it('should handle subscription', () => {
      const mockClient = { data: { userId: 'user-123' } };

      const result = gateway.handleSubscribe(mockClient as any);

      expect(result).toEqual({ event: 'subscribed', data: { success: true } });
    });
  });

  describe('handleMarkRead', () => {
    it('should mark notification as read', async () => {
      const mockClient = { data: { userId: 'user-123' } };

      const result = await gateway.handleMarkRead(mockClient as any, {
        notificationId: 'notif-123',
      });

      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(
        'notif-123',
      );
      expect(result).toEqual({ event: 'marked-read', data: { success: true } });
    });

    it('should handle errors', async () => {
      mockNotificationsService.markAsRead.mockRejectedValue(
        new Error('Not found'),
      );
      const mockClient = { data: { userId: 'user-123' } };

      const result = await gateway.handleMarkRead(mockClient as any, {
        notificationId: 'invalid',
      });

      expect(result).toEqual({
        event: 'error',
        data: { message: 'Not found' },
      });
    });
  });

  describe('sendNotificationToUser', () => {
    it('should send notification to user room', () => {
      gateway.sendNotificationToUser('user-123', { title: 'Test' });

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('notification', {
        title: 'Test',
      });
    });
  });

  describe('broadcastNotification', () => {
    it('should broadcast to all users', () => {
      gateway.broadcastNotification({ title: 'Broadcast' });

      expect(mockServer.emit).toHaveBeenCalledWith('notification', {
        title: 'Broadcast',
      });
    });
  });

  describe('utility methods', () => {
    it('should return online users count', () => {
      (gateway as any).userSockets.set('user-1', new Set(['s1']));
      (gateway as any).userSockets.set('user-2', new Set(['s2']));

      expect(gateway.getOnlineUsersCount()).toBe(2);
    });

    it('should check if user is online', () => {
      (gateway as any).userSockets.set('user-1', new Set(['s1']));

      expect(gateway.isUserOnline('user-1')).toBe(true);
      expect(gateway.isUserOnline('user-2')).toBe(false);
    });

    it('should get user socket count', () => {
      (gateway as any).userSockets.set('user-1', new Set(['s1', 's2']));

      expect(gateway.getUserSocketCount('user-1')).toBe(2);
      expect(gateway.getUserSocketCount('user-2')).toBe(0);
    });
  });

  describe('sendUnreadCountToUser', () => {
    it('should send unread count to user room', () => {
      gateway.sendUnreadCountToUser('user-123', 10);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('unread-count', {
        count: 10,
      });
    });
  });

  describe('sendNotificationToUsers', () => {
    it('should send notification to multiple users', () => {
      const notification = { title: 'Multi-user notification' };
      const userIds = ['user-1', 'user-2', 'user-3'];

      gateway.sendNotificationToUsers(userIds, notification);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-1');
      expect(mockServer.to).toHaveBeenCalledWith('user:user-2');
      expect(mockServer.to).toHaveBeenCalledWith('user:user-3');
      expect(mockServer.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle empty user list', () => {
      gateway.sendNotificationToUsers([], { title: 'Test' });

      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });

  describe('handleConnection - additional branches', () => {
    it('should use authorization header when auth token is not provided', async () => {
      const mockClient = {
        id: 'socket-456',
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-token' },
        },
        data: {},
        join: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
      };

      await gateway.handleConnection(mockClient as any);

      expect(mockJwtService.verify).toHaveBeenCalledWith('header-token');
      expect(mockClient.join).toHaveBeenCalledWith('user:user-123');
    });

    it('should add socket to existing user socket set', async () => {
      // First connection
      (gateway as any).userSockets.set(
        'user-123',
        new Set(['existing-socket']),
      );

      const mockClient = {
        id: 'new-socket',
        handshake: { auth: { token: 'valid-token' }, headers: {} },
        data: {},
        join: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
      };

      await gateway.handleConnection(mockClient as any);

      expect(gateway.getUserSocketCount('user-123')).toBe(2);
    });
  });

  describe('handleDisconnect - additional branches', () => {
    it('should handle disconnect when user has no sockets', () => {
      const mockClient = {
        id: 'socket-123',
        data: { userId: undefined },
      };

      // Should not throw
      gateway.handleDisconnect(mockClient as any);
    });

    it('should keep user entry when other sockets remain', () => {
      (gateway as any).userSockets.set(
        'user-123',
        new Set(['socket-1', 'socket-2']),
      );

      const mockClient = {
        id: 'socket-1',
        data: { userId: 'user-123' },
      };

      gateway.handleDisconnect(mockClient as any);

      expect(gateway.isUserOnline('user-123')).toBe(true);
      expect(gateway.getUserSocketCount('user-123')).toBe(1);
    });
  });
});
