# Test: Login Scenarios
# Tests all login scenarios including success and failure cases

# Import utilities
. "$PSScriptRoot\..\utils\http-client.ps1"
. "$PSScriptRoot\..\utils\test-helpers.ps1"

Start-TestSuite -Name "Login Scenarios"

# First, create a test customer account
$testPhone = Generate-TestPhone
$testEmail = Generate-TestEmail
$testPassword = "TestLogin@123"
$testFullName = "Login Test User"

Write-TestHeader "SETUP: Creating test account"

$setup1 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/step1" -Body @{ fullName = $testFullName; phoneNumber = $testPhone; countryCode = "SY" } -ExpectedStatus 201
if ($setup1.Success) {
    $otp = Get-OtpFromLogs -PhoneNumber $testPhone
    if ($otp) {
        $setup2 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/verify-otp" -Body @{ phoneNumber = $testPhone; otp = $otp } -ExpectedStatus 200
        if ($setup2.Success) {
            $setup3 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register/complete-profile" -Body @{ phoneNumber = $testPhone; password = $testPassword; email = $testEmail } -ExpectedStatus 201
            if ($setup3.Success) {
                Write-TestSuccess "Test account created successfully"
                Write-Host "  Phone: $testPhone" -ForegroundColor Gray
                Write-Host "  Password: $testPassword" -ForegroundColor Gray
            }
        }
    }
}

Clear-TestSession

Write-TestHeader "SCENARIO 1: Successful Login"

Write-TestStep "Logging in with correct credentials"
$loginResponse = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/login" `
    -Body @{
        phoneNumber = $testPhone
        password = $testPassword
    } `
    -SaveSession `
    -ExpectedStatus 200

if ($loginResponse.Success) {
    Add-TestResult -Name "Login with correct credentials" -Status "passed" -Endpoint "POST /auth/login" -Response $loginResponse -Duration $loginResponse.Duration
    
    Assert-Equal -Expected $true -Actual $loginResponse.Content.success -Message "Login should be successful"
    Assert-Equal -Expected "customer" -Actual $loginResponse.Content.data.role -Message "Role should be customer"
    Assert-NotNull -Value $loginResponse.Cookies -Message "Cookies should be set"
    
    Write-TestSuccess "Login successful!"
    Write-Host "  Role: $($loginResponse.Content.data.role)" -ForegroundColor Gray
    Write-Host "  Duration: $($loginResponse.Duration)ms" -ForegroundColor Gray
    
    # Verify we can access protected endpoint
    Write-TestStep "Verifying access to protected endpoint"
    $profileResponse = Invoke-ApiRequest `
        -Method GET `
        -Endpoint "/auth/me" `
        -UseSession `
        -ExpectedStatus 200
    
    if ($profileResponse.Success) {
        Add-TestResult -Name "Access protected endpoint" -Status "passed" -Endpoint "GET /auth/me" -Response $profileResponse -Duration $profileResponse.Duration
        Write-TestSuccess "Successfully accessed protected endpoint"
        Write-Host "  User ID: $($profileResponse.Content.data.userId)" -ForegroundColor Gray
        Write-Host "  Phone: $($profileResponse.Content.data.phone)" -ForegroundColor Gray
    } else {
        Add-TestResult -Name "Access protected endpoint" -Status "failed" -Endpoint "GET /auth/me" -ErrorMessage $profileResponse.Error
    }
} else {
    Add-TestResult -Name "Login with correct credentials" -Status "failed" -Endpoint "POST /auth/login" -ErrorMessage $loginResponse.Error
}

Clear-TestSession

Write-TestHeader "SCENARIO 2: Login with Wrong Password"

