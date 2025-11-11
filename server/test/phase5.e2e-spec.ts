import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Phase 5: Coupons & Offers (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let adminCookies: string[];
  let customerCookies: string[];
  let storeOwnerCookies: string[];
  let customerId: string;
  let storeId: string;
  let productId: string;
  let categoryId: string;

  // Test data IDs
  let pointsTransactionId: string;
  let couponId: string;
  let offerId: string;
  let referralCode: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());

    // Login as admin
    const adminLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phoneNumber: '+963991234567', password: 'Admin@123456' });

    if (!adminLoginRes.headers['set-cookie']) {
      console.error('Admin login failed:', adminLoginRes.body);
      throw new Error('Admin login failed');
    }
    adminCookies = adminLoginRes.headers['set-cookie'];

    // Login as customer
    const customerLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phoneNumber: '+963991234571', password: 'Admin@123456' });

    if (!customerLoginRes.headers['set-cookie']) {
      console.error('Customer login failed:', customerLoginRes.body);
      throw new Error('Customer login failed');
    }
    customerCookies = customerLoginRes.headers['set-cookie'];

    // Get customer profile ID
    const customerProfileRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', customerCookies);
    customerId = customerProfileRes.body.data.profileId;

    // Login as store owner
    const storeOwnerLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phoneNumber: '+963991234569', password: 'Admin@123456' });

    if (!storeOwnerLoginRes.headers['set-cookie']) {
      console.error('Store owner login failed:', storeOwnerLoginRes.body);
      throw new Error('Store owner login failed');
    }
    storeOwnerCookies = storeOwnerLoginRes.headers['set-cookie'];

    // Get store owner profile ID
    const storeOwnerProfileRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', storeOwnerCookies);
    storeId = storeOwnerProfileRes.body.data.profileId;

    // Get existing product and category
    const productsRes = await request(app.getHttpServer())
      .get('/api/products')
      .query({ limit: 1 });
    if (productsRes.body.data && productsRes.body.data.length > 0) {
      productId = productsRes.body.data[0]._id;
    }

    const categoriesRes = await request(app.getHttpServer())
      .get('/api/categories')
      .query({ limit: 1 });
    if (categoriesRes.body.data && categoriesRes.body.data.length > 0) {
      categoryId = categoriesRes.body.data[0]._id;
    }

    // Cleanup: Delete any existing test data
    await connection.collection('pointstransactions').deleteMany({});
    await connection.collection('coupons').deleteMany({ code: 'TEST2024' });
    await connection.collection('offers').deleteMany({});
    await connection.collection('referrals').deleteMany({});
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    if (pointsTransactionId) {
      await connection.collection('pointstransactions').deleteMany({});
    }
    if (couponId) {
      await connection.collection('coupons').deleteOne({ _id: couponId });
    }
    if (offerId) {
      await connection.collection('offers').deleteOne({ _id: offerId });
    }
    if (referralCode) {
      await connection.collection('referrals').deleteMany({});
    }

    await app.close();
  });

  // ==================== Points Transaction Tests ====================
  describe('Points Transaction Module', () => {
    it('should get customer points balance', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/points/balance')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('balance');
      expect(res.body.data).toHaveProperty('tier');
    });

    it('should award points to customer (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/points/admin/award')
        .set('Cookie', adminCookies)
        .send({
          customerId,
          amount: 100,
          description: 'Test reward',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.amount).toBe(100);
      pointsTransactionId = res.body.data._id;
    });

    it('should get customer transaction history', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/points/transactions')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should redeem points', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/points/redeem')
        .set('Cookie', customerCookies)
        .send({
          points: 50,
          description: 'Test redemption',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(-50);
    });

    it('should get expiring points', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/points/expiring')
        .set('Cookie', customerCookies)
        .query({ days: 30 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('expiringPoints');
      expect(res.body.data).toHaveProperty('transactions');
    });

    it('should fail to redeem more points than available', async () => {
      await request(app.getHttpServer())
        .post('/api/points/redeem')
        .set('Cookie', customerCookies)
        .send({
          points: 999999,
          description: 'Invalid redemption',
        })
        .expect(400);
    });
  });

  // ==================== Coupon Tests ====================
  describe('Coupon Module', () => {
    it('should create a coupon (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/coupons/admin')
        .set('Cookie', adminCookies)
        .send({
          code: 'TEST2024',
          type: 'percentage',
          discountValue: 20,
          minPurchaseAmount: 100,
          maxDiscountAmount: 50,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('TEST2024');
      couponId = res.body.data._id;
    });

    it('should get all coupons (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/coupons/admin')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should get available coupons for customer', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/coupons/available')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should validate coupon', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/coupons/validate')
        .set('Cookie', customerCookies)
        .send({
          code: 'TEST2024',
          customerId,
          orderAmount: 200,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('discountAmount');
    });

    it('should fail to validate invalid coupon', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/coupons/validate')
        .set('Cookie', customerCookies)
        .send({
          code: 'INVALID',
          customerId,
          orderAmount: 200,
        })
        .expect(201);

      expect(res.body.success).toBe(false);
    });

    it('should update coupon (admin)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/coupons/admin/${couponId}`)
        .set('Cookie', adminCookies)
        .send({
          discountValue: 25,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.discountValue).toBe(25);
    });

    it('should get coupon usage stats (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/coupons/admin/${couponId}/usage`)
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalUsage');
      expect(res.body.data).toHaveProperty('totalDiscount');
    });
  });

  // ==================== Offer Tests ====================
  describe('Offer Module', () => {
    it('should create an offer (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/offers/store')
        .set('Cookie', storeOwnerCookies)
        .send({
          title: 'Summer Sale',
          description: '20% off on all products',
          discountType: 'percentage',
          discountValue: 20,
          minPurchaseAmount: 50,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Summer Sale');
      offerId = res.body.data._id;
    });

    it('should get all offers', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/offers')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should get offer by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/offers/${offerId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(offerId);
    });

    it('should get active offers for store', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/offers/store/${storeId}/active`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should update offer (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/offers/store/${offerId}`)
        .set('Cookie', storeOwnerCookies)
        .send({
          discountValue: 25,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.discountValue).toBe(25);
    });

    it('should get offer analytics (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/offers/store/${offerId}/analytics`)
        .set('Cookie', storeOwnerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('viewCount');
      expect(res.body.data).toHaveProperty('usageCount');
    });
  });

  // ==================== Referral Tests ====================
  describe('Referral Module', () => {
    it('should get or create referral code', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/referrals/my-code')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('code');
      referralCode = res.body.data.code;
    });

    it('should get referral statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/referrals/my-stats')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalReferrals');
      expect(res.body.data).toHaveProperty('completedReferrals');
    });

    it('should get my referrals', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/referrals/my')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should fail to apply own referral code', async () => {
      await request(app.getHttpServer())
        .post('/api/referrals/apply')
        .set('Cookie', customerCookies)
        .send({
          code: referralCode,
        })
        .expect(400);
    });

    it('should get all referrals (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/referrals/admin')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});

