# Test: Customer Registration

. "$PSScriptRoot\..\utils\http.ps1"
. "$PSScriptRoot\..\utils\helpers.ps1"

Start-TestSuite -Name "Customer Registration"

# Test Data
$testPhone = Generate-TestPhone
$testEmail = Generate-TestEmail
$testPassword = "TestPass@123"
$testFullName = "Test Customer"

Write-TestHeader "SCENARIO 1: Successful Customer Registration"

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
    Add-TestResult -Name "Send OTP" -Status "passed" -Endpoint "POST /auth/register/step1" -Response $step1Response -Duration $step1Response.Duration
    
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
            Write-TestStep "Step 3: Complete profile"
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
                
                Write-TestSuccess "Customer account created successfully!"
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
        Add-TestResult -Name "Extract OTP" -Status "failed" -ErrorMessage "Could not extract OTP from logs"
    }
} else {
    Add-TestResult -Name "Send OTP" -Status "failed" -Endpoint "POST /auth/register/step1" -ErrorMessage $step1Response.Error
}

Write-TestHeader "SCENARIO 2: Duplicate Phone Number"

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

Write-TestHeader "SCENARIO 3: Invalid OTP"

$newPhone = Generate-TestPhone
$step1 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/step1" -Body @{ fullName = "Test User"; phoneNumber = $newPhone; countryCode = "SY" } -ExpectedStatus 201

if ($step1.Success) {
    Write-TestStep "Attempting to verify with invalid OTP"
    $invalidOtpResponse = Invoke-ApiRequest `
        -Method POST `
        -Endpoint "/auth/register/verify-otp" `
        -Body @{
            phoneNumber = $newPhone
            otp = "000000"
        } `
        -ExpectedStatus 400
    
    if (-not $invalidOtpResponse.Success -and $invalidOtpResponse.StatusCode -eq 400) {
        Add-TestResult -Name "Reject invalid OTP" -Status "passed" -Endpoint "POST /auth/register/verify-otp" -Response $invalidOtpResponse -Duration $invalidOtpResponse.Duration
        Write-TestSuccess "Correctly rejected invalid OTP"
    } else {
        Add-TestResult -Name "Reject invalid OTP" -Status "failed" -Endpoint "POST /auth/register/verify-otp" -ErrorMessage "Should reject invalid OTP"
    }
}

Write-TestHeader "SCENARIO 4: Weak Password"

$weakPhone = Generate-TestPhone
$s1 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/step1" -Body @{ fullName = "Test User"; phoneNumber = $weakPhone; countryCode = "SY" } -ExpectedStatus 201

if ($s1.Success) {
    $weakOtp = Get-OtpFromLogs -PhoneNumber $weakPhone
    if ($weakOtp) {
        $s2 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/verify-otp" -Body @{ phoneNumber = $weakPhone; otp = $weakOtp } -ExpectedStatus 200
        
        if ($s2.Success) {
            Write-TestStep "Attempting to complete profile with weak password"
            $weakPasswordResponse = Invoke-ApiRequest `
                -Method POST `
                -Endpoint "/auth/register/complete-profile" `
                -Body @{
                    phoneNumber = $weakPhone
                    password = "weak"
                    email = (Generate-TestEmail)
                } `
                -ExpectedStatus 400
            
            if (-not $weakPasswordResponse.Success -and $weakPasswordResponse.StatusCode -eq 400) {
                Add-TestResult -Name "Reject weak password" -Status "passed" -Endpoint "POST /auth/register/complete-profile" -Response $weakPasswordResponse -Duration $weakPasswordResponse.Duration
                Write-TestSuccess "Correctly rejected weak password"
            } else {
                Add-TestResult -Name "Reject weak password" -Status "failed" -Endpoint "POST /auth/register/complete-profile" -ErrorMessage "Should reject weak password"
            }
        }
    }
}

Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-customer-registration.json"

