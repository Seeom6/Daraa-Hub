import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

/**
 * Script to create test accounts for E2E testing
 * Creates: Super Admin, Store Owner, Courier
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const accountModel = app.get<Model<any>>(getModelToken('Account'));
    const securityProfileModel = app.get<Model<any>>(
      getModelToken('SecurityProfile'),
    );
    const storeOwnerProfileModel = app.get<Model<any>>(
      getModelToken('StoreOwnerProfile'),
    );
    const courierProfileModel = app.get<Model<any>>(
      getModelToken('CourierProfile'),
    );

    console.log('🚀 Creating test accounts...\n');

    // ==================== 1. Super Admin ====================
    console.log('1️⃣ Creating Super Admin...');
    
    let adminAccount = await accountModel.findOne({ phone: '+963991234567' });
    
    if (!adminAccount) {
      const adminSecurityProfile = await securityProfileModel.create({
        twoFactorEnabled: false,
        loginHistory: [],
        failedLoginAttempts: 0,
      });

      const passwordHash = await bcrypt.hash('Admin@123456', 12);

      adminAccount = await accountModel.create({
        fullName: 'Super Admin',
        phone: '+963991234567',
        email: 'admin@daraa.com',
        passwordHash,
        role: 'admin',
        isVerified: true,
        isActive: true,
        isSuspended: false,
        securityProfileId: adminSecurityProfile._id,
        roleProfileRef: 'AdminProfile',
      });

      console.log('✅ Super Admin created');
    } else {
      console.log('✅ Super Admin already exists');
    }

    // ==================== 2. Store Owner ====================
    console.log('\n2️⃣ Creating Store Owner...');

    // Delete existing Store Owner account and related data
    const existingStoreOwner = await accountModel.findOne({ phone: '+963991234569' });
    if (existingStoreOwner) {
      await storeOwnerProfileModel.deleteMany({ accountId: existingStoreOwner._id });
      if (existingStoreOwner.securityProfileId) {
        await securityProfileModel.deleteOne({ _id: existingStoreOwner.securityProfileId });
      }
      await accountModel.deleteOne({ _id: existingStoreOwner._id });
      console.log('🗑️ Deleted existing Store Owner account');
    }

    const passwordHash = await bcrypt.hash('StoreOwner@123', 12);

    // Create account first without securityProfileId
    const storeOwnerAccount = await accountModel.create({
      fullName: 'Test Store Owner',
      phone: '+963991234569',
      email: 'storeowner@daraa.com',
      passwordHash,
      role: 'store_owner',
      isVerified: true,
      isActive: true,
      isSuspended: false,
      roleProfileRef: 'StoreOwnerProfile',
    });

    // Create security profile with accountId
    const storeOwnerSecurityProfile = await securityProfileModel.create({
      accountId: storeOwnerAccount._id,
      twoFactorEnabled: false,
      loginHistory: [],
      failedLoginAttempts: 0,
    });

    // Update account with securityProfileId
    storeOwnerAccount.securityProfileId = storeOwnerSecurityProfile._id;
    await storeOwnerAccount.save();

    // Create Store Owner Profile
    const storeOwnerProfile = await storeOwnerProfileModel.create({
      accountId: storeOwnerAccount._id,
      businessName: 'Test Store',
      businessType: 'retail',
      verificationStatus: 'approved',
      isActive: true,
      rating: 4.5,
      totalSales: 0,
      totalOrders: 0,
    });

    storeOwnerAccount.roleProfileId = storeOwnerProfile._id;
    await storeOwnerAccount.save();

    console.log('✅ Store Owner created successfully');

    // ==================== 3. Courier ====================
    console.log('\n3️⃣ Creating Courier...');
    
    let courierAccount = await accountModel.findOne({
      phone: '+963991234570',
    });

    if (!courierAccount) {
      const courierSecurityProfile = await securityProfileModel.create({
        twoFactorEnabled: false,
        loginHistory: [],
        failedLoginAttempts: 0,
      });

      const passwordHash = await bcrypt.hash('Courier@123', 12);

      courierAccount = await accountModel.create({
        fullName: 'Test Courier',
        phone: '+963991234570',
        email: 'courier@daraa.com',
        passwordHash,
        role: 'courier',
        isVerified: true,
        isActive: true,
        isSuspended: false,
        securityProfileId: courierSecurityProfile._id,
        roleProfileRef: 'CourierProfile',
      });

      // Create Courier Profile
      const courierProfile = await courierProfileModel.create({
        accountId: courierAccount._id,
        vehicleType: 'motorcycle',
        vehicleNumber: 'TEST-123',
        status: 'available',
        verificationStatus: 'approved',
        isActive: true,
        rating: 4.8,
        totalDeliveries: 0,
        currentLocation: {
          type: 'Point',
          coordinates: [36.3498, 33.5102], // Daraa coordinates
        },
      });

      courierAccount.roleProfileId = courierProfile._id;
      await courierAccount.save();

      console.log('✅ Courier created');
    } else {
      console.log('✅ Courier already exists');
    }

    console.log('\n🎉 Test accounts setup completed!\n');
    console.log('📋 Test Accounts:');
    console.log('─────────────────────────────────────────');
    console.log('1. Super Admin:');
    console.log('   📱 Phone: +963991234567');
    console.log('   🔑 Password: Admin@123456');
    console.log('   👤 Role: admin\n');
    console.log('2. Store Owner:');
    console.log('   📱 Phone: +963991234569');
    console.log('   🔑 Password: StoreOwner@123');
    console.log('   👤 Role: store_owner\n');
    console.log('3. Courier:');
    console.log('   📱 Phone: +963991234570');
    console.log('   🔑 Password: Courier@123');
    console.log('   👤 Role: courier\n');
    console.log('─────────────────────────────────────────');
  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
  }

  await app.close();
}

bootstrap();

