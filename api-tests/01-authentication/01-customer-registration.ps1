# Test: Customer Registration
# Tests the complete customer registration flow with all scenarios

# Import utilities
. "$PSScriptRoot\..\utils\http-client.ps1"
. "$PSScriptRoot\..\utils\test-helpers.ps1"

Start-TestSuite -Name "Customer Registration"

# Test Data
$testPhone = Generate-TestPhone
$testEmail = Generate-TestEmail -Prefix "customer"
$testPassword = "Customer@123"
$testFullName = "Test Customer User"

Write-TestHeader "SCENARIO 1: Successful Customer Registration (Happy Path)"

# Step 1: Send OTP
Write-TestStep "Step 1: Send OTP to phone number"
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
    Add-TestResult -Name "Send OTP" -Status "passed" -Endpoint "POST /auth/register/step1" -Response $step1Response -Duration $step1Response.Duration
    
    # Extract OTP from logs
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
            Add-TestResult -Name "Verify OTP" -Status "passed" -Endpoint "POST /auth/register/verify-otp" -Response $step2Response -Duration $step2Response.Duration
            
            # Step 3: Complete Profile
            Write-TestStep "Step 3: Complete profile and create account"
            $step3Response = Invoke-ApiRequest `
                -Method POST `
                -Endpoint "/auth/register/complete-profile" `
                -Body @{
                    phoneNumber = $testPhone
                    password = $testPassword
                    email = $testEmail
                } `
                -SaveSession `
                -ExpectedStatus 201
            
            if ($step3Response.Success) {
                Add-TestResult -Name "Complete Profile" -Status "passed" -Endpoint "POST /auth/register/complete-profile" -Response $step3Response -Duration $step3Response.Duration
                
                # Verify response data
                Assert-Equal -Expected "customer" -Actual $step3Response.Content.role -Message "Role should be customer"
                Assert-NotNull -Value $step3Response.Cookies -Message "Cookies should be set"
                
                Write-TestSuccess "Customer registration completed successfully!"
                Write-Host "  Phone: $testPhone" -ForegroundColor Gray
                Write-Host "  Email: $testEmail" -ForegroundColor Gray
                Write-Host "  Role: customer" -ForegroundColor Gray
            } else {
                Add-TestResult -Name "Complete Profile" -Status "failed" -Endpoint "POST /auth/register/complete-profile" -ErrorMessage $step3Response.Error
            }
        } else {
            Add-TestResult -Name "Verify OTP" -Status "failed" -Endpoint "POST /auth/register/verify-otp" -ErrorMessage $step2Response.Error
        }
    } else {
        Add-TestResult -Name "Extract OTP from logs" -Status "failed" -ErrorMessage "Could not extract OTP"
    }
} else {
    Add-TestResult -Name "Send OTP" -Status "failed" -Endpoint "POST /auth/register/step1" -ErrorMessage $step1Response.Error
}

Write-TestHeader "SCENARIO 2: Duplicate Phone Number (Should Fail)"

Write-TestStep "Attempting to register with same phone number"
$duplicateResponse = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/register/step1" `
    -Body @{
        fullName = "Another User"
        phoneNumber = $testPhone
        countryCode = "SY"
    } `
    -ExpectedStatus 400

if (-not $duplicateResponse.Success -and $duplicateResponse.StatusCode -eq 400) {
    Add-TestResult -Name "Reject duplicate phone" -Status "passed" -Endpoint "POST /auth/register/step1" -Response $duplicateResponse -Duration $duplicateResponse.Duration
    Write-TestSuccess "Correctly rejected duplicate phone number"
} else {
    Add-TestResult -Name "Reject duplicate phone" -Status "failed" -Endpoint "POST /auth/register/step1" -ErrorMessage "Should reject duplicate phone"
}

Write-TestHeader "SCENARIO 3: Invalid OTP (Should Fail)"

$newPhone = Generate-TestPhone
Write-TestStep "Sending OTP to new phone number"
$otpResponse = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/register/step1" `
    -Body @{
        fullName = "Test User 2"
        phoneNumber = $newPhone
        countryCode = "SY"
    } `
    -ExpectedStatus 201

if ($otpResponse.Success) {
    Write-TestStep "Attempting to verify with wrong OTP"
    $wrongOtpResponse = Invoke-ApiRequest `
        -Method POST `
        -Endpoint "/auth/register/verify-otp" `
        -Body @{
            phoneNumber = $newPhone
            otp = "000000"
        } `
        -ExpectedStatus 400
    
    if (-not $wrongOtpResponse.Success -and $wrongOtpResponse.StatusCode -eq 400) {
        Add-TestResult -Name "Reject invalid OTP" -Status "passed" -Endpoint "POST /auth/register/verify-otp" -Response $wrongOtpResponse -Duration $wrongOtpResponse.Duration
        Write-TestSuccess "Correctly rejected invalid OTP"
    } else {
        Add-TestResult -Name "Reject invalid OTP" -Status "failed" -Endpoint "POST /auth/register/verify-otp" -ErrorMessage "Should reject invalid OTP"
    }
}

Write-TestHeader "SCENARIO 4: Weak Password (Should Fail)"

$weakPasswordPhone = Generate-TestPhone
Write-TestStep "Testing weak password validation"

# Send and verify OTP first
$step1 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/step1" -Body @{ fullName = "Test User 3"; phoneNumber = $weakPasswordPhone; countryCode = "SY" } -ExpectedStatus 201
if ($step1.Success) {
    $otp = Get-OtpFromLogs -PhoneNumber $weakPasswordPhone
    if ($otp) {
        $step2 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/verify-otp" -Body @{ phoneNumber = $weakPasswordPhone; otp = $otp } -ExpectedStatus 200
        
        if ($step2.Success) {
            Write-TestStep "Attempting to complete profile with weak password"
            $weakPwdResponse = Invoke-ApiRequest `
                -Method POST `
                -Endpoint "/auth/register/complete-profile" `
                -Body @{
                    phoneNumber = $weakPasswordPhone
                    password = "123"
                    email = (Generate-TestEmail)
                } `
                -ExpectedStatus 400
            
            if (-not $weakPwdResponse.Success -and $weakPwdResponse.StatusCode -eq 400) {
                Add-TestResult -Name "Reject weak password" -Status "passed" -Endpoint "POST /auth/register/complete-profile" -Response $weakPwdResponse -Duration $weakPwdResponse.Duration
                Write-TestSuccess "Correctly rejected weak password"
            } else {
                Add-TestResult -Name "Reject weak password" -Status "failed" -Endpoint "POST /auth/register/complete-profile" -ErrorMessage "Should reject weak password"
            }
        }
    }
}

# Complete test suite
Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-customer-registration.json"

