/**
 * MongoDB Index Creation Script
 * Creates optimized indexes for all collections
 * 
 * This script runs automatically after user creation
 * 
 * Index Types:
 * - Compound indexes for common query patterns
 * - TTL indexes for automatic data cleanup
 * - Partial indexes for filtered queries
 * - Text indexes for search functionality
 */

// Switch to admin database for authentication
db = db.getSiblingDB('admin');
db.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD);

// Switch to the application database
db = db.getSiblingDB('daraa');

print('='.repeat(60));
print('Creating Optimized Indexes for Daraa Platform...');
print('='.repeat(60));

// ============================================
// Helper function to create index safely
// ============================================
function createIndexSafe(collection, keys, options) {
  try {
    db[collection].createIndex(keys, options || {});
    print('✓ Created index on ' + collection + ': ' + JSON.stringify(keys));
  } catch (e) {
    if (e.codeName === 'IndexOptionsConflict' || e.codeName === 'IndexKeySpecsConflict') {
      print('⚠ Index already exists on ' + collection + ', skipping...');
    } else {
      print('✗ Error creating index on ' + collection + ': ' + e.message);
    }
  }
}

// ============================================
// 1. Accounts Collection Indexes
// ============================================
print('\n[1/15] Creating Accounts indexes...');
// Note: phone field already has unique index from schema definition
// createIndexSafe('accounts', { phone: 1 }, { unique: true, name: 'idx_accounts_phone' });
createIndexSafe('accounts', { role: 1, isActive: 1 }, { name: 'idx_accounts_role_active' });
createIndexSafe('accounts', { createdAt: -1 }, { name: 'idx_accounts_created' });
createIndexSafe('accounts', { email: 1 }, { sparse: true, name: 'idx_accounts_email' });

// ============================================
// 2. Products Collection Indexes
// ============================================
print('\n[2/15] Creating Products indexes...');
createIndexSafe('products', { store: 1, isActive: 1 }, { name: 'idx_products_store_active' });
createIndexSafe('products', { category: 1, isActive: 1 }, { name: 'idx_products_category_active' });
createIndexSafe('products', { sku: 1 }, { unique: true, sparse: true, name: 'idx_products_sku' });
createIndexSafe('products', { name: 'text', description: 'text' }, { name: 'idx_products_text_search' });
createIndexSafe('products', { price: 1, isActive: 1 }, { name: 'idx_products_price' });
createIndexSafe('products', { createdAt: -1 }, { name: 'idx_products_created' });

// ============================================
// 3. Orders Collection Indexes
// ============================================
print('\n[3/15] Creating Orders indexes...');
createIndexSafe('orders', { customer: 1, createdAt: -1 }, { name: 'idx_orders_customer' });
createIndexSafe('orders', { store: 1, status: 1, createdAt: -1 }, { name: 'idx_orders_store_status' });
createIndexSafe('orders', { courier: 1, status: 1 }, { name: 'idx_orders_courier_status' });
createIndexSafe('orders', { orderNumber: 1 }, { unique: true, name: 'idx_orders_number' });
createIndexSafe('orders', { status: 1, createdAt: -1 }, { name: 'idx_orders_status' });
createIndexSafe('orders', { 'deliveryAddress.zone': 1 }, { name: 'idx_orders_zone' });

// ============================================
// 4. Stores Collection Indexes
// ============================================
print('\n[4/15] Creating Stores indexes...');
createIndexSafe('stores', { owner: 1 }, { name: 'idx_stores_owner' });
createIndexSafe('stores', { category: 1, isActive: 1 }, { name: 'idx_stores_category_active' });
createIndexSafe('stores', { 'location.coordinates': '2dsphere' }, { name: 'idx_stores_location' });
createIndexSafe('stores', { name: 'text' }, { name: 'idx_stores_text_search' });
createIndexSafe('stores', { rating: -1, isActive: 1 }, { name: 'idx_stores_rating' });

// ============================================
// 5. Inventory Collection Indexes
// ============================================
print('\n[5/15] Creating Inventory indexes...');
createIndexSafe('inventories', { product: 1 }, { unique: true, name: 'idx_inventory_product' });
createIndexSafe('inventories', { store: 1, quantity: 1 }, { name: 'idx_inventory_store_qty' });
createIndexSafe('inventories', { quantity: 1 }, { 
  name: 'idx_inventory_low_stock',
  partialFilterExpression: { quantity: { $lte: 10 } }
});

// ============================================
// 6. Wallet Transactions Collection Indexes
// ============================================
print('\n[6/15] Creating Wallet Transactions indexes...');
createIndexSafe('wallettransactions', { wallet: 1, createdAt: -1 }, { name: 'idx_wallet_tx_wallet' });
createIndexSafe('wallettransactions', { type: 1, createdAt: -1 }, { name: 'idx_wallet_tx_type' });
createIndexSafe('wallettransactions', { reference: 1 }, { sparse: true, name: 'idx_wallet_tx_ref' });
createIndexSafe('wallettransactions', { createdAt: -1 }, { name: 'idx_wallet_tx_created' });

