# Import utilities
. "$PSScriptRoot\..\utils\http.ps1"
. "$PSScriptRoot\..\utils\helpers.ps1"

# Start test suite
Start-TestSuite -Name "Admin Verification Approval"

Write-TestHeader "TEST SUITE: Admin Verification Approval"

# ============================================
# SETUP: Login as Admin
# ============================================
Write-TestHeader "SETUP: Login as Admin"

$loginResponse = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/login" `
    -Body @{
        phoneNumber = "+963991234567"
        password = "Admin@123456"
    } `
    -SaveSession `
    -ExpectedStatus 200

if ($loginResponse.Success) {
    Write-TestSuccess "Logged in as admin"
} else {
    Write-TestError "Failed to login as admin"
    Write-Host "ERROR: Cannot proceed without admin access"
    exit 1
}

# ============================================
# SCENARIO 1: Get All Verification Requests
# ============================================
Write-TestHeader "SCENARIO 1: Get All Verification Requests"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/verification/requests" `
    -UseSession `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /verification/requests -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Total Requests: $($response.Data.total)"
    Write-Host "  Pending: $($response.Data.data | Where-Object { $_.status -eq 'pending' } | Measure-Object | Select-Object -ExpandProperty Count)"
    
    # Save first pending request ID for approval
    $pendingRequest = $response.Data.data | Where-Object { $_.status -eq 'pending' } | Select-Object -First 1
    if ($pendingRequest) {
        $Global:PendingVerificationId = $pendingRequest._id
        Write-Host "  Selected Request ID: $Global:PendingVerificationId"
    }
    
    Add-TestResult -Name "Get all verification requests" -Status "passed" `
        -Endpoint "GET /verification/requests" `
        -Request @{} `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "GET /verification/requests -> $($response.StatusCode)"
    Add-TestResult -Name "Get all verification requests" -Status "failed" `
        -Endpoint "GET /verification/requests" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 2: Get Pending Verification Requests
# ============================================
Write-TestHeader "SCENARIO 2: Get Pending Verification Requests"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/verification/requests?status=pending" `
    -UseSession `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /verification/requests?status=pending -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Pending Requests: $($response.Data.count)"
    
    Add-TestResult -Name "Get pending verification requests" -Status "passed" `
        -Endpoint "GET /verification/requests?status=pending" `
        -Request @{ status = "pending" } `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "GET /verification/requests?status=pending -> $($response.StatusCode)"
    Add-TestResult -Name "Get pending verification requests" -Status "failed" `
        -Endpoint "GET /verification/requests?status=pending" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 3: Request More Information
# ============================================
Write-TestHeader "SCENARIO 3: Request More Information"

if ($Global:PendingVerificationId) {
    $response = Invoke-ApiRequest `
        -Method POST `
        -Endpoint "/verification/requests/$Global:PendingVerificationId/request-info" `
        -Body @{
            message = "Please provide a clearer photo of your business license"
        } `
        -UseSession `
        -ExpectedStatus 200
    
    if ($response.Success) {
        Write-TestSuccess "POST /verification/requests/:id/request-info -> $($response.StatusCode) ($($response.Duration)ms)"
        Write-Host "  Status: $($response.Data.data.status)"
        
        Add-TestResult -Name "Request more information" -Status "passed" `
            -Endpoint "POST /verification/requests/:id/request-info" `
            -Request @{ message = "Please provide clearer photo" } `
            -Response $response.Data `
            -Duration $response.Duration
    } else {
        Write-TestError "POST /verification/requests/:id/request-info -> $($response.StatusCode)"
        Add-TestResult -Name "Request more information" -Status "failed" `
            -Endpoint "POST /verification/requests/:id/request-info" `
            -ErrorMessage $response.Error
    }
} else {
    Write-TestWarn "No pending verification request found - skipping"
    Add-TestResult -Name "Request more information" -Status "skipped" `
        -Endpoint "POST /verification/requests/:id/request-info" `
        -ErrorMessage "No pending request"
}

# ============================================
# SCENARIO 4: Approve Verification Request
# ============================================
Write-TestHeader "SCENARIO 4: Approve Verification Request"

if ($Global:PendingVerificationId) {
    $response = Invoke-ApiRequest `
        -Method POST `
        -Endpoint "/verification/requests/$Global:PendingVerificationId/approve" `
        -Body @{
            notes = "All documents verified successfully"
        } `
        -UseSession `
        -ExpectedStatus 200
    
    if ($response.Success) {
        Write-TestSuccess "POST /verification/requests/:id/approve -> $($response.StatusCode) ($($response.Duration)ms)"
        Write-Host "  Status: $($response.Data.data.status)"
        Write-Host "  Approved At: $($response.Data.data.reviewedAt)"
        
        Add-TestResult -Name "Approve verification request" -Status "passed" `
            -Endpoint "POST /verification/requests/:id/approve" `
            -Request @{ notes = "All documents verified" } `
            -Response $response.Data `
            -Duration $response.Duration
    } else {
        Write-TestError "POST /verification/requests/:id/approve -> $($response.StatusCode)"
        Add-TestResult -Name "Approve verification request" -Status "failed" `
            -Endpoint "POST /verification/requests/:id/approve" `
            -ErrorMessage $response.Error
    }
} else {
    Write-TestWarn "No pending verification request found - skipping"
    Add-TestResult -Name "Approve verification request" -Status "skipped" `
        -Endpoint "POST /verification/requests/:id/approve" `
        -ErrorMessage "No pending request"
}

# Complete test suite
Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-admin-verification.json"