Write-TestStep "Attempting login with incorrect password"
$wrongPasswordResponse = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/login" `
    -Body @{
        phoneNumber = $testPhone
        password = "WrongPassword@123"
    } `
    -ExpectedStatus 401

if (-not $wrongPasswordResponse.Success -and $wrongPasswordResponse.StatusCode -eq 401) {
    Add-TestResult -Name "Reject wrong password" -Status "passed" -Endpoint "POST /auth/login" -Response $wrongPasswordResponse -Duration $wrongPasswordResponse.Duration
    Write-TestSuccess "Correctly rejected wrong password"
    Write-Host "  Error: $($wrongPasswordResponse.Content.message)" -ForegroundColor Gray
} else {
    Add-TestResult -Name "Reject wrong password" -Status "failed" -Endpoint "POST /auth/login" -ErrorMessage "Should reject wrong password"
}

Write-TestHeader "SCENARIO 3: Login with Non-existent Phone"

Write-TestStep "Attempting login with non-existent phone number"
$nonExistentResponse = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/login" `
    -Body @{
        phoneNumber = "+963999999999"
        password = "SomePassword@123"
    } `
    -ExpectedStatus 401

if (-not $nonExistentResponse.Success -and $nonExistentResponse.StatusCode -eq 401) {
    Add-TestResult -Name "Reject non-existent phone" -Status "passed" -Endpoint "POST /auth/login" -Response $nonExistentResponse -Duration $nonExistentResponse.Duration
    Write-TestSuccess "Correctly rejected non-existent phone number"
} else {
    Add-TestResult -Name "Reject non-existent phone" -Status "failed" -Endpoint "POST /auth/login" -ErrorMessage "Should reject non-existent phone"
}

Write-TestHeader "SCENARIO 4: Login with Invalid Phone Format"

Write-TestStep "Attempting login with invalid phone format"
$invalidFormatResponse = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/login" `
    -Body @{
        phoneNumber = "123"
        password = "SomePassword@123"
    } `
    -ExpectedStatus 400

if (-not $invalidFormatResponse.Success -and $invalidFormatResponse.StatusCode -eq 400) {
    Add-TestResult -Name "Reject invalid phone format" -Status "passed" -Endpoint "POST /auth/login" -Response $invalidFormatResponse -Duration $invalidFormatResponse.Duration
    Write-TestSuccess "Correctly rejected invalid phone format"
} else {
    Add-TestResult -Name "Reject invalid phone format" -Status "failed" -Endpoint "POST /auth/login" -ErrorMessage "Should reject invalid phone format"
}

Write-TestHeader "SCENARIO 5: Multiple Login Sessions"

Write-TestStep "Creating first session"
$session1Response = Invoke-ApiRequest `
    -Method POST `
    -Endpoint "/auth/login" `
    -Body @{
        phoneNumber = $testPhone
        password = $testPassword
    } `
    -SaveSession `
    -ExpectedStatus 200

if ($session1Response.Success) {
    $session1 = $Global:TestSession
    
    Write-TestStep "Creating second session"
    Clear-TestSession
    
    $session2Response = Invoke-ApiRequest `
        -Method POST `
        -Endpoint "/auth/login" `
        -Body @{
            phoneNumber = $testPhone
            password = $testPassword
        } `
        -SaveSession `
        -ExpectedStatus 200
    
    if ($session2Response.Success) {
        Add-TestResult -Name "Multiple sessions allowed" -Status "passed" -Endpoint "POST /auth/login" -Response $session2Response -Duration $session2Response.Duration
        Write-TestSuccess "Multiple sessions created successfully"
        
        # Verify both sessions are valid
        Write-TestStep "Verifying first session is still valid"
        $Global:TestSession = $session1
        $verify1 = Invoke-ApiRequest -Method GET -Endpoint "/auth/me" -UseSession -ExpectedStatus 200
        
        if ($verify1.Success) {
            Write-TestSuccess "First session still valid"
        }
        
        Write-TestStep "Verifying second session is valid"
        Clear-TestSession
        $verify2 = Invoke-ApiRequest -Method GET -Endpoint "/auth/me" -UseSession -ExpectedStatus 200
        
        if ($verify2.Success) {
            Write-TestSuccess "Second session valid"
        }
    }
}

# Complete test suite
Complete-TestSuite -OutputFile "$PSScriptRoot\test-results-login-scenarios.json"

