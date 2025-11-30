/**
 * MongoDB Initialization Script
 * Creates application users with appropriate roles and permissions
 * 
 * This script runs automatically when MongoDB container starts for the first time
 * 
 * Users Created:
 * 1. daraa_app - Application user (readWrite on daraa database)
 * 2. daraa_backup - Backup user (read on all databases)
 * 3. daraa_readonly - Read-only user for analytics/reporting
 */

// Switch to admin database for authentication
db = db.getSiblingDB('admin');

// Authenticate as root user
db.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD);

// Switch to the application database
db = db.getSiblingDB('daraa');

print('='.repeat(60));
print('Creating Daraa Platform MongoDB Users...');
print('='.repeat(60));

// ============================================
// 1. Application User (daraa_app)
// ============================================
print('\n[1/3] Creating Application User (daraa_app)...');

try {
  db.createUser({
    user: process.env.MONGO_APP_USERNAME || 'daraa_app',
    pwd: process.env.MONGO_APP_PASSWORD || 'DaraaAppPassword2024',
    roles: [
      { role: 'readWrite', db: 'daraa' },
      { role: 'dbAdmin', db: 'daraa' }
    ],
    mechanisms: ['SCRAM-SHA-256']
  });
  print('✓ Application user created successfully');
} catch (e) {
  if (e.codeName === 'DuplicateKey') {
    print('⚠ Application user already exists, skipping...');
  } else {
    print('✗ Error creating application user: ' + e.message);
    throw e;
  }
}

// ============================================
// 2. Backup User (daraa_backup)
// ============================================
print('\n[2/3] Creating Backup User (daraa_backup)...');

try {
  db.createUser({
    user: process.env.MONGO_BACKUP_USERNAME || 'daraa_backup',
    pwd: process.env.MONGO_BACKUP_PASSWORD || 'DaraaBackupPassword2024',
    roles: [
      { role: 'backup', db: 'admin' },
      { role: 'read', db: 'daraa' }
    ],
    mechanisms: ['SCRAM-SHA-256']
  });
  print('✓ Backup user created successfully');
} catch (e) {
  if (e.codeName === 'DuplicateKey') {
    print('⚠ Backup user already exists, skipping...');
  } else {
    print('✗ Error creating backup user: ' + e.message);
    throw e;
  }
}

// ============================================
// 3. Read-Only User (daraa_readonly)
// ============================================
print('\n[3/3] Creating Read-Only User (daraa_readonly)...');

try {
  db.createUser({
    user: process.env.MONGO_READONLY_USERNAME || 'daraa_readonly',
    pwd: process.env.MONGO_READONLY_PASSWORD || 'DaraaReadonlyPassword2024',
    roles: [
      { role: 'read', db: 'daraa' }
    ],
    mechanisms: ['SCRAM-SHA-256']
  });
  print('✓ Read-only user created successfully');
} catch (e) {
  if (e.codeName === 'DuplicateKey') {
    print('⚠ Read-only user already exists, skipping...');
  } else {
    print('✗ Error creating read-only user: ' + e.message);
    throw e;
  }
}

print('\n' + '='.repeat(60));
print('MongoDB User Setup Complete!');
print('='.repeat(60));
print('\nUsers created:');
print('  - daraa_app (Application - readWrite)');
print('  - daraa_backup (Backup - read + backup)');
print('  - daraa_readonly (Analytics - read only)');
print('\n');

