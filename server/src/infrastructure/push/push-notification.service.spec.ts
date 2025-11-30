import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  PushNotificationService,
  PushNotificationPayload,
} from './push-notification.service';

describe('PushNotificationService', () => {
  let service: PushNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushNotificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<PushNotificationService>(PushNotificationService);
  });

  describe('sendToDevice', () => {
    it('should send push notification to device (mock)', async () => {
      const payload: PushNotificationPayload = {
        title: 'Test Title',
        body: 'Test Body',
        data: { orderId: '123' },
      };

      const result = await service.sendToDevice('device-token-123', payload);

      expect(result).toBe(true);
    });

    it('should handle empty device token', async () => {
      const payload: PushNotificationPayload = {
        title: 'Test',
        body: 'Test',
      };

      const result = await service.sendToDevice('', payload);
      expect(result).toBe(true); // Mock implementation always returns true
    });
  });

  describe('sendToDevices', () => {
    it('should send push notification to multiple devices', async () => {
      const payload: PushNotificationPayload = {
        title: 'Bulk Title',
        body: 'Bulk Body',
      };

      const result = await service.sendToDevices(
        ['token1', 'token2', 'token3'],
        payload,
      );

      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
    });

    it('should return zero counts for empty tokens array', async () => {
      const payload: PushNotificationPayload = {
        title: 'Test',
        body: 'Test',
      };

      const result = await service.sendToDevices([], payload);

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
    });
  });

  describe('sendToTopic', () => {
    it('should send push notification to topic', async () => {
      const payload: PushNotificationPayload = {
        title: 'Topic Title',
        body: 'Topic Body',
        imageUrl: 'https://example.com/image.png',
      };

      const result = await service.sendToTopic('news', payload);

      expect(result).toBe(true);
    });
  });

  describe('subscribeToTopic', () => {
    it('should subscribe devices to topic', async () => {
      const result = await service.subscribeToTopic(
        ['token1', 'token2'],
        'promotions',
      );

      expect(result).toBe(true);
    });
  });

  describe('unsubscribeFromTopic', () => {
    it('should unsubscribe devices from topic', async () => {
      const result = await service.unsubscribeFromTopic(
        ['token1', 'token2'],
        'promotions',
      );

      expect(result).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle sendToDevice error', async () => {
      // Create a service that throws an error
      const errorService = new PushNotificationService({
        get: jest.fn().mockReturnValue(null),
      } as any);

      // Override the internal logger to throw
      jest.spyOn(errorService['logger'], 'log').mockImplementation(() => {
        throw new Error('Logging failed');
      });

      const result = await errorService.sendToDevice('token', {
        title: 'Test',
        body: 'Test',
      });
      expect(result).toBe(false);
    });

    it('should handle sendToDevices error', async () => {
      const errorService = new PushNotificationService({
        get: jest.fn().mockReturnValue(null),
      } as any);

      jest.spyOn(errorService['logger'], 'log').mockImplementation(() => {
        throw new Error('Logging failed');
      });

      const result = await errorService.sendToDevices(['token1'], {
        title: 'Test',
        body: 'Test',
      });
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(1);
    });

    it('should handle sendToTopic error', async () => {
      const errorService = new PushNotificationService({
        get: jest.fn().mockReturnValue(null),
      } as any);

      jest.spyOn(errorService['logger'], 'log').mockImplementation(() => {
        throw new Error('Logging failed');
      });

      const result = await errorService.sendToTopic('topic', {
        title: 'Test',
        body: 'Test',
      });
      expect(result).toBe(false);
    });

    it('should handle subscribeToTopic error', async () => {
      const errorService = new PushNotificationService({
        get: jest.fn().mockReturnValue(null),
      } as any);

      jest.spyOn(errorService['logger'], 'log').mockImplementation(() => {
        throw new Error('Logging failed');
      });

      const result = await errorService.subscribeToTopic(['token'], 'topic');
      expect(result).toBe(false);
    });

    it('should handle unsubscribeFromTopic error', async () => {
      const errorService = new PushNotificationService({
        get: jest.fn().mockReturnValue(null),
      } as any);

      jest.spyOn(errorService['logger'], 'log').mockImplementation(() => {
        throw new Error('Logging failed');
      });

      const result = await errorService.unsubscribeFromTopic(
        ['token'],
        'topic',
      );
      expect(result).toBe(false);
    });
  });
});
