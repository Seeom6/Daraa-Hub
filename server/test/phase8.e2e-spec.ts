import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Phase 8: Notifications & Communication (E2E)', () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let adminCookies: string[];
  let customerCookies: string[];
  let storeOwnerCookies: string[];
  let customerId: string;
  let storeOwnerId: string;
  let notificationId: string;
  let deviceTokenId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    mongoConnection = moduleFixture.get<Connection>(getConnectionToken());

    // Login as admin
    const adminLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234567',
        password: 'Admin@123456',
      });
    adminCookies = adminLoginRes.headers['set-cookie'];

    // Login as store owner (use as customer for testing)
    const storeOwnerLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234569',
        password: 'Admin@123456',
      });
    storeOwnerCookies = storeOwnerLoginRes.headers['set-cookie'];
    customerCookies = storeOwnerCookies; // Use store owner as customer for testing

    // Get store owner ID
    const storeOwnerMeRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', storeOwnerCookies);
    storeOwnerId = storeOwnerMeRes.body.data.profileId;
    customerId = storeOwnerId; // Use store owner as customer for testing
  });

  afterAll(async () => {
    // Cleanup: Delete test notifications
    if (mongoConnection) {
      await mongoConnection.collection('notifications').deleteMany({});
      await mongoConnection.collection('devicetokens').deleteMany({});
    }
    await app.close();
  });

  describe('1. Notification Preferences', () => {
    it('1.1 should get notification preferences (creates default if not exists)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications/preferences')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('channels');
      expect(res.body.data).toHaveProperty('categories');
      expect(res.body.data).toHaveProperty('language');
    });

    it('1.2 should update notification preferences', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/notifications/preferences')
        .set('Cookie', customerCookies)
        .send({
          channels: {
            push: true,
            email: false,
            sms: true,
            in_app: true,
          },
          categories: {
            promotions: false,
          },
          language: 'en',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.channels.email).toBe(false);
      expect(res.body.data.categories.promotions).toBe(false);
      expect(res.body.data.language).toBe('en');
    });

    it('1.3 should update quiet hours', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/notifications/preferences')
        .set('Cookie', customerCookies)
        .send({
          quietHours: {
            enabled: true,
            startTime: '22:00',
            endTime: '08:00',
            timezone: 'Asia/Damascus',
          },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.quietHours.enabled).toBe(true);
      expect(res.body.data.quietHours.startTime).toBe('22:00');
    });
  });

  describe('2. Device Token Management', () => {
    it('2.1 should register a device token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/notifications/devices')
        .set('Cookie', customerCookies)
        .send({
          token: 'test-fcm-token-12345',
          platform: 'android',
          deviceInfo: {
            deviceId: 'device-123',
            deviceName: 'Samsung Galaxy S23',
            osVersion: 'Android 14',
            appVersion: '1.0.0',
          },
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.token).toBe('test-fcm-token-12345');
      expect(res.body.data.platform).toBe('android');
      deviceTokenId = res.body.data._id;
    });

    it('2.2 should get user devices', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications/devices')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].token).toBe('test-fcm-token-12345');
    });

    it('2.3 should register iOS device token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/notifications/devices')
        .set('Cookie', customerCookies)
        .send({
          token: 'test-apns-token-67890',
          platform: 'ios',
          deviceInfo: {
            deviceId: 'device-456',
            deviceName: 'iPhone 15 Pro',
            osVersion: 'iOS 17',
            appVersion: '1.0.0',
          },
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.platform).toBe('ios');
    });

    it('2.4 should delete a device token', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/notifications/devices/${deviceTokenId}`)
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('3. Notifications', () => {
    it('3.1 should get user notifications (empty initially)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications/my')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('notifications');
      expect(Array.isArray(res.body.data.notifications)).toBe(true);
    });

    it('3.2 should get unread count', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications/my/unread-count')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('count');
      expect(typeof res.body.data.count).toBe('number');
    });

    it('3.3 should create notification (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/notifications')
        .set('Cookie', adminCookies)
        .send({
          recipientId: customerId,
          recipientRole: 'customer',
          title: 'Test Notification',
          message: 'This is a test notification',
          type: 'system',
          priority: 'info',
          channels: ['in_app'],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.title).toBe('Test Notification');
      notificationId = res.body.data._id;
    });

    it('3.4 should mark notification as read', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/notifications/${notificationId}/read`)
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
    });

    it('3.5 should mark all notifications as read', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/notifications/mark-all-read')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('3.6 should delete notification', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/notifications/${notificationId}`)
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('4. Notification Templates', () => {
    it('4.1 should get all templates (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications/templates')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('4.2 should get template by code (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications/templates/WELCOME_MESSAGE')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('WELCOME_MESSAGE');
    });
  });
});

