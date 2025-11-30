// Script to create a Super Admin account directly in MongoDB
// Usage: docker exec daraa-mongodb mongosh -u daraa_app -p DaraaAppPassword2024 --authenticationDatabase daraa < create-admin-account.js

// Switch to daraa database
db = db.getSiblingDB('daraa');

// Admin credentials
const adminPhone = '+963991234567';
const adminEmail = 'admin@daraa.com';
const adminFullName = 'Super Admin';
// Password: Admin@123456
// This is bcrypt hash for "Admin@123456" with salt rounds 10
const adminPasswordHash = '$2b$10$YQiiz.WJue89tiVfJECzUeHft9HdvqVdHN.xr7fxGN7EqKXq6B5Fy';

print('Creating Super Admin Account...');

// Check if admin already exists
const existingAdmin = db.accounts.findOne({ phone: adminPhone });
if (existingAdmin) {
  print('Admin account already exists with phone: ' + adminPhone);
  print('Account ID: ' + existingAdmin._id);
  printjson(existingAdmin);
} else {
  // Create Account
  const accountResult = db.accounts.insertOne({
    fullName: adminFullName,
    phone: adminPhone,
    email: adminEmail,
    passwordHash: adminPasswordHash,
    role: 'admin',
    isVerified: true,
    isActive: true,
    isSuspended: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const accountId = accountResult.insertedId;
  print('✅ Account created with ID: ' + accountId);

  // Create SecurityProfile
  db.securityprofiles.insertOne({
    accountId: accountId,
    phoneVerified: true,
    idVerified: true,
    twoFactorEnabled: false,
    failedAttempts: 0,
    loginHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  print('✅ SecurityProfile created');

  // Create AdminProfile with full permissions
  db.adminprofiles.insertOne({
    accountId: accountId,
    role: 'super_admin',
    department: 'operations',
    permissions: {
      users: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        suspend: true
      },
      stores: {
        view: true,
        approve: true,
        reject: true,
        suspend: true
      },
      couriers: {
        view: true,
        approve: true,
        reject: true,
        suspend: true
      },
      products: {
        view: true,
        edit: true,
        delete: true,
        feature: true
      },
      orders: {
        view: true,
        cancel: true,
        refund: true
      },
      payments: {
        view: true,
        refund: true
      },
      reports: {
        view: true,
        export: true
      },
      settings: {
        view: true,
        edit: true
      },
      coupons: {
        view: true,
        create: true,
        edit: true,
        delete: true
      },
      categories: {
        view: true,
        create: true,
        edit: true,
        delete: true
      },
      notifications: {
        send_bulk: true
      }
    },
    activityLog: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  print('✅ AdminProfile created with super_admin role');

  // Update Account with roleProfileId
  const adminProfile = db.adminprofiles.findOne({ accountId: accountId });
  db.accounts.updateOne(
    { _id: accountId },
    { 
      $set: { 
        roleProfileId: adminProfile._id,
        roleProfileRef: 'AdminProfile'
      } 
    }
  );
  print('✅ Account updated with roleProfileId');

  print('\n========================================');
  print('✅ Super Admin Account Created Successfully!');
  print('========================================');
  print('Phone: ' + adminPhone);
  print('Email: ' + adminEmail);
  print('Password: Admin@123456');
  print('Role: super_admin');
  print('Account ID: ' + accountId);
  print('========================================\n');
}

