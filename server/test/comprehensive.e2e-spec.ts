import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Comprehensive System Testing (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  let adminCookies: string[];
  let customerCookies: string[];
  let customer2Cookies: string[];
  let storeOwnerCookies: string[];
  let courierCookies: string[];
  let customerId: string;
  let customer2Id: string;
  let storeId: string;
  let courierId: string;
  let categoryId: string;
  let productId: string;
  let orderId: string;
  let reviewId: string;
  let couponId: string;
  let offerId: string;
  let disputeId: string;
  let returnId: string;

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

    // Login all users
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phoneNumber: '+963991234567', password: 'Admin@123456' });

    if (!adminLogin.headers['set-cookie']) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);
    }
    adminCookies = adminLogin.headers['set-cookie'];

    const customerLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phoneNumber: '+963991234571', password: 'Admin@123456' });

    if (!customerLogin.headers['set-cookie']) {
      throw new Error(`Customer login failed: ${JSON.stringify(customerLogin.body)}`);
    }
    customerCookies = customerLogin.headers['set-cookie'];

    const storeOwnerLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phoneNumber: '+963991234569', password: 'Admin@123456' });

    if (!storeOwnerLogin.headers['set-cookie']) {
      throw new Error(`Store owner login failed: ${JSON.stringify(storeOwnerLogin.body)}`);
    }
    storeOwnerCookies = storeOwnerLogin.headers['set-cookie'];

    const courierLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phoneNumber: '+963991234570', password: 'Admin@123456' });

    if (!courierLogin.headers['set-cookie']) {
      throw new Error(`Courier login failed: ${JSON.stringify(courierLogin.body)}`);
    }
    courierCookies = courierLogin.headers['set-cookie'];

    // Get profile IDs
    const customerMe = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', customerCookies);
    customerId = customerMe.body.data.profileId;

    const storeOwnerMe = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', storeOwnerCookies);
    storeId = storeOwnerMe.body.data.profileId;

    const courierMe = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', courierCookies);
    courierId = courierMe.body.data.profileId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Authentication & Authorization Tests', () => {
    it('1.1 should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phoneNumber: '+963991234567', password: 'Admin@123456' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('1.2 should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phoneNumber: '+963991234567', password: 'WrongPassword' })
        .expect(401);
    });

    it('1.3 should reject invalid phone format', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ phoneNumber: 'invalid', password: 'Admin@123456' })
        .expect(400);
    });

    it('1.4 should get current user info', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('userId');
      expect(res.body.data).toHaveProperty('role');
    });

    it('1.5 should reject unauthorized access', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('1.6 should enforce role-based access (admin only)', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/accounts')
        .set('Cookie', customerCookies)
        .expect(403);
    });

    it('1.7 should allow admin access to admin endpoints', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/accounts')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('1.8 should refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('2. Store Management Tests', () => {
    it('2.1 should create category (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Cookie', storeOwnerCookies)
        .send({
          name: 'Test Category Comprehensive',
          slug: 'test-category-comprehensive',
          description: 'Test category for comprehensive testing',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      categoryId = res.body.data._id;
    });

    it('2.2 should get all categories with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('2.3 should search categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories')
        .query({ search: 'Test' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('2.4 should create product with variants', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set('Cookie', storeOwnerCookies)
        .send({
          name: 'Comprehensive Test Product',
          nameAr: 'منتج اختبار شامل',
          description: 'Product for comprehensive testing',
          categoryId,
          price: 100,
          images: ['https://example.com/image1.jpg'],
          variants: [
            { name: 'Color', nameAr: 'اللون', options: ['Red', 'Blue'] },
            { name: 'Size', nameAr: 'الحجم', options: ['S', 'M', 'L'] },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      productId = res.body.data._id;
    });

    it('2.5 should add inventory for product', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/inventory')
        .set('Cookie', storeOwnerCookies)
        .send({
          productId,
          quantity: 1000,
          sku: 'COMP-TEST-001',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('2.6 should get products with filters', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .query({ categoryId, minPrice: 50, maxPrice: 150 })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('2.7 should search products', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .query({ search: 'Comprehensive' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('2.8 should update product', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/products/${productId}`)
        .set('Cookie', storeOwnerCookies)
        .send({ price: 120 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(120);
    });

    it('2.9 should not allow customer to create product', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Cookie', customerCookies)
        .send({
          name: 'Unauthorized Product',
          categoryId,
          price: 100,
        })
        .expect(403);
    });
  });

  describe('3. Cart & Order Tests', () => {
    it('3.1 should add item to cart', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Cookie', customerCookies)
        .send({ productId, quantity: 3 })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('3.2 should get cart', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/cart')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('3.3 should update cart item quantity', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/cart/items/${productId}`)
        .set('Cookie', customerCookies)
        .send({ quantity: 5 })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('3.4 should create order from cart', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Cookie', customerCookies)
        .send({
          storeId,
          deliveryAddress: {
            street: 'Test Street',
            city: 'Daraa',
            state: 'Daraa',
            country: 'Syria',
            postalCode: '12345',
          },
          paymentMethod: 'cash',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      orderId = res.body.data._id;
    });

    it('3.5 should get my orders', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/orders/my')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('3.6 should get order by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(orderId);
    });

    it('3.7 should update order status (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/orders/${orderId}/status`)
        .set('Cookie', storeOwnerCookies)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('3.8 should not allow customer to update order status', async () => {
      await request(app.getHttpServer())
        .put(`/api/orders/${orderId}/status`)
        .set('Cookie', customerCookies)
        .send({ status: 'shipped' })
        .expect(403);
    });

    it('3.9 should reject invalid order status', async () => {
      await request(app.getHttpServer())
        .put(`/api/orders/${orderId}/status`)
        .set('Cookie', storeOwnerCookies)
        .send({ status: 'invalid_status' })
        .expect(400);
    });

    it('3.10 should clear cart after order', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/cart')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.data.items.length).toBe(0);
    });
  });

  describe('4. Delivery & Payment Tests', () => {
    it('4.1 should assign courier to order (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/orders/${orderId}/assign-courier`)
        .set('Cookie', storeOwnerCookies)
        .send({ courierId })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('4.2 should get courier deliveries', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/courier/deliveries')
        .set('Cookie', courierCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('4.3 should update delivery status (courier)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/courier/deliveries/${orderId}/status`)
        .set('Cookie', courierCookies)
        .send({ status: 'picked_up' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('4.4 should track order delivery', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/orders/${orderId}/tracking`)
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('4.5 should complete delivery', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/courier/deliveries/${orderId}/status`)
        .set('Cookie', courierCookies)
        .send({ status: 'delivered' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('4.6 should process payment', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/payments/${orderId}/process`)
        .set('Cookie', storeOwnerCookies)
        .send({ paymentMethod: 'cash', amount: 600 })
        .expect(201);

      expect(res.body.success).toBe(true);
    });
  });

  describe('5. Reviews & Ratings Tests', () => {
    it('5.1 should create review (customer)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/reviews')
        .set('Cookie', customerCookies)
        .send({
          productId,
          orderId,
          rating: 5,
          comment: 'Excellent product! Highly recommended.',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      reviewId = res.body.data._id;
    });

    it('5.2 should get product reviews', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/reviews/product/${productId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('5.3 should reply to review (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/reviews/${reviewId}/reply`)
        .set('Cookie', storeOwnerCookies)
        .send({ reply: 'Thank you for your feedback!' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('5.4 should moderate review (admin)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/reviews/${reviewId}/moderate`)
        .set('Cookie', adminCookies)
        .send({ status: 'approved' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('5.5 should not allow duplicate review', async () => {
      await request(app.getHttpServer())
        .post('/api/reviews')
        .set('Cookie', customerCookies)
        .send({
          productId,
          orderId,
          rating: 4,
          comment: 'Another review',
        })
        .expect(400);
    });

    it('5.6 should filter reviews by rating', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/reviews/product/${productId}`)
        .query({ minRating: 4 })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('6. Coupons & Offers Tests', () => {
    it('6.1 should create coupon (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/coupons')
        .set('Cookie', storeOwnerCookies)
        .send({
          code: 'COMPTEST50',
          discountType: 'percentage',
          discountValue: 50,
          maxUsage: 100,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      couponId = res.body.data._id;
    });

    it('6.2 should validate coupon', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/coupons/validate')
        .set('Cookie', customerCookies)
        .send({ code: 'COMPTEST50', orderTotal: 200 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.discount).toBe(100);
    });

    it('6.3 should reject invalid coupon', async () => {
      await request(app.getHttpServer())
        .post('/api/coupons/validate')
        .set('Cookie', customerCookies)
        .send({ code: 'INVALID', orderTotal: 200 })
        .expect(404);
    });

    it('6.4 should create offer (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/offers')
        .set('Cookie', storeOwnerCookies)
        .send({
          title: 'Comprehensive Test Offer',
          titleAr: 'عرض اختبار شامل',
          description: 'Test offer',
          offerType: 'buy_x_get_y',
          discountValue: 20,
          productIds: [productId],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      offerId = res.body.data._id;
    });

    it('6.5 should get available offers', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/offers/available')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('6.6 should award points (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/points-transactions/award')
        .set('Cookie', adminCookies)
        .send({
          userId: customerId,
          points: 100,
          reason: 'Comprehensive test reward',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('6.7 should get points balance', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/points-transactions/balance')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.balance).toBeGreaterThanOrEqual(100);
    });

    it('6.8 should redeem points', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/points-transactions/redeem')
        .set('Cookie', customerCookies)
        .send({ points: 50 })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('6.9 should get referral code', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/referrals/my-code')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('code');
    });
  });

  describe('7. Dispute & Return Tests', () => {
    it('7.1 should create dispute (customer)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/disputes')
        .set('Cookie', customerCookies)
        .send({
          orderId,
          type: 'other',
          description: 'Test dispute for comprehensive testing',
          priority: 'medium',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      disputeId = res.body.data._id;
    });

    it('7.2 should get my disputes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/disputes/my')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('7.3 should add message to dispute', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/disputes/${disputeId}/messages`)
        .set('Cookie', customerCookies)
        .send({ message: 'Additional information about the dispute' })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('7.4 should resolve dispute (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/disputes/admin/${disputeId}/resolve`)
        .set('Cookie', adminCookies)
        .send({
          resolution: 'Test resolution',
          action: 'no_action',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('7.5 should create return request (customer)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/returns')
        .set('Cookie', customerCookies)
        .send({
          orderId,
          reason: 'defective',
          description: 'Product is defective',
          returnMethod: 'courier_pickup',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      returnId = res.body.data._id;
    });

    it('7.6 should approve return (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/returns/${returnId}/approve`)
        .set('Cookie', storeOwnerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('7.7 should get my returns', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/returns/my')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('8. Analytics Tests', () => {
    it('8.1 should track page view event', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/analytics/track')
        .set('Cookie', customerCookies)
        .send({
          type: 'page_view',
          data: { page: '/products', title: 'Products' },
          sessionId: 'comp-test-session',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('8.2 should track product view event', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/analytics/track')
        .set('Cookie', customerCookies)
        .send({
          type: 'product_view',
          data: { productId, productName: 'Test Product' },
          sessionId: 'comp-test-session',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('8.3 should get my activity', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/my-activity')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('8.4 should get dashboard metrics (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/dashboard')
        .set('Cookie', storeOwnerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('8.5 should get dashboard metrics (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/analytics/dashboard')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('9. Notification Tests', () => {
    it('9.1 should get my notifications', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications/my')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('9.2 should mark notification as read', async () => {
      const notifs = await request(app.getHttpServer())
        .get('/api/notifications/my')
        .set('Cookie', customerCookies);

      if (notifs.body.data.length > 0) {
        const notifId = notifs.body.data[0]._id;
        const res = await request(app.getHttpServer())
          .put(`/api/notifications/${notifId}/read`)
          .set('Cookie', customerCookies)
          .expect(200);

        expect(res.body.success).toBe(true);
      }
    });

    it('9.3 should get unread count', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications/unread-count')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('count');
    });
  });

  describe('10. Error Handling Tests', () => {
    it('10.1 should return 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(404);
    });

    it('10.2 should return 400 for invalid ObjectId', async () => {
      await request(app.getHttpServer())
        .get('/api/products/invalid-id')
        .expect(400);
    });

    it('10.3 should return 401 for unauthorized access', async () => {
      await request(app.getHttpServer())
        .get('/api/orders/my')
        .expect(401);
    });

    it('10.4 should return 403 for forbidden access', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/accounts')
        .set('Cookie', customerCookies)
        .expect(403);
    });

    it('10.5 should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Cookie', storeOwnerCookies)
        .send({ name: 'Incomplete Product' })
        .expect(400);
    });

    it('10.6 should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          phoneNumber: '+963999999999',
          password: 'Test@123456',
          email: 'invalid-email',
          role: 'customer',
        })
        .expect(400);
    });

    it('10.7 should handle duplicate entries', async () => {
      await request(app.getHttpServer())
        .post('/api/categories')
        .set('Cookie', storeOwnerCookies)
        .send({
          name: 'Test Category Comprehensive',
          nameAr: 'فئة اختبار شاملة',
        })
        .expect(400);
    });
  });

  describe('11. Performance & Edge Cases', () => {
    it('11.1 should handle large pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .query({ page: 1, limit: 100 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.meta).toHaveProperty('totalPages');
    });

    it('11.2 should handle empty results', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .query({ search: 'NonExistentProductXYZ123' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it('11.3 should handle concurrent cart updates', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/api/cart/items')
            .set('Cookie', customerCookies)
            .send({ productId, quantity: 1 })
        );
      }

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(0);
    });

    it('11.4 should handle special characters in search', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .query({ search: '@#$%^&*()' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('11.5 should handle date range filters', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const res = await request(app.getHttpServer())
        .get('/api/orders/my')
        .set('Cookie', customerCookies)
        .query({ startDate, endDate })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('11.6 should handle multiple filters combined', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .query({
          categoryId,
          minPrice: 50,
          maxPrice: 200,
          search: 'Test',
          page: 1,
          limit: 10,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
