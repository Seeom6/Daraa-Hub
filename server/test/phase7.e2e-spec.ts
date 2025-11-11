import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Phase 7: Analytics & Reporting (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  let adminCookies: string[];
  let customerCookies: string[];
  let storeOwnerCookies: string[];
  let customerId: string;
  let storeId: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.setGlobalPrefix('api');

    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());

    // Cleanup: Delete any existing test data
    await connection.collection('useractivities').deleteMany({});
    await connection.collection('productanalytics').deleteMany({});
    await connection.collection('storeanalytics').deleteMany({});

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234567',
        password: 'Admin@123456',
      });

    adminCookies = adminLoginResponse.headers['set-cookie'];

    // Login as customer
    const customerLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234571',
        password: 'Admin@123456',
      });

    customerCookies = customerLoginResponse.headers['set-cookie'];

    // Get customer profile ID
    const customerMeResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', customerCookies);

    if (customerMeResponse.body.data && customerMeResponse.body.data.userId) {
      customerId = customerMeResponse.body.data.userId;
    } else {
      throw new Error('Failed to get customer userId');
    }

    // Login as store owner
    const storeOwnerLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234569',
        password: 'Admin@123456',
      });

    storeOwnerCookies = storeOwnerLoginResponse.headers['set-cookie'];

    // Get store owner profile ID (which is the storeId)
    const storeOwnerMeResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', storeOwnerCookies);

    if (storeOwnerMeResponse.body.data && storeOwnerMeResponse.body.data.profileId) {
      storeId = storeOwnerMeResponse.body.data.profileId;
    } else {
      throw new Error('Failed to get store owner profileId');
    }

    // Get a product (use any available product)
    const productsResponse = await request(app.getHttpServer())
      .get('/api/products')
      .set('Cookie', customerCookies);

    if (productsResponse.body.data && productsResponse.body.data.length > 0) {
      productId = productsResponse.body.data[0]._id;
    } else {
      throw new Error('No products found');
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await connection.collection('useractivities').deleteMany({});
    await connection.collection('productanalytics').deleteMany({});
    await connection.collection('storeanalytics').deleteMany({});

    await app.close();
  });

  describe('1. User Activity Tracking', () => {
    it('1.1 should track page view event (customer)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/analytics/track')
        .set('Cookie', customerCookies)
        .send({
          type: 'page_view',
          data: {
            page: '/products',
            title: 'Products Page',
          },
          sessionId: 'test-session-1',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.events.length).toBeGreaterThan(0);
    });

    it('1.2 should track product view event (customer)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/analytics/track')
        .set('Cookie', customerCookies)
        .send({
          type: 'product_view',
          data: {
            productId,
            productName: 'Test Product',
          },
          sessionId: 'test-session-1',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.events.length).toBeGreaterThan(1);
    });

    it('1.3 should track add to cart event (customer)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/analytics/track')
        .set('Cookie', customerCookies)
        .send({
          type: 'add_to_cart',
          data: {
            productId,
            quantity: 2,
          },
          sessionId: 'test-session-1',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.events.length).toBeGreaterThan(2);
    });

    it('1.4 should get my activity (customer)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/my-activity')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('2. Product Analytics', () => {
    it('2.1 should get product analytics (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/products')
        .set('Cookie', storeOwnerCookies)
        .query({
          period: 'daily',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('2.2 should get product analytics with filters (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/products')
        .set('Cookie', adminCookies)
        .query({
          period: 'daily',
          storeId,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('3. Store Analytics', () => {
    it('3.1 should get store analytics (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/stores')
        .set('Cookie', storeOwnerCookies)
        .query({
          period: 'daily',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('3.2 should get store analytics with filters (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/stores')
        .set('Cookie', adminCookies)
        .query({
          period: 'monthly',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('4. Dashboard Metrics', () => {
    it('4.1 should get dashboard metrics (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/dashboard')
        .set('Cookie', storeOwnerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('today');
      expect(res.body.data).toHaveProperty('monthly');
    });

    it('4.2 should get dashboard metrics (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/dashboard')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('5. Admin Analytics', () => {
    it('5.1 should get all user activities (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/admin/activities')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('5.2 should not allow customer to access admin activities', async () => {
      await request(app.getHttpServer())
        .get('/api/analytics/admin/activities')
        .set('Cookie', customerCookies)
        .expect(403);
    });
  });
});

