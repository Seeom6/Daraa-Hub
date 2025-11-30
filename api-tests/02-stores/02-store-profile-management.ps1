# Import utilities
. "$PSScriptRoot\..\utils\http.ps1"
. "$PSScriptRoot\..\utils\helpers.ps1"

# Start test suite
Start-TestSuite -Name "Store Profile Management"

Write-TestHeader "TEST SUITE: Store Profile Management"

# ============================================
# SETUP: Register and login as store owner
# ============================================
Write-TestHeader "SETUP: Register Store Owner Account"

$testPhone = Generate-TestPhone
$testEmail = Generate-TestEmail -Prefix "storeowner"

# Step 1: Send OTP
$step1Response = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/register/step1" `
    -Body @{
        fullName = "Test Store Owner"
        phoneNumber = $testPhone
        countryCode = "SY"
    } `
    -ExpectedStatus 200

if ($step1Response.Success) {
    Write-TestSuccess "Step 1: OTP sent -> $($step1Response.StatusCode)"
    
    # Extract OTP from logs
    $otp = Get-OtpFromLogs -PhoneNumber $testPhone
    
    if ($otp) {
        Write-TestSuccess "OTP extracted: $otp"
        
        # Step 2: Verify OTP
        $step2Response = Invoke-ApiRequest `
            -Method POST `
            -Endpoint "/auth/register/verify-otp" `
            -Body @{
                phoneNumber = $testPhone
                otp = $otp
            } `
            -ExpectedStatus 200
        
        if ($step2Response.Success) {
            Write-TestSuccess "Step 2: OTP verified -> $($step2Response.StatusCode)"
            
            # Step 3: Complete registration
            $step3Response = Invoke-ApiRequest `
                -Method POST `
                -Endpoint "/auth/register/complete-profile" `
                -Body @{
                    phoneNumber = $testPhone
                    password = "StoreOwner@123"
                    email = $testEmail
                } `
                -SaveSession `
                -ExpectedStatus 201

            if ($step3Response.Success) {
                Write-TestSuccess "Step 3: Registration completed -> $($step3Response.StatusCode)"

                # Step 4: Upgrade to store owner
                $upgradeResponse = Invoke-ApiRequest `
                    -Method POST `
                    -Endpoint "/account/upgrade-role" `
                    -Body @{
                        role = "store_owner"
                    } `
                    -UseSession `
                    -ExpectedStatus 200

                if ($upgradeResponse.Success) {
                    Write-TestSuccess "Step 4: Upgraded to store owner -> $($upgradeResponse.StatusCode)"

                    # Step 5: Re-login to get new JWT with updated role
                    $loginResponse = Invoke-ApiRequest `
                        -Method POST `
                        -Endpoint "/auth/login" `
                        -Body @{
                            phoneNumber = $testPhone
                            password = "StoreOwner@123"
                        } `
                        -SaveSession `
                        -ExpectedStatus 200

                    if ($loginResponse.Success) {
                        Write-TestSuccess "Step 5: Re-logged in with new role -> $($loginResponse.StatusCode)"
                        Write-Host "  Phone: $testPhone"
                        Write-Host "  Email: $testEmail"
                        Write-Host "  Role: store_owner"
                    }
                }
            }
        }
    }
}

# ============================================
# SCENARIO 1: Get Store Profile (Empty)
# ============================================
Write-TestHeader "SCENARIO 1: Get Store Profile (Empty)"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/account/store-profile" `
    -UseSession `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /account/store-profile -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Store Name: $($response.Data.data.storeName)"
    Write-Host "  Verification Status: $($response.Data.data.verificationStatus)"
    
    Add-TestResult -Name "Get empty store profile" -Status "passed" `
        -Endpoint "GET /account/store-profile" `
        -Request @{} `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "GET /account/store-profile -> $($response.StatusCode)"
    Add-TestResult -Name "Get empty store profile" -Status "failed" `
        -Endpoint "GET /account/store-profile" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 2: Update Store Profile
# ============================================
Write-TestHeader "SCENARIO 2: Update Store Profile"

$response = Invoke-ApiRequest `
    -Method PUT `
    -Endpoint "/account/store-profile" `
    -Body @{
        storeName = "Test Electronics Store"
        storeDescription = "Best electronics in Damascus"
        businessAddress = "Damascus, Syria"
        businessPhone = "+963112345678"
    } `
    -UseSession `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "PUT /account/store-profile -> $($response.StatusCode) ($($response.Duration)ms)"
    Write-Host "  Store Name: $($response.Data.data.storeName)"
    Write-Host "  Description: $($response.Data.data.storeDescription)"
    
    Add-TestResult -Name "Update store profile" -Status "passed" `
        -Endpoint "PUT /account/store-profile" `
        -Request @{
            storeName = "Test Electronics Store"
            storeDescription = "Best electronics in Damascus"
        } `
        -Response $response.Data `
        -Duration $response.Duration
} else {
    Write-TestError "PUT /account/store-profile -> $($response.StatusCode)"
    Add-TestResult -Name "Update store profile" -Status "failed" `
        -Endpoint "PUT /account/store-profile" `
        -ErrorMessage $response.Error
}

# ============================================
# SCENARIO 3: Get Updated Store Profile
# ============================================
Write-TestHeader "SCENARIO 3: Get Updated Store Profile"

$response = Invoke-ApiRequest `
    -Method GET `
    -Endpoint "/account/store-profile" `
    -UseSession `
    -ExpectedStatus 200

if ($response.Success) {
    Write-TestSuccess "GET /account/store-profile -> $($response.StatusCode) ($($response.Duration)ms)"
    
    $storeName = $response.Data.data.storeName
    if ($storeName -eq "Test Electronics Store") {
        Write-TestSuccess "Store name updated correctly"
        Add-TestResult -Name "Verify store profile update" -Status "passed" `
            -Endpoint "GET /account/store-profile" `
            -Request @{} `
            -Response $response.Data `
            -Duration $response.Duration
    } else {
        Write-TestError "Store name not updated (Expected: 'Test Electronics Store', Got: '$storeName')"
        Add-TestResult -Name "Verify store profile update" -Status "failed" `
            -Endpoint "GET /account/store-profile" `
            -ErrorMessage "Store name mismatch"
    }
} else {
    Write-TestError "GET /account/store-profile -> $($response.StatusCode)"
    Add-TestResult -Name "Verify store profile update" -Status "failed" `
        -Endpoint "GET /account/store-profile" `
        -ErrorMessage $response.Error
}

# Complete test suite
Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-store-profile.json"

