import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

/**
 * Phase 4: Reviews & Ratings System (E2E Tests)
 *
 * Test Coverage:
 * 1. Product Reviews (6 tests)
 * 2. Store Reviews (4 tests)
 * 3. Courier Reviews (4 tests)
 * 4. Review Management (5 tests)
 * 5. Admin Moderation (3 tests)
 *
 * Total: 22 E2E tests
 */
describe('Phase 4: Reviews & Ratings System (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  let adminCookie: string;
  let customerCookie: string;
  let storeOwnerCookie: string;
  let courierCookie: string;
  let customerId: string;
  let storeId: string;
  let courierId: string;
  let productId: string;
  let orderId: string;
  let productReviewId: string;
  let storeReviewId: string;
  let courierReviewId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Add cookie parser middleware
    app.use(cookieParser());

    // Set global prefix
    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());

    // Clean up test data from previous runs
    await connection.collection('reviews').deleteMany({});
    await connection.collection('carts').deleteMany({});
    await connection.collection('orders').deleteMany({ orderNumber: /^ORD-/ });
    await connection.collection('payments').deleteMany({});

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234567',
        password: 'Admin@123456',
      });

    const adminCookies = adminLoginResponse.headers['set-cookie'];
    adminCookie = Array.isArray(adminCookies) ? adminCookies : [adminCookies];

    // Login as customer 1
    const customerLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234571',
        password: 'Admin@123456',
      });

    const customerCookies = customerLoginResponse.headers['set-cookie'];
    customerCookie = Array.isArray(customerCookies)
      ? customerCookies
      : [customerCookies];

    // Get customer profile ID
    const customerMeResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', customerCookie);

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

    const storeOwnerCookies = storeOwnerLoginResponse.headers['set-cookie'];
    storeOwnerCookie = Array.isArray(storeOwnerCookies)
      ? storeOwnerCookies
      : [storeOwnerCookies];

    // Get store profile ID
    const storeMeResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', storeOwnerCookie);

    if (storeMeResponse.body.data && storeMeResponse.body.data.profileId) {
      storeId = storeMeResponse.body.data.profileId;
    } else {
      throw new Error('Failed to get store profileId');
    }

    // Login as courier
    const courierLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234570',
        password: 'Admin@123456',
      });

    const courierCookies = courierLoginResponse.headers['set-cookie'];
    courierCookie = Array.isArray(courierCookies)
      ? courierCookies
      : [courierCookies];

    // Get courier profile ID
    const courierMeResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', courierCookie);

    if (courierMeResponse.body.data && courierMeResponse.body.data.profileId) {
      courierId = courierMeResponse.body.data.profileId;
    } else {
      throw new Error('Failed to get courier profileId');
    }

    // Get existing product
    const productsResponse = await request(app.getHttpServer())
      .get('/api/products')
      .query({ page: 1, limit: 1 });

    if (
      productsResponse.body.data &&
      Array.isArray(productsResponse.body.data) &&
      productsResponse.body.data.length > 0
    ) {
      productId = productsResponse.body.data[0]._id;
    } else {
      throw new Error('No products found for testing');
    }

    // Create an order for verified purchase reviews
    // Add product to cart
    await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Cookie', customerCookie)
      .send({
        productId,
        quantity: 1,
      });

    // Create order
    const orderResponse = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({
        storeId,
        deliveryAddress: {
          fullName: 'Test Customer',
          phoneNumber: '+963991234571',
          fullAddress: 'Test Street, Damascus',
          city: 'Damascus',
          location: {
            type: 'Point',
            coordinates: [36.3119, 33.5138],
          },
        },
        paymentMethod: 'cash',
      });

    expect(orderResponse.status).toBe(201);
    orderId = orderResponse.body.data._id;

    // Update order status to ready (Store Owner)
    await request(app.getHttpServer())
      .put(`/api/orders/${orderId}/status`)
      .set('Cookie', storeOwnerCookie)
      .send({ status: 'confirmed' });

    await request(app.getHttpServer())
      .put(`/api/orders/${orderId}/status`)
      .set('Cookie', storeOwnerCookie)
      .send({ status: 'preparing' });

    await request(app.getHttpServer())
      .put(`/api/orders/${orderId}/status`)
      .set('Cookie', storeOwnerCookie)
      .send({ status: 'ready' });

    // Assign courier to order (Admin)
    await request(app.getHttpServer())
      .post(`/api/admin/couriers/assign-order`)
      .set('Cookie', adminCookie)
      .send({
        orderId,
        courierId,
      });

    // Accept order (Courier)
    await request(app.getHttpServer())
      .post(`/api/courier/orders/${orderId}/accept`)
      .set('Cookie', courierCookie)
      .send({});

    // Update delivery status to delivered (Courier)
    await request(app.getHttpServer())
      .put(`/api/courier/orders/${orderId}/status`)
      .set('Cookie', courierCookie)
      .send({
        status: 'delivered',
      });
  });

  afterAll(async () => {
    // Clean up test data
    await connection.collection('reviews').deleteMany({});
    await connection.collection('carts').deleteMany({});
    await connection.collection('orders').deleteMany({ orderNumber: /^ORD-/ });
    await connection.collection('payments').deleteMany({});

    await app.close();
  });

  // ==================== 1. Product Reviews ====================
  describe('1. Product Reviews', () => {
    it('1.1 should create a product review with verified purchase (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .set('Cookie', customerCookie)
        .send({
          targetType: 'product',
          targetId: productId,
          orderId: orderId,
          rating: 5,
          title: 'Excellent product!',
          comment: 'Very satisfied with this purchase. Highly recommended!',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.isVerifiedPurchase).toBe(true);
      expect(response.body.data.status).toBe('approved');

      productReviewId = response.body.data._id;
    });

    it('1.2 should not allow duplicate review for same order (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .set('Cookie', customerCookie)
        .send({
          targetType: 'product',
          targetId: productId,
          orderId: orderId,
          rating: 4,
          title: 'Another review',
          comment: 'Trying to review again',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already reviewed');
    });

    it('1.3 should get product reviews', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/reviews/target/product/${productId}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(response.body.data.reviews.length).toBeGreaterThan(0);
      expect(response.body.data.averageRating).toBeGreaterThan(0);
      expect(response.body.data.ratingDistribution).toBeDefined();
    });

    it('1.4 should update own review (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/reviews/${productReviewId}`)
        .set('Cookie', customerCookie)
        .send({
          rating: 4,
          title: 'Updated: Good product',
          comment: 'Updated my review after using it more.',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(4);
      expect(response.body.data.isEdited).toBe(true);
    });

    it('1.5 should mark review as helpful', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/reviews/${productReviewId}/helpful`)
        .set('Cookie', storeOwnerCookie)
        .send({
          helpful: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.helpfulCount).toBeGreaterThan(0);
    });

    it('1.6 should add store response to product review (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/reviews/${productReviewId}/response`)
        .set('Cookie', storeOwnerCookie)
        .send({
          message: 'Thank you for your feedback! We appreciate your business.',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.storeResponse).toBeDefined();
      expect(response.body.data.storeResponse.message).toContain('Thank you');
    });
  });

  // ==================== 2. Store Reviews ====================
  describe('2. Store Reviews', () => {
    it('2.1 should create a store review with verified purchase (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .set('Cookie', customerCookie)
        .send({
          targetType: 'store',
          targetId: storeId,
          orderId: orderId,
          rating: 5,
          title: 'Great store!',
          comment: 'Fast shipping and excellent customer service.',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.isVerifiedPurchase).toBe(true);

      storeReviewId = response.body.data._id;
    });

    it('2.2 should get store reviews', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/reviews/target/store/${storeId}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(response.body.data.reviews.length).toBeGreaterThan(0);
    });

    it('2.3 should filter reviews by rating', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/reviews/target/store/${storeId}`)
        .query({ page: 1, limit: 10, rating: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(response.body.data.reviews.every((r: any) => r.rating === 5)).toBe(
        true,
      );
    });

    it('2.4 should add store response to store review (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/reviews/${storeReviewId}/response`)
        .set('Cookie', storeOwnerCookie)
        .send({
          message:
            'Thank you for choosing our store! We look forward to serving you again.',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.storeResponse).toBeDefined();
    });
  });

  // ==================== 3. Courier Reviews ====================
  describe('3. Courier Reviews', () => {
    it('3.1 should create a courier review with verified purchase (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .set('Cookie', customerCookie)
        .send({
          targetType: 'courier',
          targetId: courierId,
          orderId: orderId,
          rating: 5,
          title: 'Professional courier!',
          comment: 'Very polite and delivered on time.',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.isVerifiedPurchase).toBe(true);

      courierReviewId = response.body.data._id;
    });

    it('3.2 should get courier reviews', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/reviews/target/courier/${courierId}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(response.body.data.reviews.length).toBeGreaterThan(0);
    });

    it('3.3 should filter verified purchase reviews only', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/reviews/target/courier/${courierId}`)
        .query({ page: 1, limit: 10, verifiedOnly: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(
        response.body.data.reviews.every(
          (r: any) => r.isVerifiedPurchase === true,
        ),
      ).toBe(true);
    });

    it('3.4 should not allow store response to courier review (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/reviews/${courierReviewId}/response`)
        .set('Cookie', storeOwnerCookie)
        .send({
          message: 'Trying to respond to courier review',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'Cannot respond to courier reviews',
      );
    });
  });

  // ==================== 4. Review Management ====================
  describe('4. Review Management', () => {
    it('4.1 should get customer own reviews (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reviews/customer/my-reviews')
        .set('Cookie', customerCookie)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(response.body.data.reviews.length).toBeGreaterThanOrEqual(3); // product, store, courier
    });

    it('4.2 should get review by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/reviews/${productReviewId}`)
        .set('Cookie', customerCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(productReviewId);
    });

    it('4.3 should not allow updating other customer review (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/reviews/${productReviewId}`)
        .set('Cookie', storeOwnerCookie)
        .send({
          rating: 1,
          comment: 'Trying to update someone else review',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });

    it('4.4 should not allow deleting other customer review (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/reviews/${productReviewId}`)
        .set('Cookie', storeOwnerCookie);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });

    it('4.5 should delete own review (Customer)', async () => {
      // Create a new review to delete (without orderId)
      const createResponse = await request(app.getHttpServer())
        .post('/api/reviews')
        .set('Cookie', customerCookie)
        .send({
          targetType: 'product',
          targetId: productId,
          rating: 3,
          title: 'Average product',
          comment: 'It is okay',
        });

      expect(createResponse.status).toBe(201);
      const reviewToDelete = createResponse.body.data._id;

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/reviews/${reviewToDelete}`)
        .set('Cookie', customerCookie);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });

  // ==================== 5. Admin Moderation ====================
  describe('5. Admin Moderation', () => {
    it('5.1 should get all reviews (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/reviews')
        .set('Cookie', adminCookie)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(response.body.data.reviews.length).toBeGreaterThan(0);
    });

    it('5.2 should filter reviews by status (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/reviews')
        .set('Cookie', adminCookie)
        .query({ page: 1, limit: 10, status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(
        response.body.data.reviews.every((r: any) => r.status === 'approved'),
      ).toBe(true);
    });

    it('5.3 should moderate review (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/admin/reviews/${productReviewId}/moderate`)
        .set('Cookie', adminCookie)
        .send({
          status: 'approved',
          moderationNotes: 'Review is appropriate and helpful',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.moderationNotes).toBeDefined();
    });
  });
});
