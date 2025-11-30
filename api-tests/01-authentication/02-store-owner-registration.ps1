# Test: Store Owner Registration
# Tests store owner registration with verification requirements

# Import utilities
. "$PSScriptRoot\..\utils\http-client.ps1"
. "$PSScriptRoot\..\utils\test-helpers.ps1"

Start-TestSuite -Name "Store Owner Registration"

# Test Data
$testPhone = Generate-TestPhone
$testEmail = Generate-TestEmail -Prefix "storeowner"
$testPassword = "StoreOwner@123"
$testFullName = "Test Store Owner"

Write-TestHeader "SCENARIO 1: Store Owner Registration (Requires Verification)"

# Step 1: Send OTP
Write-TestStep "Step 1: Send OTP"
$step1Response = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/register/step1" `
    -Body @{
        fullName = $testFullName
        phoneNumber = $testPhone
        countryCode = "SY"
    } `
    -ExpectedStatus 201

if ($step1Response.Success) {
    Add-TestResult -Name "Send OTP (Store Owner)" -Status "passed" -Endpoint "POST /auth/register/step1" -Response $step1Response -Duration $step1Response.Duration
    
    $otp = Get-OtpFromLogs -PhoneNumber $testPhone
    
    if ($otp) {
        # Step 2: Verify OTP
        Write-TestStep "Step 2: Verify OTP"
        $step2Response = Invoke-ApiRequest `
            -Method POST `
            -Endpoint "/auth/register/verify-otp" `
            -Body @{
                phoneNumber = $testPhone
                otp = $otp
            } `
            -ExpectedStatus 200
        
        if ($step2Response.Success) {
            Add-TestResult -Name "Verify OTP (Store Owner)" -Status "passed" -Endpoint "POST /auth/register/verify-otp" -Response $step2Response -Duration $step2Response.Duration
            
            # Step 3: Complete Profile as Store Owner
            Write-TestStep "Step 3: Complete profile as Store Owner"
            $step3Response = Invoke-ApiRequest `
                -Method POST `
                -Endpoint "/auth/register/complete-profile" `
                -Body @{
                    phoneNumber = $testPhone
                    password = $testPassword
                    email = $testEmail
                    role = "store_owner"
                } `
                -SaveSession `
                -ExpectedStatus 201
            
            if ($step3Response.Success) {
                Add-TestResult -Name "Complete Profile (Store Owner)" -Status "passed" -Endpoint "POST /auth/register/complete-profile" -Response $step3Response -Duration $step3Response.Duration
                
                Assert-Equal -Expected "store_owner" -Actual $step3Response.Content.role -Message "Role should be store_owner"
                
                Write-TestSuccess "Store Owner account created!"
                Write-Host "  Phone: $testPhone" -ForegroundColor Gray
                Write-Host "  Email: $testEmail" -ForegroundColor Gray
                Write-Host "  Role: store_owner" -ForegroundColor Gray
                Write-Host "  Status: Pending Verification" -ForegroundColor Yellow
                
                # Step 4: Check account status (should be unverified)
                Write-TestStep "Step 4: Check account verification status"
                $profileResponse = Invoke-ApiRequest `
                    -Method GET `
                    -Endpoint "/account/profile" `
                    -UseSession `
                    -ExpectedStatus 200
                
                if ($profileResponse.Success) {
                    $verificationStatus = $profileResponse.Content.verificationStatus
                    
                    if ($verificationStatus -eq "pending" -or $verificationStatus -eq "unverified") {
                        Add-TestResult -Name "Check verification status" -Status "passed" -Endpoint "GET /account/profile" -Response $profileResponse -Duration $profileResponse.Duration
                        Write-TestSuccess "Verification status is pending (as expected)"
                    } else {
                        Add-TestResult -Name "Check verification status" -Status "failed" -Endpoint "GET /account/profile" -ErrorMessage "Expected pending verification status"
                        Write-TestError "Unexpected verification status: $verificationStatus"
                    }
                }
                
                # Step 5: Try to create a store (should fail - not verified)
                Write-TestStep "Step 5: Attempt to create store (should fail - not verified)"
                $createStoreResponse = Invoke-ApiRequest `
                    -Method POST `
                    -Endpoint "/stores" `
                    -Body @{
                        name = "Test Store"
                        description = "Test store description"
                        categoryId = "507f1f77bcf86cd799439011"
                    } `
                    -UseSession `
                    -ExpectedStatus 403
                
                if (-not $createStoreResponse.Success -and $createStoreResponse.StatusCode -eq 403) {
                    Add-TestResult -Name "Reject store creation (unverified)" -Status "passed" -Endpoint "POST /stores" -Response $createStoreResponse -Duration $createStoreResponse.Duration
                    Write-TestSuccess "Correctly prevented unverified store owner from creating store"
                } else {
                    Add-TestResult -Name "Reject store creation (unverified)" -Status "failed" -Endpoint "POST /stores" -ErrorMessage "Should prevent unverified store owner from creating store"
                }
                
            } else {
                Add-TestResult -Name "Complete Profile (Store Owner)" -Status "failed" -Endpoint "POST /auth/register/complete-profile" -ErrorMessage $step3Response.Error
            }
        } else {
            Add-TestResult -Name "Verify OTP (Store Owner)" -Status "failed" -Endpoint "POST /auth/register/verify-otp" -ErrorMessage $step2Response.Error
        }
    }
} else {
    Add-TestResult -Name "Send OTP (Store Owner)" -Status "failed" -Endpoint "POST /auth/register/step1" -ErrorMessage $step1Response.Error
}

Write-TestHeader "SCENARIO 2: Submit Verification Documents"

if ($Global:TestSession) {
    Write-TestStep "Submitting verification documents"
    
    $verificationResponse = Invoke-ApiRequest `
        -Method POST `
        -Endpoint "/account/verification/submit" `
        -Body @{
            documentType = "national_id"
            documentNumber = "12345678901"
            businessName = "Test Business"
            businessAddress = "Damascus, Syria"
            taxNumber = "TAX123456"
        } `
        -UseSession `
        -ExpectedStatus 200
    
    if ($verificationResponse.Success) {
        Add-TestResult -Name "Submit verification documents" -Status "passed" -Endpoint "POST /account/verification/submit" -Response $verificationResponse -Duration $verificationResponse.Duration
        Write-TestSuccess "Verification documents submitted successfully"
        Write-Host "  Status: Pending Admin Approval" -ForegroundColor Yellow
    } else {
        Add-TestResult -Name "Submit verification documents" -Status "failed" -Endpoint "POST /account/verification/submit" -ErrorMessage $verificationResponse.Error
    }
}

