import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Account } from '../src/database/schemas/account.schema';
import { StoreOwnerProfile } from '../src/database/schemas/store-owner-profile.schema';
import { SubscriptionPlan } from '../src/database/schemas/subscription-plan.schema';
import { StoreSubscription } from '../src/database/schemas/store-subscription.schema';
import { SystemSettings } from '../src/database/schemas/system-settings.schema';
import { Product } from '../src/database/schemas/product.schema';
import cookieParser from 'cookie-parser';

describe('Subscription System (E2E)', () => {
  let app: INestApplication;
  let accountModel: Model<Account>;
  let storeProfileModel: Model<StoreOwnerProfile>;
  let subscriptionPlanModel: Model<SubscriptionPlan>;
  let subscriptionModel: Model<StoreSubscription>;
  let systemSettingsModel: Model<SystemSettings>;
  let productModel: Model<Product>;

  let adminCookie: string | string[];
  let storeOwnerCookie: string | string[];
  let storeOwnerId: string;
  let storeId: string;
  let basicPlanId: string;
  let standardPlanId: string;
  let premiumPlanId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.use(cookieParser());
    await app.init();

    accountModel = moduleFixture.get<Model<Account>>(getModelToken(Account.name));
    storeProfileModel = moduleFixture.get<Model<StoreOwnerProfile>>(
      getModelToken(StoreOwnerProfile.name),
    );
    subscriptionPlanModel = moduleFixture.get<Model<SubscriptionPlan>>(
      getModelToken(SubscriptionPlan.name),
    );
    subscriptionModel = moduleFixture.get<Model<StoreSubscription>>(
      getModelToken(StoreSubscription.name),
    );
    systemSettingsModel = moduleFixture.get<Model<SystemSettings>>(
      getModelToken(SystemSettings.name),
    );
    productModel = moduleFixture.get<Model<Product>>(getModelToken(Product.name));

    // Clean test data
    await subscriptionPlanModel.deleteMany({});
    await subscriptionModel.deleteMany({});
    await systemSettingsModel.deleteMany({});
    await productModel.deleteMany({ name: /^Test Product/ });

    // Login as admin (using existing account from Phase 0)
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        phoneNumber: '+963991234567',
        password: 'Admin@123456',
      });

    const adminCookies = adminLoginResponse.headers['set-cookie'];
    adminCookie = Array.isArray(adminCookies) ? adminCookies : [adminCookies];

    // Login as store owner (using existing account from Phase 0)
    const storeOwnerLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        phoneNumber: '+963991234569',
        password: 'StoreOwner@123',
      });

    const storeOwnerCookies = storeOwnerLoginResponse.headers['set-cookie'];
    storeOwnerCookie = Array.isArray(storeOwnerCookies) ? storeOwnerCookies : [storeOwnerCookies];

    // Get store owner account
    const storeOwnerAccount = await accountModel.findOne({ phoneNumber: '+963991234569' });
    if (!storeOwnerAccount) {
      throw new Error('Store owner account not found');
    }

    // Get store profile
    const storeProfile = await storeProfileModel.findOne({ accountId: storeOwnerAccount._id });
    if (!storeProfile) {
      throw new Error('Store profile not found');
    }

    storeId = storeProfile._id.toString();

    // Seed subscription plans
    const basicPlan = await subscriptionPlanModel.create({
      name: 'Basic Plan',
      type: 'basic',
      priceUSD: 20,
      priceSYP: 300000,
      durationDays: 30,
      features: {
        dailyProductLimit: 2,
        maxImagesPerProduct: 2,
        maxVariantsPerProduct: 5,
        prioritySupport: false,
        analyticsAccess: false,
        customDomain: false,
      },
      isActive: true,
      order: 1,
    });

    const standardPlan = await subscriptionPlanModel.create({
      name: 'Standard Plan',
      type: 'standard',
      priceUSD: 50,
      priceSYP: 750000,
      durationDays: 30,
      features: {
        dailyProductLimit: 5,
        maxImagesPerProduct: 4,
        maxVariantsPerProduct: -1,
        prioritySupport: false,
        analyticsAccess: true,
        customDomain: false,
      },
      isActive: true,
      order: 2,
    });

    const premiumPlan = await subscriptionPlanModel.create({
      name: 'Premium Plan',
      type: 'premium',
      priceUSD: 100,
      priceSYP: 1500000,
      durationDays: 30,
      features: {
        dailyProductLimit: 15,
        maxImagesPerProduct: 6,
        maxVariantsPerProduct: -1,
        prioritySupport: true,
        analyticsAccess: true,
        customDomain: true,
      },
      isActive: true,
      order: 3,
    });

    basicPlanId = basicPlan._id.toString();
    standardPlanId = standardPlan._id.toString();
    premiumPlanId = premiumPlan._id.toString();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Subscription Plans', () => {
    it('should get all subscription plans', async () => {
      const response = await request(app.getHttpServer())
        .get('/subscription-plans')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].name).toBe('Basic Plan');
    });

    it('should get active plans only', async () => {
      const response = await request(app.getHttpServer())
        .get('/subscription-plans?activeOnly=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('should get plan by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subscription-plans/${basicPlanId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Basic Plan');
      expect(response.body.data.priceUSD).toBe(20);
    });
  });

  describe('System Settings', () => {
    it('should enable subscription system (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .put('/system-settings/subscription')
        .set('Cookie', adminCookie)
        .send({
          subscriptionSystemEnabled: true,
          allowManualPayment: true,
          allowOnlinePayment: false,
          subscriptionExpiryWarningDays: 3,
          notifyOnSubscriptionExpiry: true,
          notifyOnDailyLimitReached: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.value.subscriptionSystemEnabled).toBe(true);
    });

    it('should get subscription settings (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .get('/system-settings/subscription')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.value.subscriptionSystemEnabled).toBe(true);
    });
  });

  describe('Subscriptions', () => {
    let subscriptionId: string;

    it('should create subscription (Admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Cookie', adminCookie)
        .send({
          storeId,
          planId: basicPlanId,
          paymentMethod: 'manual',
          amountPaid: 20,
          paymentReference: 'TEST-REF-001',
          notes: 'Test subscription',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.storeId).toBe(storeId);
      expect(response.body.data.status).toBe('active');
      subscriptionId = response.body.data._id;
    });

    it('should get store active subscription', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subscriptions/store/${storeId}/active`)
        .set('Cookie', storeOwnerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('active');
    });

    it('should get all store subscriptions', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subscriptions/store/${storeId}`)
        .set('Cookie', storeOwnerCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('Product Creation with Subscription Limits', () => {
    it('should create product with unit (within limits)', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Cookie', storeOwnerCookie)
        .send({
          name: 'Test Product 1',
          description: 'Test description',
          price: 100,
          unit: 'kg',
          unitValue: 1,
          images: ['image1.jpg'],
          status: 'active',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unit).toBe('kg');
      expect(response.body.data.unitValue).toBe(1);
    });

    it('should create second product (within daily limit)', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Cookie', storeOwnerCookie)
        .send({
          name: 'Test Product 2',
          description: 'Test description',
          price: 200,
          unit: 'piece',
          unitValue: 1,
          images: ['image1.jpg', 'image2.jpg'],
          status: 'active',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should fail to create third product (daily limit reached)', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Cookie', storeOwnerCookie)
        .send({
          name: 'Test Product 3',
          description: 'Test description',
          price: 300,
          unit: 'liter',
          unitValue: 1,
          images: ['image1.jpg'],
          status: 'active',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('daily limit');
    });

    it('should fail to create product with too many images', async () => {
      // Reset daily usage by changing date
      const subscription = await subscriptionModel.findOne({ storeId });
      subscription.dailyUsage = [];
      await subscription.save();

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Cookie', storeOwnerCookie)
        .send({
          name: 'Test Product 4',
          description: 'Test description',
          price: 400,
          unit: 'box',
          unitValue: 1,
          images: ['image1.jpg', 'image2.jpg', 'image3.jpg'], // 3 images, limit is 2
          status: 'active',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('images');
    });
  });
});

