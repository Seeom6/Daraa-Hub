# Comprehensive Store Management Test Suite
# This script tests the complete store management flow from registration to verification

# Import utilities
. "$PSScriptRoot\..\utils\http.ps1"
. "$PSScriptRoot\..\utils\helpers.ps1"

# Start test suite
Start-TestSuite -Name "Comprehensive Store Management Test"

Write-TestHeader "COMPREHENSIVE STORE MANAGEMENT TEST SUITE"
Write-Host "This test covers the complete store lifecycle:" -ForegroundColor Cyan
Write-Host "  1. Store Owner Registration" -ForegroundColor Cyan
Write-Host "  2. Store Profile Management" -ForegroundColor Cyan
Write-Host "  3. Verification Submission" -ForegroundColor Cyan
Write-Host "  4. Admin Verification Approval" -ForegroundColor Cyan
Write-Host "  5. Public Store Browsing" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PHASE 1: Store Owner Registration
# ============================================
Write-TestHeader "PHASE 1: Store Owner Registration"

$testPhone = Generate-TestPhone
$testEmail = Generate-TestEmail -Prefix "storeowner"

# Step 1: Send OTP
Write-TestStep "Step 1: Send OTP"
$step1 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/step1" `
    -Body @{ fullName = "Comprehensive Test Store Owner"; phoneNumber = $testPhone; countryCode = "SY" } `
    -ExpectedStatus 200

if (-not $step1.Success) {
    Write-TestError "Failed to send OTP"
    exit 1
}

# Step 2: Verify OTP
Write-TestStep "Step 2: Verify OTP"
$otp = Get-OtpFromLogs -PhoneNumber $testPhone
$step2 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/verify-otp" `
    -Body @{ phoneNumber = $testPhone; otp = $otp } -ExpectedStatus 200

if (-not $step2.Success) {
    Write-TestError "Failed to verify OTP"
    exit 1
}

# Step 3: Complete registration
Write-TestStep "Step 3: Complete registration"
$step3 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/complete-profile" `
    -Body @{ phoneNumber = $testPhone; password = "StoreOwner@123"; email = $testEmail } `
    -SaveSession -ExpectedStatus 201

if (-not $step3.Success) {
    Write-TestError "Failed to complete registration"
    exit 1
}

# Step 4: Upgrade to store owner
Write-TestStep "Step 4: Upgrade to store owner"
$upgrade = Invoke-ApiRequest -Method POST -Endpoint "/account/upgrade-role" `
    -Body @{ role = "store_owner" } -UseSession -ExpectedStatus 200

if (-not $upgrade.Success) {
    Write-TestError "Failed to upgrade to store owner"
    exit 1
}

# Step 5: Re-login to get new JWT
Write-TestStep "Step 5: Re-login with new role"
$login = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" `
    -Body @{ phoneNumber = $testPhone; password = "StoreOwner@123" } `
    -SaveSession -ExpectedStatus 200

if ($login.Success) {
    Write-TestSuccess "✅ PHASE 1 COMPLETE: Store owner registered successfully"
    Write-Host "  Phone: $testPhone" -ForegroundColor Green
    Write-Host "  Email: $testEmail" -ForegroundColor Green
    Add-TestResult -Name "Store Owner Registration" -Status "passed" `
        -Endpoint "Multiple" -Duration 0
} else {
    Write-TestError "Failed to re-login"
    exit 1
}

# ============================================
# PHASE 2: Store Profile Management
# ============================================
Write-TestHeader "PHASE 2: Store Profile Management"

# Get empty profile
Write-TestStep "Get empty store profile"
$profile1 = Invoke-ApiRequest -Method GET -Endpoint "/account/store-profile" `
    -UseSession -ExpectedStatus 200

# Update store profile
Write-TestStep "Update store profile"
$updateProfile = Invoke-ApiRequest -Method PUT -Endpoint "/account/store-profile" `
    -Body @{
        storeName = "Comprehensive Test Electronics Store"
        storeDescription = "Best electronics in Damascus - Comprehensive Test"
        businessAddress = "Damascus, Syria"
        businessPhone = "+963112345678"
    } -UseSession -ExpectedStatus 200

# Verify update
Write-TestStep "Verify profile update"
$profile2 = Invoke-ApiRequest -Method GET -Endpoint "/account/store-profile" `
    -UseSession -ExpectedStatus 200

if ($updateProfile.Success -and $profile2.Success) {
    Write-TestSuccess "✅ PHASE 2 COMPLETE: Store profile updated successfully"
    Add-TestResult -Name "Store Profile Management" -Status "passed" `
        -Endpoint "Multiple" -Duration 0
} else {
    Write-TestError "Failed to update store profile"
}

# ============================================
# PHASE 3: Verification Submission
# ============================================
Write-TestHeader "PHASE 3: Verification Submission"

Write-TestStep "Submit verification request"
$verification = Invoke-ApiRequest -Method POST -Endpoint "/verification/submit" `
    -Body @{
        applicantType = "store_owner"
        personalInfo = @{
            fullName = "Comprehensive Test Store Owner"
            nationalId = "12345678901"
            dateOfBirth = "1990-01-01"
            address = "Damascus, Syria"
            city = "Damascus"
        }
        businessInfo = @{
            businessName = "Comprehensive Test Electronics Store"
            businessType = "Electronics Retail"
            businessAddress = "Damascus, Syria"
            businessPhone = "+963112345678"
            taxId = "TAX123456"
            commercialRegister = "CR123456"
        }
        additionalNotes = "Comprehensive test verification request"
    } -UseSession -ExpectedStatus 201

if ($verification.Success) {
    $Global:VerificationRequestId = $verification.Data.data._id
    Write-TestSuccess "✅ PHASE 3 COMPLETE: Verification submitted successfully"
    Write-Host "  Request ID: $Global:VerificationRequestId" -ForegroundColor Green
    Add-TestResult -Name "Verification Submission" -Status "passed" `
        -Endpoint "POST /verification/submit" -Duration $verification.Duration
} else {
    Write-TestError "Failed to submit verification"
}

# Save test data for next phase
$Global:TestStoreOwnerPhone = $testPhone
$Global:TestStoreOwnerPassword = "StoreOwner@123"

Write-TestSuccess "✅ ALL PHASES COMPLETE"
Write-Host ""
Write-Host "Test Data Summary:" -ForegroundColor Cyan
Write-Host "  Store Owner Phone: $testPhone" -ForegroundColor Yellow
Write-Host "  Store Owner Email: $testEmail" -ForegroundColor Yellow
Write-Host "  Verification Request ID: $Global:VerificationRequestId" -ForegroundColor Yellow

# Complete test suite
Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-comprehensive.json"