Write-TestHeader "SCENARIO 3: Check Verification Status"

if ($Global:TestSession) {
    Write-TestStep "Checking verification status after submission"
    
    $statusResponse = Invoke-ApiRequest `
        -Method GET `
        -Endpoint "/account/verification/status" `
        -UseSession `
        -ExpectedStatus 200
    
    if ($statusResponse.Success) {
        Add-TestResult -Name "Check verification status" -Status "passed" -Endpoint "GET /account/verification/status" -Response $statusResponse -Duration $statusResponse.Duration
        
        $status = $statusResponse.Content.status
        Write-Host "  Current Status: $status" -ForegroundColor $(if ($status -eq "pending") { "Yellow" } else { "Gray" })
    } else {
        Add-TestResult -Name "Check verification status" -Status "failed" -Endpoint "GET /account/verification/status" -ErrorMessage $statusResponse.Error
    }
}

# Save test data for admin approval tests
$testData = @{
    phone = $testPhone
    email = $testEmail
    password = $testPassword
    role = "store_owner"
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

$testData | ConvertTo-Json | Out-File -FilePath "$PSScriptRoot\store-owner-test-data.json" -Encoding UTF8
Write-TestSuccess "Test data saved for admin approval tests"

# Complete test suite
Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-store-owner-registration.json"

