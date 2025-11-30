import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Phase 6: Dispute & Return Management (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  let adminCookies: string[];
  let customerCookies: string[];
  let storeOwnerCookies: string[];
  let customerId: string;
  let storeId: string;
  let orderId: string;
  let productId: string;
  let disputeId: string;
  let returnId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.setGlobalPrefix('api');

    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());

    // Cleanup: Delete any existing test data
    await connection.collection('disputes').deleteMany({});
    await connection.collection('returns').deleteMany({});

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

    if (
      storeOwnerMeResponse.body.data &&
      storeOwnerMeResponse.body.data.profileId
    ) {
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

    // Add product to cart first
    await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Cookie', customerCookies)
      .send({
        productId,
        quantity: 2,
      });

    // Create an order for testing
    const orderResponse = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Cookie', customerCookies)
      .send({
        storeId,
        deliveryAddress: {
          fullName: 'Test Customer',
          phoneNumber: '+963991234571',
          fullAddress: 'Test Street, Building 1, Floor 2',
          city: 'Daraa',
          district: 'Daraa Center',
          location: {
            type: 'Point',
            coordinates: [36.1048, 32.6189],
          },
        },
        paymentMethod: 'cash',
        customerNotes: 'Test order for Phase 6',
      });

    if (orderResponse.body.success && orderResponse.body.data) {
      orderId = orderResponse.body.data._id;
    } else {
      throw new Error('Failed to create order');
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    if (disputeId) {
      await connection.collection('disputes').deleteOne({ _id: disputeId });
    }
    if (returnId) {
      await connection.collection('returns').deleteOne({ _id: returnId });
    }

    await app.close();
  });

  describe('1. Dispute Module', () => {
    it('1.1 should create a dispute (customer)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/disputes')
        .set('Cookie', customerCookies)
        .send({
          orderId,
          reportedAgainst: storeId,
          type: 'late_delivery',
          priority: 'medium',
          description: 'Order is taking too long to deliver',
          evidence: [
            {
              type: 'image',
              url: 'https://example.com/evidence.jpg',
            },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.type).toBe('late_delivery');
      disputeId = res.body.data._id;
    });

    it('1.2 should get my disputes (customer)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/disputes/my')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('1.3 should get dispute by ID (customer)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/disputes/${disputeId}`)
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(disputeId);
    });

    it('1.4 should add message to dispute (customer)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/disputes/${disputeId}/messages`)
        .set('Cookie', customerCookies)
        .send({
          message: 'I need this resolved urgently',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.messages.length).toBeGreaterThan(0);
    });

    it('1.5 should get all disputes (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/disputes/admin/all')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('1.6 should update dispute (admin)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/disputes/admin/${disputeId}`)
        .set('Cookie', adminCookies)
        .send({
          status: 'investigating',
          priority: 'high',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('investigating');
    });

    it('1.7 should resolve dispute (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/disputes/admin/${disputeId}/resolve`)
        .set('Cookie', adminCookies)
        .send({
          action: 'compensation',
          amount: 50,
          notes: 'Compensating for delay',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('resolved');
      expect(res.body.data.resolution.action).toBe('compensation');
    });

    it('1.8 should get dispute statistics (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/disputes/admin/statistics')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('resolved');
    });
  });

  describe('2. Return Module', () => {
    it('2.1 should create a return request (customer)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/returns')
        .set('Cookie', customerCookies)
        .send({
          orderId,
          items: [
            {
              productId,
              quantity: 1,
              reason: 'defective',
              detailedReason: 'Product is not working properly',
              images: ['https://example.com/defect.jpg'],
            },
          ],
          returnMethod: 'courier_pickup',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.status).toBe('requested');
      returnId = res.body.data._id;
    });

    it('2.2 should get my returns (customer)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/returns/my')
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('2.3 should get return by ID (customer)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/returns/${returnId}`)
        .set('Cookie', customerCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(returnId);
    });

    it('2.4 should respond to return request (store owner)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/returns/store/${returnId}/respond`)
        .set('Cookie', storeOwnerCookies)
        .send({
          approved: true,
          notes: 'Return approved',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.storeResponse.approved).toBe(true);
    });

    it('2.5 should get all returns (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/returns/admin/all')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('2.6 should mark return as picked up (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/returns/admin/${returnId}/picked-up`)
        .set('Cookie', adminCookies)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('picked_up');
    });

    it('2.7 should mark return as inspected (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/returns/admin/${returnId}/inspected`)
        .set('Cookie', adminCookies)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('inspected');
    });

    it('2.8 should process refund (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/returns/admin/${returnId}/refund`)
        .set('Cookie', adminCookies)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('refunded');
    });

    it('2.9 should get return statistics (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/returns/admin/statistics')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('refunded');
    });
  });
});
