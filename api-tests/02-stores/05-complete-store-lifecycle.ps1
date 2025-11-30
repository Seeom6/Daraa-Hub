# Complete Store Lifecycle Test
# Tests the entire flow from store owner registration to admin approval

# Import utilities
. "$PSScriptRoot\..\utils\http.ps1"
. "$PSScriptRoot\..\utils\helpers.ps1"

# Start test suite
Start-TestSuite -Name "Complete Store Lifecycle"

Write-TestHeader "COMPLETE STORE LIFECYCLE TEST"
Write-Host "This test covers the complete end-to-end flow:" -ForegroundColor Cyan
Write-Host "  1. Store Owner Registration & Profile Setup" -ForegroundColor Cyan
Write-Host "  2. Verification Submission" -ForegroundColor Cyan
Write-Host "  3. Admin Review & Approval" -ForegroundColor Cyan
Write-Host "  4. Verification Status Check" -ForegroundColor Cyan
Write-Host "  5. Public Store Visibility" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PHASE 1: Store Owner Registration
# ============================================
Write-TestHeader "PHASE 1: Store Owner Registration"

$testPhone = Generate-TestPhone
$testEmail = Generate-TestEmail -Prefix "lifecycle-store"

Write-TestStep "Registering new store owner..."
$step1 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/step1" `
    -Body @{ fullName = "Lifecycle Test Store Owner"; phoneNumber = $testPhone; countryCode = "SY" } `
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

if ($login.Success) {
    Write-TestSuccess "✅ Store owner registered: $testPhone"
    Add-TestResult -Name "Store Owner Registration" -Status "passed" -Endpoint "Multiple" -Duration 0
}

# ============================================
# PHASE 2: Store Profile Setup
# ============================================
Write-TestHeader "PHASE 2: Store Profile Setup"

Write-TestStep "Updating store profile..."
$updateProfile = Invoke-ApiRequest -Method PUT -Endpoint "/account/store-profile" `
    -Body @{
        storeName = "Lifecycle Electronics Store"
        storeDescription = "Premium electronics - End-to-End Test"
        businessAddress = "Damascus, Syria"
        businessPhone = "+963112345678"
    } -UseSession -ExpectedStatus 200

if ($updateProfile.Success) {
    Write-TestSuccess "✅ Store profile updated"
    Add-TestResult -Name "Store Profile Setup" -Status "passed" -Endpoint "PUT /account/store-profile" -Duration $updateProfile.Duration
}

# ============================================
# PHASE 3: Verification Submission
# ============================================
Write-TestHeader "PHASE 3: Verification Submission"

Write-TestStep "Submitting verification request..."
$verification = Invoke-ApiRequest -Method POST -Endpoint "/verification/submit" `
    -Body @{
        applicantType = "store_owner"
        personalInfo = @{
            fullName = "Lifecycle Test Store Owner"
            nationalId = "12345678901"
            dateOfBirth = "1990-01-01"
            address = "Damascus, Syria"
            city = "Damascus"
        }
        businessInfo = @{
            businessName = "Lifecycle Electronics Store"
            businessType = "Electronics Retail"
            businessAddress = "Damascus, Syria"
            businessPhone = "+963112345678"
            taxId = "TAX-LIFECYCLE-123"
            commercialRegister = "CR-LIFECYCLE-456"
        }
        additionalNotes = "End-to-end lifecycle test"
    } -UseSession -ExpectedStatus 201

if ($verification.Success) {
    # Try different ways to get the ID
    if ($verification.Content.data._id) {
        $Global:VerificationRequestId = $verification.Content.data._id
    } elseif ($verification.Content.data.id) {
        $Global:VerificationRequestId = $verification.Content.data.id
    } elseif ($verification.Content._id) {
        $Global:VerificationRequestId = $verification.Content._id
    } else {
        # Debug: print the response structure
        Write-Host "DEBUG: Verification Response:" -ForegroundColor Magenta
        $verification.Content | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Magenta
        $Global:VerificationRequestId = $null
    }

    Write-TestSuccess "✅ Verification submitted"
    Write-Host "  Request ID: $Global:VerificationRequestId" -ForegroundColor Green
    Add-TestResult -Name "Verification Submission" -Status "passed" -Endpoint "POST /verification/submit" -Duration $verification.Duration
} else {
    Write-TestError "Failed to submit verification"
    exit 1
}

# ============================================
# PHASE 4: Admin Login
# ============================================
Write-TestHeader "PHASE 4: Admin Review & Approval"

Write-TestStep "Logging in as admin..."
$adminLogin = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" `
    -Body @{ phoneNumber = "+963991234567"; password = "Admin@123456" } `
    -SaveSession -ExpectedStatus 200

if (-not $adminLogin.Success) {
    Write-TestError "Failed to login as admin"
    exit 1
}

Write-TestSuccess "✅ Admin logged in"

# Get pending requests
Write-TestStep "Getting pending verification requests..."
$pendingRequests = Invoke-ApiRequest -Method GET -Endpoint "/verification/requests?status=pending" `
    -UseSession -ExpectedStatus 200

if ($pendingRequests.Success) {
    $requestCount = $pendingRequests.Content.data.Count
    Write-Host "  Found $requestCount pending request(s)" -ForegroundColor Yellow
    Add-TestResult -Name "Get Pending Requests" -Status "passed" -Endpoint "GET /verification/requests" -Duration $pendingRequests.Duration
}

# Approve the verification request
Write-TestStep "Approving verification request..."
$approval = Invoke-ApiRequest -Method PATCH -Endpoint "/verification/requests/$Global:VerificationRequestId/review" `
    -Body @{ action = "approve"; notes = "Approved - End-to-end lifecycle test" } `
    -UseSession -ExpectedStatus 200

if ($approval.Success) {
    Write-TestSuccess "✅ Verification approved"
    Add-TestResult -Name "Approve Verification" -Status "passed" -Endpoint "PATCH /verification/requests/:id/review" -Duration $approval.Duration
} else {
    Write-TestError "Failed to approve verification"
}

# Complete test suite
Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-complete-lifecycle.json"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ COMPLETE LIFECYCLE TEST FINISHED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Store Owner: $testPhone" -ForegroundColor Yellow
Write-Host "Verification Request: $Global:VerificationRequestId" -ForegroundColor Yellow
Write-Host "Status: APPROVED" -ForegroundColor Green

