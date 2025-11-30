# Store Management API Tests

## Overview
Comprehensive tests for the Store Management system covering all endpoints and scenarios.

## Test Structure

### 1. Public Store Endpoints (No Authentication)
- `01-public-stores.ps1` - Browse stores, search, filter, get store details

### 2. Store Owner Operations (Requires Store Owner Role)
- `02-store-profile-management.ps1` - Create/update store profile, upload logo/banner
- `03-store-settings.ps1` - Configure store settings (hours, shipping, payments)
- `04-store-verification.ps1` - Submit verification documents, check status

### 3. Admin Operations (Requires Admin Role)
- `05-admin-store-management.ps1` - Approve/reject verification, suspend stores
- `06-store-categories.ps1` - Manage store categories (CRUD operations)

## Endpoints to Test

### Public Endpoints
- `GET /stores` - Get all active stores (with pagination, search, filters)
- `GET /stores/:id` - Get store details by ID

### Store Owner Endpoints
- `GET /account/store-profile` - Get own store profile
- `PUT /account/store-profile` - Update store profile
- `GET /store-settings/:storeId` - Get store settings
- `PUT /store-settings/:storeId` - Update store settings
- `POST /verification/submit` - Submit verification request
- `GET /verification/my-status` - Get verification status

### Admin Endpoints
- `GET /verification/requests` - Get all verification requests
- `POST /verification/requests/:id/approve` - Approve verification
- `POST /verification/requests/:id/reject` - Reject verification
- `POST /verification/requests/:id/request-info` - Request more information
- `POST /store-categories` - Create store category
- `GET /store-categories` - Get all categories
- `PATCH /store-categories/:id` - Update category
- `DELETE /store-categories/:id` - Delete category (soft delete)

## Test Scenarios

### Store Owner Registration & Setup
1. Register as store owner
2. Complete profile with store information
3. Submit verification documents
4. Wait for admin approval
5. Configure store settings
6. Activate store

### Store Profile Management
1. Update store name and description
2. Upload store logo
3. Upload store banner
4. Update business information
5. Update store categories

### Store Settings Configuration
1. Set business hours
2. Configure shipping zones
3. Set payment methods
4. Configure order settings
5. Set return/refund policies

### Verification Process
1. Submit verification with documents
2. Admin reviews and requests more info
3. Store owner provides additional info
4. Admin approves verification
5. Store becomes active

### Admin Store Management
1. View all verification requests
2. Approve pending verifications
3. Reject invalid verifications
4. Suspend active stores
5. Unsuspend stores

## Test Data Requirements

### Store Owner Account
- Phone: +963991234569
- Password: StoreOwner@123
- Role: store_owner
- Verification Status: pending

### Admin Account
- Phone: +963991234567
- Password: Admin@123456
- Role: super_admin

### Test Store Data
- Store Name: "Test Electronics Store"
- Description: "Best electronics in Damascus"
- Business Address: "Damascus, Syria"
- Business Phone: "+963112345678"
- Categories: Electronics, Mobile Phones

## Expected Results

All tests should pass with appropriate status codes:
- 200 OK - Successful GET/PUT requests
- 201 Created - Successful POST requests
- 400 Bad Request - Invalid input
- 401 Unauthorized - Missing/invalid authentication
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 409 Conflict - Duplicate resource

## Running Tests

```powershell
# Run all store tests
cd api-tests/02-stores
powershell -ExecutionPolicy Bypass -File .\run-all-tests.ps1

# Run specific test
powershell -ExecutionPolicy Bypass -File .\01-public-stores.ps1
```

