# HTTP Client Utility

$Global:BaseUrl = "http://localhost:3001/api"
$Global:TestSession = $null

function Write-TestHeader {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "  $Message" -ForegroundColor Magenta
    Write-Host "========================================`n" -ForegroundColor Magenta
}

function Write-TestStep {
    param([string]$Message)
    Write-Host "> $Message" -ForegroundColor Cyan
}

function Write-TestSuccess {
    param([string]$Message)
    Write-Host "+ $Message" -ForegroundColor Green
}

function Write-TestError {
    param([string]$Message)
    Write-Host "- $Message" -ForegroundColor Red
}

function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{},
        [switch]$UseSession,
        [switch]$SaveSession,
        [int]$ExpectedStatus = 200
    )
    
    $url = "$Global:BaseUrl$Endpoint"
    $requestParams = @{
        Uri = $url
        Method = $Method
        ContentType = "application/json"
        Headers = $Headers
    }
    
    if ($Body) {
        $requestParams.Body = ($Body | ConvertTo-Json -Depth 10)
    }
    
    if ($UseSession -and $Global:TestSession) {
        $requestParams.WebSession = $Global:TestSession
    }
    
    if ($SaveSession) {
        $requestParams.SessionVariable = "newSession"
    }
    
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest @requestParams -ErrorAction Stop
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        
        if ($SaveSession) {
            $Global:TestSession = $newSession
        }
        
        $result = @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content | ConvertFrom-Json
            Duration = [math]::Round($duration, 2)
        }
        
        Write-TestSuccess "$Method $Endpoint -> $($response.StatusCode) ($($result.Duration)ms)"
        return $result
        
    } catch {
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        $statusCode = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        
        $result = @{
            Success = $false
            StatusCode = $statusCode
            Error = $_.Exception.Message
            Duration = [math]::Round($duration, 2)
        }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-TestSuccess "$Method $Endpoint -> $statusCode [Expected]"
        } else {
            Write-TestError "$Method $Endpoint -> $statusCode (Expected: $ExpectedStatus)"
        }
        
        return $result
    }
}

function Clear-TestSession {
    $Global:TestSession = $null
}

function Get-OtpFromLogs {
    param([string]$PhoneNumber)

    Start-Sleep -Seconds 1
    $logs = docker-compose logs server --tail=50 2>$null

    # Escape special characters in phone number for regex
    $escapedPhone = [regex]::Escape($PhoneNumber)

    # Try multiple patterns
    $patterns = @(
        "Generated OTP for $escapedPhone\: (\d{6})",
        "OTP for $escapedPhone\: (\d{6})"
    )

    foreach ($pattern in $patterns) {
        $otpLine = $logs | Select-String -Pattern $pattern | Select-Object -Last 1
        if ($otpLine) {
            $otp = $otpLine.Matches.Groups[1].Value
            Write-TestSuccess "OTP extracted: $otp"
            return $otp
        }
    }

    Write-TestError "Could not extract OTP from logs"
    return $null
}

