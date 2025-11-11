import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Account } from '../src/database/schemas/account.schema';
import { AdminProfile } from '../src/database/schemas/admin-profile.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const accountModel = app.get<Model<Account>>(getModelToken(Account.name));
  const adminProfileModel = app.get<Model<AdminProfile>>(getModelToken(AdminProfile.name));

  try {
    // Find the account
    const account = await accountModel.findOne({ phone: '+963991234567' });
    if (!account) {
      console.log('❌ Account not found');
      await app.close();
      return;
    }

    console.log('✅ Account found:', account._id);

    // Check if already admin
    if (account.role === 'admin') {
      console.log('⚠️  Account is already an admin');
      await app.close();
      return;
    }

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
      department: 'operations',
      isActive: true,
    });

    console.log('✅ Admin Profile created:', adminProfile._id);

    // Update account
    account.role = 'admin';
    account.roleProfileRef = 'AdminProfile';
    account.roleProfileId = adminProfile._id;
    await account.save();

    console.log('\n🎉 Account upgraded to Super Admin successfully!');
    console.log('📱 Phone: +963991234567');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 Role: super_admin');
    console.log('\n✅ You can now login with these credentials');

  } catch (error) {
    console.error('❌ Error upgrading account:', error);
  }

  await app.close();
}

bootstrap();

