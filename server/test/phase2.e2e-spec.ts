import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

/**
 * Phase 2: Order Management System (E2E Tests)
 * 
 * Test Coverage:
 * 1. Cart Module (5 tests)
 * 2. Order Module (8 tests)
 * 3. Payment Module (6 tests)
 * 4. Order + Payment Integration (4 tests)
 * 
 * Total: 23 E2E tests
 */
describe('Phase 2: Order Management System (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  let adminCookie: string[];
  let customerCookie: string[];
  let storeOwnerCookie: string[];
  let customerId: string;
  let storeId: string;
  let productId: string;
  let cartId: string;
  let orderId: string;
  let paymentId: string;

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
    await connection.collection('notifications').deleteMany({ type: { $in: ['order', 'payment'] } });

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

    // Get customer user ID
    const customerMeResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', customerCookie);

    if (customerMeResponse.body.data && customerMeResponse.body.data.userId) {
      customerId = customerMeResponse.body.data.userId;
    } else {
      throw new Error(`Failed to get customer userId. Response: ${JSON.stringify(customerMeResponse.body)}`);
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

    // Get store owner profile ID
    const storeOwnerMeResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', storeOwnerCookie);

    if (storeOwnerMeResponse.body.data && storeOwnerMeResponse.body.data.profileId) {
      storeId = storeOwnerMeResponse.body.data.profileId;
    } else {
      throw new Error('Failed to get store owner profileId');
    }

    // Get an existing product for testing
    const existingProduct = await connection.collection('products').findOne({ storeId });
    if (existingProduct) {
      productId = existingProduct._id.toString();
    } else {
      throw new Error('No products found for testing. Please run Phase 1 tests first.');
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await connection.collection('carts').deleteMany({});
    await connection.collection('orders').deleteMany({ orderNumber: /^ORD-/ });
    await connection.collection('payments').deleteMany({});
    await connection.collection('notifications').deleteMany({ type: { $in: ['order', 'payment'] } });

    // Reset inventory to initial state
    // First, ensure all products have inventory
    const products = await connection.collection('products').find({}).toArray();
    for (const product of products) {
      const existing = await connection.collection('inventories').findOne({ productId: product._id });
      if (!existing) {
        await connection.collection('inventories').insertOne({
          productId: product._id,
          storeId: product.storeId,
          quantity: 100,
          reservedQuantity: 0,
          availableQuantity: 100,
          lowStockThreshold: 10,
          reorderPoint: 5,
          reorderQuantity: 20,
          movements: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Then reset all inventories
    await connection.collection('inventories').updateMany(
      {},
      { $set: { quantity: 100, reservedQuantity: 0, availableQuantity: 100 } }
    );

    await app.close();
  });

  // ============================================
  // 1. Cart Module Tests (5 tests)
  // ============================================
  describe('1. Cart Module', () => {
    it('1.1 should add item to cart (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Cookie', customerCookie)
        .send({
          productId: productId,
          quantity: 2,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items.length).toBeGreaterThan(0);
      cartId = response.body.data._id;
    });

    it('1.2 should get cart (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cart')
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('1.3 should update cart item quantity (Customer)', async () => {
      // Clear cart first to ensure clean state
      await request(app.getHttpServer())
        .delete('/api/cart')
        .set('Cookie', customerCookie);

      // Add item
      const addResponse = await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Cookie', customerCookie)
        .send({
          productId: productId,
          quantity: 2,
        })
        .expect(201);

      expect(addResponse.body.success).toBe(true);

      // Get cart to verify item was added
      const cartResponse = await request(app.getHttpServer())
        .get('/api/cart')
        .set('Cookie', customerCookie)
        .expect(200);

      expect(cartResponse.body.data.items.length).toBe(1);

      // Extract productId (it may be populated as an object)
      const rawProductId = cartResponse.body.data.items[0].productId;
      const actualProductId = typeof rawProductId === 'object' && rawProductId._id
        ? rawProductId._id
        : rawProductId;

      // Update the quantity
      const response = await request(app.getHttpServer())
        .put(`/api/cart/items/${actualProductId}`)
        .set('Cookie', customerCookie)
        .send({
          quantity: 3,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.some((item: any) => item.quantity === 3)).toBe(true);
    });

    it('1.4 should remove item from cart (Customer)', async () => {
      // Add another item first
      await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Cookie', customerCookie)
        .send({
          productId: productId,
          quantity: 1,
        });

      const response = await request(app.getHttpServer())
        .delete(`/api/cart/items/${productId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('1.5 should clear cart (Customer)', async () => {
      // Add item first
      await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Cookie', customerCookie)
        .send({
          productId: productId,
          quantity: 2,
        });

      const response = await request(app.getHttpServer())
        .delete('/api/cart')
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cleared');
    });
  });

  // ============================================
  // 2. Order Module Tests (8 tests)
  // ============================================
  describe('2. Order Module', () => {
    beforeAll(async () => {
      // Add item to cart for order creation
      await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Cookie', customerCookie)
        .send({
          productId: productId,
          quantity: 2,
        });
    });

    it('2.1 should create order from cart (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Cookie', customerCookie)
        .send({
          storeId: storeId,
          deliveryAddress: {
            fullName: 'Test Customer',
            phoneNumber: '+963991234571',
            fullAddress: 'Test Street, Building 1, Floor 2',
            city: 'Damascus',
            district: 'Mazzeh',
            location: {
              type: 'Point',
              coordinates: [36.1048, 32.6189],
            },
          },
          paymentMethod: 'cash',
          customerNotes: 'Please deliver before 5 PM',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderNumber');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.orderStatus).toBe('pending');
      expect(response.body.data.paymentStatus).toBe('pending');
      orderId = response.body.data._id;
    });

    it('2.2 should get order by ID (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(orderId);
    });

    it('2.3 should get customer orders (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders/my-orders')
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('2.4 should get store orders (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders/store-orders')
        .set('Cookie', storeOwnerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('2.5 should update order status to confirmed (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/orders/${orderId}/status`)
        .set('Cookie', storeOwnerCookie)
        .send({
          status: 'confirmed',
          notes: 'Order confirmed by store',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderStatus).toBe('confirmed');
    });

    it('2.6 should update order status to preparing (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/orders/${orderId}/status`)
        .set('Cookie', storeOwnerCookie)
        .send({
          status: 'preparing',
          notes: 'Order is being prepared',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderStatus).toBe('preparing');
    });

    it('2.7 should update order status to ready (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/orders/${orderId}/status`)
        .set('Cookie', storeOwnerCookie)
        .send({
          status: 'ready',
          notes: 'Order is ready for pickup',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderStatus).toBe('ready');
    });

    it('2.8 should cancel order (Customer)', async () => {
      // Create a new order for cancellation test
      await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Cookie', customerCookie)
        .send({
          productId: productId,
          quantity: 1,
        });

      const createOrderResponse = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Cookie', customerCookie)
        .send({
          storeId: storeId,
          deliveryAddress: {
            fullName: 'Test Customer',
            phoneNumber: '+963991234571',
            fullAddress: 'Test Street, Building 1, Floor 2',
            city: 'Damascus',
            district: 'Mazzeh',
            location: {
              type: 'Point',
              coordinates: [36.1048, 32.6189],
            },
          },
          paymentMethod: 'cash',
        });

      const newOrderId = createOrderResponse.body.data._id;

      const response = await request(app.getHttpServer())
        .put(`/api/orders/${newOrderId}/cancel`)
        .set('Cookie', customerCookie)
        .send({
          reason: 'Changed my mind',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderStatus).toBe('cancelled');
    });
  });

  // ============================================
  // 3. Payment Module Tests (6 tests)
  // ============================================
  describe('3. Payment Module', () => {
    it('3.1 should get payment by order ID (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/payments/order/${orderId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data.orderId).toBe(orderId);
      paymentId = response.body.data._id;
    });

    it('3.2 should get payment by ID (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/payments/${paymentId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(paymentId);
    });

    it('3.3 should get customer payments (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/payments/my-payments')
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('3.4 should get store payments (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/payments/store-payments')
        .set('Cookie', storeOwnerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('3.5 should verify cash payment status is PENDING (Customer)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/payments/${paymentId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.paymentMethod).toBe('cash');
    });

    it('3.6 should get all payments (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/payments')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ============================================
  // 4. Order + Payment Integration Tests (4 tests)
  // ============================================
  describe('4. Order + Payment Integration', () => {
    it('4.1 should verify order has payment record', async () => {
      const orderResponse = await request(app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      const paymentResponse = await request(app.getHttpServer())
        .get(`/api/payments/order/${orderId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(orderResponse.body.data._id).toBe(orderId);
      expect(paymentResponse.body.data.orderId).toBe(orderId);
      expect(orderResponse.body.data.paymentMethod).toBe(paymentResponse.body.data.paymentMethod);
    });

    it('4.2 should verify notifications were sent for order creation', async () => {
      const notifications = await connection
        .collection('notifications')
        .find({
          'data.orderId': orderId,
          type: 'order',
        })
        .toArray();

      expect(notifications.length).toBeGreaterThan(0);
    });

    it('4.3 should verify payment record was created automatically', async () => {
      // Verify payment was created when order was created
      const paymentResponse = await request(app.getHttpServer())
        .get(`/api/payments/order/${orderId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(paymentResponse.body.success).toBe(true);
      expect(paymentResponse.body.data).toBeTruthy();
      expect(paymentResponse.body.data.orderId).toBe(orderId);
      expect(paymentResponse.body.data.status).toBe('pending');
    });

    it('4.4 should confirm cash payment when order is delivered', async () => {
      // Update order status to picked_up
      await request(app.getHttpServer())
        .put(`/api/orders/${orderId}/status`)
        .set('Cookie', storeOwnerCookie)
        .send({
          status: 'picked_up',
          notes: 'Order picked up by courier',
        })
        .expect(200);

      // Update order status to delivering
      await request(app.getHttpServer())
        .put(`/api/orders/${orderId}/status`)
        .set('Cookie', storeOwnerCookie)
        .send({
          status: 'delivering',
          notes: 'Order is on the way',
        })
        .expect(200);

      // Update order status to delivered
      const orderResponse = await request(app.getHttpServer())
        .put(`/api/orders/${orderId}/status`)
        .set('Cookie', storeOwnerCookie)
        .send({
          status: 'delivered',
          notes: 'Order delivered successfully',
        })
        .expect(200);

      expect(orderResponse.body.success).toBe(true);
      expect(orderResponse.body.data.orderStatus).toBe('delivered');

      // Verify payment status changed to completed
      const paymentResponse = await request(app.getHttpServer())
        .get(`/api/payments/${paymentId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(paymentResponse.body.success).toBe(true);
      expect(paymentResponse.body.data.status).toBe('completed');
    });
  });
});

