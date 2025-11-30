import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Addresses Module (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  let customerCookie: any;
  let profileId: string;
  let addressId1: string;
  let addressId2: string;

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
    connection = moduleFixture.get<Connection>(getConnectionToken());

    // Clean up test addresses from previous runs
    await connection.collection('addresses').deleteMany({});

    // Login as store owner (has profile)
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phoneNumber: '+963991234569',
        password: 'Admin@123456',
      });

    const cookies = loginResponse.headers['set-cookie'];
    customerCookie = Array.isArray(cookies) ? cookies : [cookies];

    // Get profile ID from /api/auth/me
    const meResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', customerCookie);

    profileId = meResponse.body.data?.profileId;
    if (!profileId) {
      throw new Error(
        'Profile ID not found. Response: ' + JSON.stringify(meResponse.body),
      );
    }
  });

  afterAll(async () => {
    // Cleanup addresses
    await connection.collection('addresses').deleteMany({});
    await app.close();
  });

  describe('1. Create Address', () => {
    it('should create first address as default', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/addresses')
        .set('Cookie', customerCookie)
        .send({
          label: 'المنزل',
          type: 'home',
          fullName: 'أحمد محمد',
          phoneNumber: '+963991234569',
          city: 'دمشق',
          district: 'المزة',
          street: 'شارع الجلاء',
          building: 'مبنى 15',
          floor: '3',
          apartment: '5',
          nearbyLandmark: 'بجانب صيدلية الشفاء',
          deliveryInstructions: 'الرجاء الاتصال قبل الوصول',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.label).toBe('المنزل');
      expect(response.body.data.isDefault).toBe(true); // First address is default
      expect(response.body.data.city).toBe('دمشق');
      addressId1 = response.body.data._id;
    });

    it('should create second address with coordinates', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/addresses')
        .set('Cookie', customerCookie)
        .send({
          label: 'العمل',
          type: 'work',
          fullName: 'أحمد محمد',
          phoneNumber: '+963991234569',
          city: 'دمشق',
          district: 'المهاجرين',
          street: 'شارع بغداد',
          building: 'برج الياسمين',
          latitude: 33.5138,
          longitude: 36.2765,
          deliveryInstructions: 'المدخل الجانبي',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.label).toBe('العمل');
      expect(response.body.data.isDefault).toBe(false); // Not default
      expect(response.body.data.location).toBeDefined();
      expect(response.body.data.location.type).toBe('Point');
      addressId2 = response.body.data._id;
    });

    it('should reject invalid phone number', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/addresses')
        .set('Cookie', customerCookie)
        .send({
          label: 'اختبار',
          fullName: 'اختبار',
          phoneNumber: 'invalid',
          city: 'دمشق',
          street: 'شارع',
        })
        .expect(400);

      // Check that validation error is returned
      expect(response.body.message).toBeDefined();
    });
  });

  describe('2. Get Addresses', () => {
    it('should get all customer addresses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/addresses')
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      // Default should be first
      expect(response.body.data[0].isDefault).toBe(true);
    });

    it('should get default address', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/addresses/default')
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(addressId1);
      expect(response.body.data.isDefault).toBe(true);
    });

    it('should get address by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/addresses/${addressId2}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(addressId2);
      expect(response.body.data.label).toBe('العمل');
    });
  });

  describe('3. Update Address', () => {
    it('should update address details', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/addresses/${addressId2}`)
        .set('Cookie', customerCookie)
        .send({
          label: 'مكتب العمل الجديد',
          floor: '10',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.label).toBe('مكتب العمل الجديد');
      expect(response.body.data.floor).toBe('10');
    });

    it('should set address as default', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/addresses/${addressId2}/default`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isDefault).toBe(true);

      // Verify first address is no longer default
      const firstAddress = await request(app.getHttpServer())
        .get(`/api/addresses/${addressId1}`)
        .set('Cookie', customerCookie);

      expect(firstAddress.body.data.isDefault).toBe(false);
    });
  });

  describe('4. Delete Address', () => {
    it('should delete address', async () => {
      // Create address to delete
      const createResponse = await request(app.getHttpServer())
        .post('/api/addresses')
        .set('Cookie', customerCookie)
        .send({
          label: 'للحذف',
          fullName: 'اختبار',
          phoneNumber: '+963991234569',
          city: 'حمص',
          street: 'شارع',
        });

      const deleteId = createResponse.body.data._id;

      const response = await request(app.getHttpServer())
        .delete(`/api/addresses/${deleteId}`)
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify address is deleted (soft delete)
      const getResponse = await request(app.getHttpServer())
        .get(`/api/addresses/${deleteId}`)
        .set('Cookie', customerCookie)
        .expect(404);
    });

    it('should set another address as default when deleting default', async () => {
      // addressId2 is now default, delete it
      await request(app.getHttpServer())
        .delete(`/api/addresses/${addressId2}`)
        .set('Cookie', customerCookie)
        .expect(200);

      // Verify addressId1 is now default
      const response = await request(app.getHttpServer())
        .get('/api/addresses/default')
        .set('Cookie', customerCookie)
        .expect(200);

      expect(response.body.data._id).toBe(addressId1);
      expect(response.body.data.isDefault).toBe(true);
    });
  });

  describe('5. Validation & Security', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer()).get('/api/addresses').expect(401);
    });

    it('should not access other user addresses', async () => {
      // Login as admin (different user)
      const adminLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          phoneNumber: '+963991234567',
          password: 'Admin@123456',
        });

      const adminCookie = adminLogin.headers['set-cookie'];

      // Try to access customer's address
      const response = await request(app.getHttpServer())
        .get(`/api/addresses/${addressId1}`)
        .set('Cookie', adminCookie)
        .expect(403);
    });
  });
});