// ============================================
// 7. Notifications Collection Indexes (with TTL)
// ============================================
print('\n[7/15] Creating Notifications indexes...');
createIndexSafe('notifications', { recipient: 1, isRead: 1, createdAt: -1 }, { name: 'idx_notif_recipient' });
createIndexSafe('notifications', { type: 1, createdAt: -1 }, { name: 'idx_notif_type' });
createIndexSafe('notifications', { createdAt: 1 }, { 
  name: 'idx_notif_ttl',
  expireAfterSeconds: 7776000 // 90 days
});

// ============================================
// 8. OTP Collection Indexes (with TTL)
// ============================================
print('\n[8/15] Creating OTP indexes...');
createIndexSafe('otps', { phoneNumber: 1, type: 1 }, { name: 'idx_otp_phone_type' });
createIndexSafe('otps', { expiresAt: 1 }, { 
  name: 'idx_otp_ttl',
  expireAfterSeconds: 0 // Expire at the specified date
});

// ============================================
// 9. Audit Logs Collection Indexes (with TTL)
// ============================================
print('\n[9/15] Creating Audit Logs indexes...');
createIndexSafe('auditlogs', { userId: 1, createdAt: -1 }, { name: 'idx_audit_user' });
createIndexSafe('auditlogs', { action: 1, createdAt: -1 }, { name: 'idx_audit_action' });
createIndexSafe('auditlogs', { entityType: 1, entityId: 1 }, { name: 'idx_audit_entity' });
createIndexSafe('auditlogs', { createdAt: 1 }, { 
  name: 'idx_audit_ttl',
  expireAfterSeconds: 31536000 // 365 days
});

// ============================================
// 10. Reviews Collection Indexes
// ============================================
print('\n[10/15] Creating Reviews indexes...');
createIndexSafe('reviews', { product: 1, createdAt: -1 }, { name: 'idx_reviews_product' });
createIndexSafe('reviews', { store: 1, rating: -1 }, { name: 'idx_reviews_store_rating' });
createIndexSafe('reviews', { customer: 1 }, { name: 'idx_reviews_customer' });

// ============================================
// 11. Coupons Collection Indexes
// ============================================
print('\n[11/15] Creating Coupons indexes...');
createIndexSafe('coupons', { code: 1 }, { unique: true, name: 'idx_coupons_code' });
createIndexSafe('coupons', { store: 1, isActive: 1 }, { name: 'idx_coupons_store_active' });
createIndexSafe('coupons', { expiryDate: 1, isActive: 1 }, { name: 'idx_coupons_expiry' });

// ============================================
// 12. Points Transactions Collection Indexes
// ============================================
print('\n[12/15] Creating Points Transactions indexes...');
createIndexSafe('pointstransactions', { account: 1, createdAt: -1 }, { name: 'idx_points_account' });
createIndexSafe('pointstransactions', { type: 1, createdAt: -1 }, { name: 'idx_points_type' });

// ============================================
// 13. Commission Collection Indexes
// ============================================
print('\n[13/15] Creating Commission indexes...');
createIndexSafe('commissions', { store: 1, createdAt: -1 }, { name: 'idx_commission_store' });
createIndexSafe('commissions', { order: 1 }, { name: 'idx_commission_order' });
createIndexSafe('commissions', { status: 1, createdAt: -1 }, { name: 'idx_commission_status' });

// ============================================
// 14. Delivery Zones Collection Indexes
// ============================================
print('\n[14/15] Creating Delivery Zones indexes...');
createIndexSafe('deliveryzones', { store: 1, isActive: 1 }, { name: 'idx_zones_store_active' });
createIndexSafe('deliveryzones', { 'area.coordinates': '2dsphere' }, { name: 'idx_zones_area' });

// ============================================
// 15. Carts Collection Indexes
// ============================================
print('\n[15/15] Creating Carts indexes...');
createIndexSafe('carts', { customer: 1 }, { unique: true, name: 'idx_carts_customer' });
createIndexSafe('carts', { updatedAt: 1 }, {
  name: 'idx_carts_ttl',
  expireAfterSeconds: 604800 // 7 days - abandoned carts cleanup
});

print('\n' + '='.repeat(60));
print('Index Creation Complete!');
print('='.repeat(60));
print('\nTotal indexes created across 15 collections');
print('Including TTL indexes for automatic data cleanup:');
print('  - Notifications: 90 days');
print('  - OTPs: Expire at specified date');
print('  - Audit Logs: 365 days');
print('  - Abandoned Carts: 7 days');
print('\n');

