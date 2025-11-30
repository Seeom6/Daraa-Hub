# Import utilities
. "$PSScriptRoot\..\utils\http.ps1"
. "$PSScriptRoot\..\utils\helpers.ps1"

# Start test suite
Start-TestSuite -Name "Public Store Endpoints"

Write-TestHeader "TEST SUITE: Public Store Endpoints"

# ============================================
# SCENARIO 1: Get All Stores (No Auth Required)
# ============================================
Write-TestHeader "SCENARIO 1: Get All Stores"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/stores" `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /stores -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Total Stores: $($response.Data.total)"
    Write-Host "  Page: $($response.Data.page) of $($response.Data.totalPages)"
    Write-Host "  Count: $($response.Data.count)"
    
    Add-TestResult -Name "Get all stores" -Status "passed" `
        -Endpoint "GET /stores" `
        -Request @{} `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "GET /stores -> $($response.StatusCode)"
    Add-TestResult -Name "Get all stores" -Status "failed" `
        -Endpoint "GET /stores" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 2: Get Stores with Pagination
# ============================================
Write-TestHeader "SCENARIO 2: Get Stores with Pagination"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/stores?page=1&limit=5" `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /stores?page=1&limit=5 -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Returned: $($response.Data.count) stores"
    
    Add-TestResult -Name "Get stores with pagination" -Status "passed" `
        -Endpoint "GET /stores?page=1&limit=5" `
        -Request @{ page = 1; limit = 5 } `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "GET /stores?page=1&limit=5 -> $($response.StatusCode)"
    Add-TestResult -Name "Get stores with pagination" -Status "failed" `
        -Endpoint "GET /stores?page=1&limit=5" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 3: Search Stores by Name
# ============================================
Write-TestHeader "SCENARIO 3: Search Stores by Name"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/stores?search=test" `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /stores?search=test -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Found: $($response.Data.count) stores"
    
    Add-TestResult -Name "Search stores by name" -Status "passed" `
        -Endpoint "GET /stores?search=test" `
        -Request @{ search = "test" } `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "GET /stores?search=test -> $($response.StatusCode)"
    Add-TestResult -Name "Search stores by name" -Status "failed" `
        -Endpoint "GET /stores?search=test" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 4: Filter Verified Stores
# ============================================
Write-TestHeader "SCENARIO 4: Filter Verified Stores"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/stores?verified=true" `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /stores?verified=true -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Verified Stores: $($response.Data.count)"
    
    Add-TestResult -Name "Filter verified stores" -Status "passed" `
        -Endpoint "GET /stores?verified=true" `
        -Request @{ verified = "true" } `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "GET /stores?verified=true -> $($response.StatusCode)"
    Add-TestResult -Name "Filter verified stores" -Status "failed" `
        -Endpoint "GET /stores?verified=true" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 5: Sort Stores by Rating
# ============================================
Write-TestHeader "SCENARIO 5: Sort Stores by Rating"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/stores?sort=rating" `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /stores?sort=rating -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Stores sorted by rating: $($response.Data.count)"
    
    Add-TestResult -Name "Sort stores by rating" -Status "passed" `
        -Endpoint "GET /stores?sort=rating" `
        -Request @{ sort = "rating" } `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "GET /stores?sort=rating -> $($response.StatusCode)"
    Add-TestResult -Name "Sort stores by rating" -Status "failed" `
        -Endpoint "GET /stores?sort=rating" `
        -ErrorMessage $response.Error
}

# Complete test suite
Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-public-stores.json"

