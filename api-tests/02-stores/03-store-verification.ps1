# Import utilities
. "$PSScriptRoot\..\utils\http.ps1"
. "$PSScriptRoot\..\utils\helpers.ps1"

# Start test suite
Start-TestSuite -Name "Store Verification Process"

Write-TestHeader "TEST SUITE: Store Verification Process"

# ============================================
# SETUP: Login as existing store owner
# ============================================
Write-TestHeader "SETUP: Login as Store Owner"

# Use the test account from Phase 0
$loginResponse = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/login" `
    -Body @{
        phoneNumber = "+963991234569"
        password = "StoreOwner@123"
    } `
    -SaveSession `
    -ExpectedStatus 200

if ($loginResponse.Success) {
    Write-TestSuccess "Logged in as store owner"
} else {
    Write-TestError "Failed to login as store owner"
    Write-Host "Creating new store owner account..."
    
    # Register new store owner
    $testPhone = Generate-TestPhone
    
    # Step 1: Send OTP
    $step1 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/step1" `
        -Body @{ fullName = "Test Store Owner"; phoneNumber = $testPhone; countryCode = "SY" } -ExpectedStatus 200
    
    if ($step1.Success) {
        $otp = Get-OtpFromLogs -PhoneNumber $testPhone
        
        # Step 2: Verify OTP
        $step2 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/verify-otp" `
            -Body @{ phoneNumber = $testPhone; otp = $otp } -ExpectedStatus 200
        
        # Step 3: Complete registration
        $step3 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/complete-profile" `
            -Body @{
                phoneNumber = $testPhone
                password = "StoreOwner@123"
                email = (Generate-TestEmail -Prefix "storeowner")
            } -SaveSession -ExpectedStatus 201

        if ($step3.Success) {
            # Step 4: Upgrade to store owner
            $upgrade = Invoke-ApiRequest -Method POST -Endpoint "/account/upgrade-role" `
                -Body @{ role = "store_owner" } -UseSession -ExpectedStatus 200

            if ($upgrade.Success) {
                # Step 5: Re-login to get new JWT
                $login = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" `
                    -Body @{ phoneNumber = $testPhone; password = "StoreOwner@123" } `
                    -SaveSession -ExpectedStatus 200

                if ($login.Success) {
                    Write-TestSuccess "New store owner created: $testPhone"
                }
            }
        }
    }
}

# ============================================
# SCENARIO 1: Check Verification Status (Before Submission)
# ============================================
Write-TestHeader "SCENARIO 1: Check Verification Status (Before Submission)"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/verification/my-status" `
    -UseSession `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /verification/my-status -> $($response.StatusCode) ($($response.Duration)ms)"
    
    if ($response.Data.data) {
        Write-Host "  Status: $($response.Data.data.status)"
    } else {
        Write-Host "  No verification request found"
    }
    
    Add-TestResult -Name "Check verification status (before)" -Status "passed" `
        -Endpoint "GET /verification/my-status" `
        -Request @{} `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "GET /verification/my-status -> $($response.StatusCode)"
    Add-TestResult -Name "Check verification status (before)" -Status "failed" `
        -Endpoint "GET /verification/my-status" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 2: Submit Verification Request
# ============================================
Write-TestHeader "SCENARIO 2: Submit Verification Request"

$response = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/verification/submit" `
    -Body @{
        applicantType = "store_owner"
        personalInfo = @{
            fullName = "Test Store Owner"
            nationalId = "12345678901"
            dateOfBirth = "1990-01-01"
            address = "Damascus, Syria"
            city = "Damascus"
        }
        businessInfo = @{
            businessName = "Test Electronics Store"
            businessType = "Electronics Retail"
            businessAddress = "Damascus, Syria"
            businessPhone = "+963112345678"
            taxId = "TAX123456"
            commercialRegister = "CR123456"
        }
        additionalNotes = "This is a test verification request"
    } `
    -UseSession `
    -ExpectedStatus 201

if ($response.Success) {
    Write-TestSuccess "POST /verification/submit -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Request ID: $($response.Data.data._id)"
    Write-Host "  Status: $($response.Data.data.status)"
    
    $Global:VerificationRequestId = $response.Data.data._id
    
    Add-TestResult -Name "Submit verification request" -Status "passed" `
        -Endpoint "POST /verification/submit" `
        -Request @{
            documentType = "national_id"
            businessName = "Test Electronics Store"
        } `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "POST /verification/submit -> $($response.StatusCode)"
    Add-TestResult -Name "Submit verification request" -Status "failed" `
        -Endpoint "POST /verification/submit" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 3: Check Verification Status (After Submission)
# ============================================
Write-TestHeader "SCENARIO 3: Check Verification Status (After Submission)"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/verification/my-status" `
    -UseSession `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /verification/my-status -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Status: $($response.Data.data.status)"
    Write-Host "  Submitted At: $($response.Data.data.submittedAt)"
    
    Add-TestResult -Name "Check verification status (after)" -Status "passed" `
        -Endpoint "GET /verification/my-status" `
        -Request @{} `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "GET /verification/my-status -> $($response.StatusCode)"
    Add-TestResult -Name "Check verification status (after)" -Status "failed" `
        -Endpoint "GET /verification/my-status" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 4: Duplicate Verification Submission (Should Fail)
# ============================================
Write-TestHeader "SCENARIO 4: Duplicate Verification Submission"

$response = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/verification/submit" `
    -Body @{
        applicantType = "store_owner"
        personalInfo = @{
            fullName = "Test Store Owner"
            nationalId = "12345678901"
            dateOfBirth = "1990-01-01"
            address = "Damascus, Syria"
            city = "Damascus"
        }
        businessInfo = @{
            businessName = "Test Electronics Store"
            businessType = "Electronics Retail"
            businessAddress = "Damascus, Syria"
            businessPhone = "+963112345678"
            taxId = "TAX123456"
            commercialRegister = "CR123456"
        }
    } `
    -UseSession `
    -ExpectedStatus 400

if ($response.StatusCode -eq 400 -or $response.StatusCode -eq 409) {
    Write-TestSuccess "POST /verification/submit -> $($response.StatusCode) [Expected]"
    Write-Host "  Correctly rejected duplicate submission"
    
    Add-TestResult -Name "Reject duplicate verification" -Status "passed" `
        -Endpoint "POST /verification/submit" `
        -Request @{} `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "POST /verification/submit -> $($response.StatusCode) (Expected: 400 or 409)"
    Add-TestResult -Name "Reject duplicate verification" -Status "failed" `
        -Endpoint "POST /verification/submit" `
        -ErrorMessage "Should reject duplicate submission"
}

# Complete test suite
Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-store-verification.json"

