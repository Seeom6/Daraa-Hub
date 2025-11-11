import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Account } from '../src/database/schemas/account.schema';
import { SecurityProfile } from '../src/database/schemas/security-profile.schema';
import { AdminProfile } from '../src/database/schemas/admin-profile.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const accountModel = app.get<Model<Account>>(getModelToken(Account.name));
  const securityProfileModel = app.get<Model<SecurityProfile>>(getModelToken(SecurityProfile.name));
  const adminProfileModel = app.get<Model<AdminProfile>>(getModelToken(AdminProfile.name));

  try {
    // Check if admin already exists
    const existingAdmin = await accountModel.findOne({ phone: '+963991234567' });
    if (existingAdmin) {
      console.log('❌ Admin account already exists');
      await app.close();
      return;
    }

    // Create Security Profile
    const securityProfile = await securityProfileModel.create({
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
      idVerified: false,
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      loginHistory: [],
    });

    console.log('✅ Security Profile created:', securityProfile._id);

    // Hash password
    const passwordHash = await bcrypt.hash('Admin@123456', 10);

    // Create Account
    const account = await accountModel.create({
      fullName: 'Super Admin',
      phone: '+963991234567',
      email: 'admin@daraa.com',
      passwordHash,
      role: 'admin',
      isVerified: true,
      isActive: true,
      isSuspended: false,
      securityProfileId: securityProfile._id,
      roleProfileRef: 'AdminProfile',
    });

    console.log('✅ Account created:', account._id);

    // Create Admin Profile with super_admin role
    const adminProfile = await adminProfileModel.create({
      accountId: account._id,
      role: 'super_admin',
      permissions: {
        users: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          suspend: true,
          ban: true,
        },
        stores: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          approve: true,
          suspend: true,
        },
        products: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          approve: true,
        },
        orders: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          cancel: true,
          refund: true,
        },
        payments: {
          view: true,
          process: true,
          refund: true,
        },
        deliveries: {
          view: true,
          assign: true,
          track: true,
        },
        reports: {
          view: true,
          export: true,
        },
        settings: {
          view: true,
          edit: true,
        },
        notifications: {
          view: true,
          send: true,
        },
        auditLogs: {
          view: true,
          export: true,
        },
      },
      department: 'Management',
      isActive: true,
    });

    console.log('✅ Admin Profile created:', adminProfile._id);

    // Update account with roleProfileId
    account.roleProfileId = adminProfile._id;
    await account.save();

    console.log('\n🎉 Super Admin account created successfully!');
    console.log('📱 Phone: +963991234567');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 Role: super_admin');
    console.log('\n✅ You can now login with these credentials');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }

  await app.close();
}

bootstrap();

