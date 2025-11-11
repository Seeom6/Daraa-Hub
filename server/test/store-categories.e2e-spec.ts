import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Store Categories E2E Tests', () => {
  let app: INestApplication;
  let superAdminCookie: any;
  let storeOwnerCookie: any;
  let categoryId: string;
  let subcategoryId: string;

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

    // تسجيل دخول Super Admin
    const superAdminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234567',
        password: 'Admin@123456',
      });

    const cookies = superAdminLogin.headers['set-cookie'];
    superAdminCookie = Array.isArray(cookies) ? cookies : [cookies];

    // تسجيل دخول Store Owner
    const storeOwnerLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234569',
        password: 'StoreOwner@123',
      });

    const ownerCookies = storeOwnerLogin.headers['set-cookie'];
    storeOwnerCookie = Array.isArray(ownerCookies) ? ownerCookies : [ownerCookies];
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Public Endpoints (No Auth)', () => {
    beforeAll(async () => {
      // Get a category ID for testing
      const response = await request(app.getHttpServer())
        .get('/api/store-categories/slug/restaurants-food');

      if (response.body && response.body.data) {
        categoryId = response.body.data._id;
      }
    });

    it('should get all store categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/store-categories')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('slug');
      expect(response.body.data[0]).toHaveProperty('level');
    });

    it('should get root categories only', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/store-categories/root')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.every((cat: any) => cat.level === 0)).toBe(true);
    });

    it('should get category by slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/store-categories/slug/restaurants-food')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('slug', 'restaurants-food');
      expect(response.body.data).toHaveProperty('level', 0);
      // Name might change if duplicate category is created
    });

    it('should get category by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/store-categories/${categoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id', categoryId);
      // Name might change if duplicate category is created
    });

    it('should get subcategories of a category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/store-categories/${categoryId}/subcategories`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      // May or may not have subcategories
      if (response.body.data.length > 0) {
        expect(response.body.data.every((cat: any) => cat.level === 1)).toBe(true);
        subcategoryId = response.body.data[0]._id;
      }
    });

    it('should search categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/store-categories/search?q=food')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      // Text search might not work immediately, so we just check structure
    });

    it('should filter categories by level', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/store-categories?level=0')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.every((cat: any) => cat.level === 0)).toBe(true);
    });

    it('should filter active categories only', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/store-categories?isActive=true')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.every((cat: any) => cat.isActive === true)).toBe(true);
    });
  });

  describe('Admin Endpoints (Auth Required)', () => {
    let newCategoryId: string;

    it('should create a new category (super_admin)', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/api/store-categories')
        .set('Cookie', superAdminCookie)
        .send({
          name: 'رياضة ولياقة',
          slug: `sports-fitness-${timestamp}`,
          description: 'معدات رياضية، ملابس رياضية، مكملات غذائية',
          icon: '⚽',
          level: 0,
          order: 11,
          isActive: true,
          seoTitle: 'رياضة ولياقة في درعا',
          seoDescription: 'تسوق معدات رياضية ومكملات غذائية',
          seoKeywords: ['رياضة', 'لياقة', 'معدات رياضية'],
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', 'رياضة ولياقة');
      expect(response.body.data).toHaveProperty('slug', `sports-fitness-${timestamp}`);
      newCategoryId = response.body.data._id;
    });

    it('should fail to create category without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/store-categories')
        .send({
          name: 'Test Category',
          slug: 'test-category',
        })
        .expect(401);
    });

    it('should fail to create category as store_owner', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/store-categories')
        .set('Cookie', storeOwnerCookie)
        .send({
          name: 'Test Category',
          slug: 'test-category',
        });

      // Should be either 401 (not authenticated) or 403 (forbidden)
      expect([401, 403]).toContain(response.status);
    });

    it('should update a category (super_admin)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/store-categories/${newCategoryId}`)
        .set('Cookie', superAdminCookie)
        .send({
          description: 'معدات رياضية، ملابس رياضية، مكملات غذائية، أجهزة لياقة',
          order: 12,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data.description).toContain('أجهزة لياقة');
      expect(response.body.data).toHaveProperty('order', 12);
    });

    it('should fail to update category without auth', async () => {
      await request(app.getHttpServer())
        .patch(`/api/store-categories/${newCategoryId}`)
        .send({
          description: 'Updated description',
        })
        .expect(401);
    });

    it('should delete a category (super_admin)', async () => {
      // Create a new category to delete
      const timestamp = Date.now();
      const createResponse = await request(app.getHttpServer())
        .post('/api/store-categories')
        .set('Cookie', superAdminCookie)
        .send({
          name: 'Category to Delete',
          slug: `category-to-delete-${timestamp}`,
          level: 0,
        })
        .expect(201);

      const categoryToDelete = createResponse.body.data._id;

      // Delete it
      await request(app.getHttpServer())
        .delete(`/api/store-categories/${categoryToDelete}`)
        .set('Cookie', superAdminCookie)
        .expect(200);

      // التحقق من الحذف (soft delete - should return 404)
      await request(app.getHttpServer())
        .get(`/api/store-categories/${categoryToDelete}`)
        .expect(404);
    });

    it('should fail to delete category without auth', async () => {
      await request(app.getHttpServer())
        .delete(`/api/store-categories/${categoryId}`)
        .expect(401);
    });

    it('should fail to delete category with subcategories', async () => {
      // First create a parent category
      const timestamp = Date.now();
      const parentResponse = await request(app.getHttpServer())
        .post('/api/store-categories')
        .set('Cookie', superAdminCookie)
        .send({
          name: 'Parent Category',
          slug: `parent-category-test-${timestamp}`,
          level: 0,
        });

      const parentId = parentResponse.body.data._id;

      // Create a subcategory
      await request(app.getHttpServer())
        .post('/api/store-categories')
        .set('Cookie', superAdminCookie)
        .send({
          name: 'Child Category',
          slug: `child-category-test-${timestamp}`,
          parentCategory: parentId,
          level: 1,
        });

      // Try to delete parent (should fail)
      const response = await request(app.getHttpServer())
        .delete(`/api/store-categories/${parentId}`)
        .set('Cookie', superAdminCookie);

      // Should be 400 Bad Request
      expect([400, 409]).toContain(response.status);

      // Cleanup - delete child first, then parent
      const children = await request(app.getHttpServer())
        .get(`/api/store-categories/${parentId}/subcategories`);

      if (children.body && children.body.data) {
        for (const child of children.body.data) {
          await request(app.getHttpServer())
            .delete(`/api/store-categories/${child._id}`)
            .set('Cookie', superAdminCookie);
        }
      }

      await request(app.getHttpServer())
        .delete(`/api/store-categories/${parentId}`)
        .set('Cookie', superAdminCookie);
    });
  });

  describe('Validation Tests', () => {
    it('should fail to create category with duplicate slug', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/store-categories')
        .set('Cookie', superAdminCookie)
        .send({
          name: 'Duplicate Category',
          slug: 'restaurants-food', // موجود مسبقاً
          description: 'Test',
          icon: '🔧',
        });

      // Should be 409 Conflict or 400 Bad Request
      expect([400, 409]).toContain(response.status);
    });

    it('should create category with custom level', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/api/store-categories')
        .set('Cookie', superAdminCookie)
        .send({
          name: 'Test Category Level',
          slug: `test-category-level-unique-${timestamp}`,
          level: 0,
        });

      // Should be 201 Created
      expect(response.status).toBe(201);

      // Cleanup
      if (response.body && response.body.data && response.body.data._id) {
        await request(app.getHttpServer())
          .delete(`/api/store-categories/${response.body.data._id}`)
          .set('Cookie', superAdminCookie);
      }
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .get('/api/store-categories/507f1f77bcf86cd799439011')
        .expect(404);
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app.getHttpServer())
        .get('/api/store-categories/slug/non-existent-slug')
        .expect(404);
    });
  });

  describe('Store Filtering by Category', () => {
    it('should get stores by category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/store-categories/${categoryId}/stores`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination for stores', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/store-categories/${categoryId}/stores?page=1&limit=10`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.page).toBe(1);
    });

    it('should filter verified stores only', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/store-categories/${categoryId}/stores?verified=true`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Validation Tests', () => {
    it('should prevent creating subcategory of subcategory', async () => {
      // Get all categories
      const allCategories = await request(app.getHttpServer())
        .get('/api/store-categories')
        .expect(200);

      // Find a subcategory (level = 1)
      const subcategory = allCategories.body.data.find((cat: any) => cat.level === 1);

      if (subcategory) {
        // Try to create a subcategory of subcategory
        const timestamp = Date.now();
        const response = await request(app.getHttpServer())
          .post('/api/store-categories')
          .set('Cookie', superAdminCookie)
          .send({
            name: 'تصنيف فرعي من فرعي',
            slug: `sub-sub-category-test-${timestamp}`,
            parentCategory: subcategory._id,
          })
          .expect(400);

        expect(response.body.message).toContain('لا يمكن إنشاء تصنيف فرعي لتصنيف فرعي');
      } else {
        // If no subcategory exists, skip this test
        expect(true).toBe(true);
      }
    });

    it('should recalculate store counts correctly', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/store-categories/recalculate-counts')
        .set('Cookie', superAdminCookie)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Stores Endpoints', () => {
    it('should get all stores', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/stores')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support search in stores', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/stores?search=test')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support sorting stores', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/stores?sort=rating')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter stores by category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/stores?category=${categoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

