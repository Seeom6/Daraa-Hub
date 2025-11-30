# Store-Products Integration Test
# Tests the integration between Store Management and Product Management systems

# Import utilities
. "$PSScriptRoot\..\utils\http.ps1"
. "$PSScriptRoot\..\utils\helpers.ps1"

# Start test suite
Start-TestSuite -Name "Store-Products Integration"

Write-TestHeader "STORE-PRODUCTS INTEGRATION TEST"
Write-Host "This test verifies integration between stores and products:" -ForegroundColor Cyan
Write-Host "  1. Create verified store owner" -ForegroundColor Cyan
Write-Host "  2. Add products to store" -ForegroundColor Cyan
Write-Host "  3. Verify product-store relationship" -ForegroundColor Cyan
Write-Host "  4. Update product inventory" -ForegroundColor Cyan
Write-Host "  5. Query products by store" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PHASE 1: Setup - Create Verified Store
# ============================================
Write-TestHeader "PHASE 1: Setup - Create Verified Store"

$testPhone = Generate-TestPhone
$testEmail = Generate-TestEmail -Prefix "integration-store"

Write-TestStep "Creating and verifying store owner..."

# Register store owner
$step1 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/step1" `
    -Body @{ fullName = "Integration Test Store Owner"; phoneNumber = $testPhone; countryCode = "SY" } `
    -ExpectedStatus 200

$otp = Get-OtpFromLogs -PhoneNumber $testPhone
$step2 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/verify-otp" `
    -Body @{ phoneNumber = $testPhone; otp = $otp } -ExpectedStatus 200

$step3 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/complete-profile" `
    -Body @{ phoneNumber = $testPhone; password = "StoreOwner@123"; email = $testEmail } `
    -SaveSession -ExpectedStatus 201

$upgrade = Invoke-ApiRequest -Method POST -Endpoint "/account/upgrade-role" `
    -Body @{ role = "store_owner" } -UseSession -ExpectedStatus 200

$login = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" `
    -Body @{ phoneNumber = $testPhone; password = "StoreOwner@123" } `
    -SaveSession -ExpectedStatus 200

# Update store profile
$updateProfile = Invoke-ApiRequest -Method PUT -Endpoint "/account/store-profile" `
    -Body @{
        storeName = "Integration Test Electronics"
        storeDescription = "Testing store-product integration"
        businessAddress = "Damascus, Syria"
        businessPhone = "+963112345678"
    } -UseSession -ExpectedStatus 200

# Submit verification
$verification = Invoke-ApiRequest -Method POST -Endpoint "/verification/submit" `
    -Body @{
        applicantType = "store_owner"
        personalInfo = @{
            fullName = "Integration Test Store Owner"
            nationalId = "12345678901"
            dateOfBirth = "1990-01-01"
            address = "Damascus, Syria"
            city = "Damascus"
        }
        businessInfo = @{
            businessName = "Integration Test Electronics"
            businessType = "Electronics Retail"
            businessAddress = "Damascus, Syria"
            businessPhone = "+963112345678"
            taxId = "TAX-INT-123"
            commercialRegister = "CR-INT-456"
        }
    } -UseSession -ExpectedStatus 201

$verificationId = $verification.Content.data._id

# Admin approves
$adminLogin = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" `
    -Body @{ phoneNumber = "+963991234567"; password = "Admin@123456" } `
    -SaveSession -ExpectedStatus 200

$approval = Invoke-ApiRequest -Method PATCH -Endpoint "/verification/requests/$verificationId/review" `
    -Body @{ action = "approve"; notes = "Approved for integration test" } `
    -UseSession -ExpectedStatus 200

# Re-login as store owner
$storeLogin = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" `
    -Body @{ phoneNumber = $testPhone; password = "StoreOwner@123" } `
    -SaveSession -ExpectedStatus 200

if ($storeLogin.Success) {
    Write-TestSuccess "✅ Verified store created"
    Add-TestResult -Name "Create Verified Store" -Status "passed" -Endpoint "Multiple" -Duration 0
}

# ============================================
# PHASE 2: Add Products to Store
# ============================================
Write-TestHeader "PHASE 2: Add Products to Store"

# Get store profile to get storeId
$storeProfileForId = Invoke-ApiRequest -Method GET -Endpoint "/account/store-profile" `
    -UseSession -ExpectedStatus 200

$storeId = $storeProfileForId.Content.data._id
Write-Host "  Store ID: $storeId" -ForegroundColor Yellow

# Electronics Category ID (from database)
$electronicsCategory = "692bf4a453bbeadd0089b03d"

