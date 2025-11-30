import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Phase 1: Store Management & Product Catalog (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  let adminCookie: any;
  let storeOwnerCookie: any;
  let storeOwnerId: string;
  let categoryId: string;
  let productId: string;
  let variantId: string;
  let inventoryId: string;

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
    await connection
      .collection('categories')
      .deleteMany({ slug: /^electronics/ });
    await connection.collection('products').deleteMany({ sku: /^SAMSUNG-S23/ });
    await connection
      .collection('productvariants')
      .deleteMany({ sku: /^SAMSUNG-S23/ });
    await connection.collection('inventories').deleteMany({});

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234567',
        password: 'Admin@123456',
      });

    // Extract cookies - set-cookie returns an array
    const adminCookies = adminLoginResponse.headers['set-cookie'];
    adminCookie = Array.isArray(adminCookies) ? adminCookies : [adminCookies];

    // Login as store owner
    const storeOwnerLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234569',
        password: 'Admin@123456',
      });

    // Extract cookies - set-cookie returns an array
    const storeOwnerCookies = storeOwnerLoginResponse.headers['set-cookie'];
    storeOwnerCookie = Array.isArray(storeOwnerCookies)
      ? storeOwnerCookies
      : [storeOwnerCookies];

    // Get current user to retrieve profileId
    const meResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', storeOwnerCookie);

    if (meResponse.body.data && meResponse.body.data.profileId) {
      storeOwnerId = meResponse.body.data.profileId;
    } else {
      throw new Error('Failed to get profileId from /api/auth/me');
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    // Note: We keep products, categories, and inventories for other phases to use
    // Only delete the variant created in tests
    if (variantId) {
      await connection
        .collection('productvariants')
        .deleteOne({ _id: variantId });
    }

    // Reset inventory to initial state for next phases
    await connection.collection('inventories').updateMany(
      {},
      {
        $set: { quantity: 100, reservedQuantity: 0, availableQuantity: 100 },
      },
    );

    await app.close();
  });

  describe('1. Category Module', () => {
    it('should create a category (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Cookie', adminCookie)
        .send({
          name: 'Electronics',
          slug: 'electronics-test',
          description: 'Electronic devices and accessories',
          isActive: true,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe('Electronics');
      categoryId = response.body.data._id;
    });

    it('should get all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get category tree', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/categories/tree')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get category by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/categories/${categoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(categoryId);
    });

    it('should update category (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/categories/${categoryId}`)
        .set('Cookie', adminCookie)
        .send({
          description: 'Updated description for electronics',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(
        'Updated description for electronics',
      );
    });
  });

  describe('2. Product Module', () => {
    it('should create a product (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Cookie', storeOwnerCookie)
        .send({
          storeId: storeOwnerId,
          categoryId: categoryId,
          name: 'Samsung Galaxy S23',
          slug: 'samsung-galaxy-s23-test',
          description: 'Latest Samsung flagship phone',
          sku: 'SAMSUNG-S23-001',
          price: 5000000,
          compareAtPrice: 5500000,
          status: 'active',
          hasVariants: false,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe('Samsung Galaxy S23');
      productId = response.body.data._id;
    });

    it('should get all products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get product by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(productId);
    });

    it('should update product (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/products/${productId}`)
        .set('Cookie', storeOwnerCookie)
        .send({
          price: 4800000,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(4800000);
    });

    it('should create product variant (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/products/${productId}/variants`)
        .set('Cookie', storeOwnerCookie)
        .send({
          name: 'Black 256GB',
          sku: 'SAMSUNG-S23-BLACK-256',
          price: 5000000,
          attributes: {
            color: 'Black',
            storage: '256GB',
          },
          stock: 10,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      variantId = response.body.data._id;
    });

    it('should get product variants', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products/${productId}/variants`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('3. Inventory Module', () => {
    it('should create inventory (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/inventory')
        .set('Cookie', storeOwnerCookie)
        .send({
          productId: productId,
          storeId: storeOwnerId,
          quantity: 50,
          lowStockThreshold: 10,
          reorderPoint: 5,
          reorderQuantity: 20,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.quantity).toBe(50);
      inventoryId = response.body.data._id;
    });

    it('should get inventory by product', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/inventory/product/${productId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.availableQuantity).toBeGreaterThan(0);
    });

    it('should add stock (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/inventory/${inventoryId}/add-stock`)
        .set('Cookie', storeOwnerCookie)
        .send({
          type: 'in',
          quantity: 20,
          reason: 'Restocking',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(70);
    });

    it('should remove stock (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/inventory/${inventoryId}/remove-stock`)
        .set('Cookie', storeOwnerCookie)
        .send({
          type: 'out',
          quantity: 5,
          reason: 'Sold',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(65);
    });
  });

  describe('4. Store Settings Module', () => {
    it('should get store settings (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/store-settings/${storeOwnerId}`)
        .set('Cookie', storeOwnerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('businessHours');
    });

    it('should update store settings (Store Owner)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/store-settings/${storeOwnerId}`)
        .set('Cookie', storeOwnerCookie)
        .send({
          minOrderAmount: 100000,
          defaultShippingFee: 5000,
          allowCashOnDelivery: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.minOrderAmount).toBe(100000);
    });

    it('should get public store settings', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/store-settings/${storeOwnerId}/public`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('businessHours');
    });

    it('should check if store is open', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/store-settings/${storeOwnerId}/is-open`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isOpen');
    });
  });
});
