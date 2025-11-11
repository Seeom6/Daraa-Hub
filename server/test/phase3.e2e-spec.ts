import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

/**
 * Phase 3: Courier Management System (E2E Tests)
 * 
 * Test Coverage:
 * 1. Courier Profile Management (5 tests)
 * 2. Courier Delivery Management (6 tests)
 * 3. Courier Earnings (2 tests)
 * 4. Admin Courier Management (6 tests)
 * 5. Cash Payment on Delivery (2 tests)
 * 
 * Total: 21 E2E tests
 */
describe('Phase 3: Courier Management System (E2E)', () => {
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
  let cashOrderId: string;
  let paymentId: string;
  let cashPaymentId: string;

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

    // Login as customer
    const customerLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234571',
        password: 'Admin@123456',
      });

    const customerCookies = customerLoginResponse.headers['set-cookie'];
    customerCookie = Array.isArray(customerCookies) ? customerCookies : [customerCookies];

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
    storeOwnerCookie = Array.isArray(storeOwnerCookies) ? storeOwnerCookies : [storeOwnerCookies];

    // Get store owner profile ID (which is the storeId)
    const storeOwnerMeResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', storeOwnerCookie);

    if (storeOwnerMeResponse.body.data && storeOwnerMeResponse.body.data.profileId) {
      storeId = storeOwnerMeResponse.body.data.profileId;
    } else {
      throw new Error('Failed to get store owner profileId');
    }

    // Get a product (use any available product, not just from this store)
    const productsResponse = await request(app.getHttpServer())
      .get('/api/products')
      .set('Cookie', customerCookie);

    if (productsResponse.body.data && productsResponse.body.data.length > 0) {
      productId = productsResponse.body.data[0]._id;
      // Update storeId to match the product's store
      storeId = productsResponse.body.data[0].storeId._id || productsResponse.body.data[0].storeId;
    } else {
      throw new Error('No products found');
    }

    // Login as courier
    const courierLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234570',
        password: 'Admin@123456',
      });

    const courierCookies = courierLoginResponse.headers['set-cookie'];
    courierCookie = Array.isArray(courierCookies) ? courierCookies : [courierCookies];

    // Get courier profile ID from /api/auth/me
    const courierMeResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', courierCookie);

    if (courierMeResponse.body.data && courierMeResponse.body.data.profileId) {
      courierId = courierMeResponse.body.data.profileId;
    } else {
      throw new Error('Failed to get courier profileId');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  // ==================== 1. Courier Profile Management ====================

  describe('1. Courier Profile Management', () => {
    it('1.1 should get courier profile (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/courier/profile')
        .set('Cookie', courierCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(courierId);
      expect(response.body.data.status).toBeDefined();
    });

    it('1.2 should update courier profile (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/courier/profile')
        .set('Cookie', courierCookie)
        .send({
          vehicleType: 'motorcycle',
          vehiclePlateNumber: 'ABC-123',
          vehicleModel: 'Honda CBR',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicleType).toBe('motorcycle');
      expect(response.body.data.vehiclePlateNumber).toBe('ABC-123');
      expect(response.body.data.vehicleModel).toBe('Honda CBR');
    });

    it('1.3 should update courier status to available (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/courier/status')
        .set('Cookie', courierCookie)
        .send({
          status: 'available',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('available');
    });

    it('1.4 should update courier location (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/courier/location')
        .set('Cookie', courierCookie)
        .send({
          coordinates: [36.3119, 33.5138], // Damascus coordinates [longitude, latitude]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.location).toBeDefined();
      expect(response.body.data.location.coordinates).toEqual([36.3119, 33.5138]);
    });

    it('1.5 should get courier earnings (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/courier/earnings')
        .set('Cookie', courierCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalEarnings).toBeDefined();
      expect(response.body.data.todayEarnings).toBeDefined();
    });
  });

  // ==================== 2. Courier Delivery Management ====================

  describe('2. Courier Delivery Management', () => {
    // Create an order first
    beforeAll(async () => {
      // Add item to cart
      await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Cookie', customerCookie)
        .send({
          productId,
          quantity: 2,
        })
        .expect(201);

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
          paymentMethod: 'card',
        })
        .expect(201);

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
    });

    it('2.1 should assign order to courier (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/couriers/assign-order')
        .set('Cookie', adminCookie)
        .send({
          orderId,
          courierId,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courierId).toBe(courierId);
    });

    it('2.2 should accept assigned order (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/courier/orders/${orderId}/accept`)
        .set('Cookie', courierCookie)
        .send({
          notes: 'On my way to pick up',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderStatus).toBe('ready');
    });

    it('2.3 should get active deliveries (Courier)', async () => {
      // First update status to picked_up
      await request(app.getHttpServer())
        .put(`/api/courier/orders/${orderId}/status`)
        .set('Cookie', courierCookie)
        .send({
          status: 'picked_up',
        });

      const response = await request(app.getHttpServer())
        .get('/api/courier/deliveries/active')
        .set('Cookie', courierCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('2.4 should update delivery status to delivering (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/courier/orders/${orderId}/status`)
        .set('Cookie', courierCookie)
        .send({
          status: 'delivering',
          notes: 'On the way to customer',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderStatus).toBe('delivering');
    });

    it('2.5 should update delivery status to delivered (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/courier/orders/${orderId}/status`)
        .set('Cookie', courierCookie)
        .send({
          status: 'delivered',
          notes: 'Delivered successfully',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderStatus).toBe('delivered');
      expect(response.body.data.actualDeliveryTime).toBeDefined();
    });

    it('2.6 should get delivery history (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/courier/deliveries/history')
        .set('Cookie', courierCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  // ==================== 3. Courier Earnings ====================

  describe('3. Courier Earnings', () => {
    it('3.1 should show updated earnings after delivery (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/courier/earnings')
        .set('Cookie', courierCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalEarnings).toBeGreaterThan(0);
      expect(response.body.data.totalDeliveries).toBeGreaterThan(0);
    });

    it('3.2 should update courier status to available after delivery (Courier)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/courier/profile')
        .set('Cookie', courierCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('available');
      expect(response.body.data.totalDeliveries).toBeGreaterThan(0);
    });
  });

  // ==================== 4. Admin Courier Management ====================

  describe('4. Admin Courier Management', () => {
    it('4.1 should get all couriers (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/couriers')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('4.2 should get courier by ID (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/admin/couriers/${courierId}`)
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(courierId);
    });

    it('4.3 should get courier statistics (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/admin/couriers/${courierId}/statistics`)
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalDeliveries).toBeGreaterThan(0);
      expect(response.body.data.totalEarnings).toBeGreaterThan(0);
      expect(response.body.data.rating).toBeDefined();
    });

    it('4.4 should update courier commission rate (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/admin/couriers/${courierId}/commission`)
        .set('Cookie', adminCookie)
        .send({
          commissionRate: 30,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.commissionRate).toBe(30);
    });

    it('4.5 should suspend courier (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/admin/couriers/${courierId}/suspend`)
        .set('Cookie', adminCookie)
        .send({
          reason: 'Test suspension',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isCourierSuspended).toBe(true);
      expect(response.body.data.status).toBe('offline');
    });

    it('4.6 should unsuspend courier (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/admin/couriers/${courierId}/unsuspend`)
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isCourierSuspended).toBe(false);
    });
  });

  // ==================== 5. Cash Payment on Delivery ====================

  describe('5. Cash Payment on Delivery', () => {
    // Create a cash order
    beforeAll(async () => {
      // Clear cart first
      await request(app.getHttpServer())
        .delete('/api/cart/clear')
        .set('Cookie', customerCookie);

      // Add item to cart
      await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Cookie', customerCookie)
        .send({
          productId,
          quantity: 1,
        })
        .expect(201);

      // Create cash order
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
        })
        .expect(201);

      cashOrderId = orderResponse.body.data._id;

      // Wait for payment to be created by event listener
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get payment ID
      const paymentResponse = await request(app.getHttpServer())
        .get(`/api/payments/order/${cashOrderId}`)
        .set('Cookie', customerCookie);

      cashPaymentId = paymentResponse.body.data._id;

      // Update order status to ready
      await request(app.getHttpServer())
        .put(`/api/orders/${cashOrderId}/status`)
        .set('Cookie', storeOwnerCookie)
        .send({ status: 'confirmed' });

      await request(app.getHttpServer())
        .put(`/api/orders/${cashOrderId}/status`)
        .set('Cookie', storeOwnerCookie)
        .send({ status: 'preparing' });

      await request(app.getHttpServer())
        .put(`/api/orders/${cashOrderId}/status`)
        .set('Cookie', storeOwnerCookie)
        .send({ status: 'ready' });

      // Assign to courier
      await request(app.getHttpServer())
        .post('/api/admin/couriers/assign-order')
        .set('Cookie', adminCookie)
        .send({
          orderId: cashOrderId,
          courierId,
        });

      // Accept order
      await request(app.getHttpServer())
        .post(`/api/courier/orders/${cashOrderId}/accept`)
        .set('Cookie', courierCookie)
        .send({});

      // Pick up order
      await request(app.getHttpServer())
        .put(`/api/courier/orders/${cashOrderId}/status`)
        .set('Cookie', courierCookie)
        .send({
          status: 'picked_up',
        });

      // Start delivering
      await request(app.getHttpServer())
        .put(`/api/courier/orders/${cashOrderId}/status`)
        .set('Cookie', courierCookie)
        .send({
          status: 'delivering',
        });
    });

    it('5.1 should have pending payment status before delivery', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/payments/${cashPaymentId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentMethod).toBe('cash');
      expect(response.body.data.status).toBe('pending');
    });

    it('5.2 should auto-confirm cash payment when order is delivered', async () => {
      // Deliver the order
      await request(app.getHttpServer())
        .put(`/api/courier/orders/${cashOrderId}/status`)
        .set('Cookie', courierCookie)
        .send({
          status: 'delivered',
          notes: 'Cash payment received',
        })
        .expect(200);

      // Wait a bit for the event to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check payment status
      const paymentResponse = await request(app.getHttpServer())
        .get(`/api/payments/${cashPaymentId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(paymentResponse.body.success).toBe(true);
      expect(paymentResponse.body.data.status).toBe('completed');
      expect(paymentResponse.body.data.paidAt).toBeDefined();

      // Check order payment status
      const orderResponse = await request(app.getHttpServer())
        .get(`/api/orders/${cashOrderId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(orderResponse.body.success).toBe(true);
      expect(orderResponse.body.data.paymentStatus).toBe('paid');
    });
  });
});