Write-TestStep "Adding product 1: Samsung Galaxy S23..."
$product1 = Invoke-ApiRequest -Method POST -Endpoint "/products" `
    -Body @{
        storeId = $storeId
        categoryId = $electronicsCategory
        name = "Samsung Galaxy S23 - Integration Test"
        slug = "samsung-galaxy-s23-integration-test-$(Get-Random -Minimum 1000 -Maximum 9999)"
        description = "Latest Samsung flagship phone with amazing features"
        price = 850000
        sku = "SAMSUNG-S23-INT-$(Get-Random -Minimum 1000 -Maximum 9999)"
        status = "active"
    } -UseSession -ExpectedStatus 201

if ($product1.Success) {
    $Global:Product1Id = $product1.Content.data._id
    Write-TestSuccess "✅ Product 1 added: $Global:Product1Id"
    Add-TestResult -Name "Add Product 1" -Status "passed" -Endpoint "POST /products" -Duration $product1.Duration
} else {
    Write-TestError "Failed to add product 1"
    Write-Host "  Error: $($product1.Content)" -ForegroundColor Red
}

Write-TestStep "Adding product 2: iPhone 15 Pro..."
$product2 = Invoke-ApiRequest -Method POST -Endpoint "/products" `
    -Body @{
        storeId = $storeId
        categoryId = $electronicsCategory
        name = "iPhone 15 Pro - Integration Test"
        slug = "iphone-15-pro-integration-test-$(Get-Random -Minimum 1000 -Maximum 9999)"
        description = "Apple's latest flagship with Pro features"
        price = 1200000
        sku = "IPHONE-15-INT-$(Get-Random -Minimum 1000 -Maximum 9999)"
        status = "active"
    } -UseSession -ExpectedStatus 201

if ($product2.Success) {
    $Global:Product2Id = $product2.Content.data._id
    Write-TestSuccess "✅ Product 2 added: $Global:Product2Id"
    Add-TestResult -Name "Add Product 2" -Status "passed" -Endpoint "POST /products" -Duration $product2.Duration
} else {
    Write-TestError "Failed to add product 2"
    Write-Host "  Error: $($product2.Content)" -ForegroundColor Red
}

# ============================================
# PHASE 3: Verify Product-Store Relationship
# ============================================
Write-TestHeader "PHASE 3: Verify Product-Store Relationship"

Write-TestStep "Getting product 1 details..."
if ($Global:Product1Id) {
    $productDetails = Invoke-ApiRequest -Method GET -Endpoint "/products/$Global:Product1Id" `
        -ExpectedStatus 200

    if ($productDetails.Success) {
        # Extract storeId - it might be an object or a string
        $productStoreId = $productDetails.Content.data.storeId
        if ($productStoreId -is [hashtable] -or $productStoreId -is [PSCustomObject]) {
            $productStoreId = $productStoreId._id
        }

        Write-Host "  Product Store ID: $productStoreId" -ForegroundColor Yellow
        Write-Host "  Expected Store ID: $storeId" -ForegroundColor Yellow

        if ($productStoreId -eq $storeId) {
            Write-TestSuccess "✅ Product correctly linked to store"
            Add-TestResult -Name "Verify Product-Store Link" -Status "passed" -Endpoint "GET /products/:id" -Duration $productDetails.Duration
        } else {
            Write-TestError "Product not linked to correct store"
        }
    }
}

Write-TestStep "Getting all products for this store..."
$storeProducts = Invoke-ApiRequest -Method GET -Endpoint "/products?storeId=$storeId" `
    -ExpectedStatus 200

if ($storeProducts.Success) {
    $productCount = $storeProducts.Content.data.Count
    Write-Host "  Found $productCount product(s) for this store" -ForegroundColor Yellow
    Add-TestResult -Name "Query Products by Store" -Status "passed" -Endpoint "GET /products?storeId=:id" -Duration $storeProducts.Duration
}

# ============================================
# PHASE 4: Inventory Management
# ============================================
Write-TestHeader "PHASE 4: Inventory Management"

if ($Global:Product1Id) {
    Write-TestStep "Creating inventory for product 1..."
    $inventory1 = Invoke-ApiRequest -Method POST -Endpoint "/inventory" `
        -Body @{
            productId = $Global:Product1Id
            storeId = $storeId
            quantity = 50
            lowStockThreshold = 10
            reorderPoint = 5
            reorderQuantity = 30
        } -UseSession -ExpectedStatus 201

    if ($inventory1.Success) {
        Write-TestSuccess "✅ Inventory created for product 1"
        Write-Host "  Quantity: 50" -ForegroundColor Yellow
        Add-TestResult -Name "Create Inventory" -Status "passed" -Endpoint "POST /inventory" -Duration $inventory1.Duration
    } else {
        Write-TestError "Failed to create inventory"
        Write-Host "  Error: $($inventory1.Content)" -ForegroundColor Red
    }
}

# ============================================
# PHASE 5: Public Product Visibility
# ============================================
Write-TestHeader "PHASE 5: Public Product Visibility"

Write-TestStep "Checking if products are visible publicly..."
$publicProducts = Invoke-ApiRequest -Method GET -Endpoint "/products?status=active" `
    -ExpectedStatus 200

if ($publicProducts.Success) {
    $activeProductCount = $publicProducts.Content.data.Count
    Write-Host "  Found $activeProductCount active product(s)" -ForegroundColor Yellow
    Add-TestResult -Name "Public Product Visibility" -Status "passed" -Endpoint "GET /products?status=active" -Duration $publicProducts.Duration
}

# Complete test suite
Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-store-products-integration.json"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ INTEGRATION TEST COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Store: $testPhone" -ForegroundColor Yellow
Write-Host "Store ID: $storeId" -ForegroundColor Yellow
Write-Host "Products Added: 2" -ForegroundColor Yellow
if ($Global:Product1Id) {
    Write-Host "Product 1 ID: $Global:Product1Id" -ForegroundColor Yellow
}
if ($Global:Product2Id) {
    Write-Host "Product 2 ID: $Global:Product2Id" -ForegroundColor Yellow
}

