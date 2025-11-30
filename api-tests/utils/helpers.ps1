# Test Helper Functions

$Global:TestResults = @{
    TestSuite = ""
    StartTime = $null
    EndTime = $null
    TotalTests = 0
    Passed = 0
    Failed = 0
    Skipped = 0
    Tests = @()
}

function Start-TestSuite {
    param([string]$Name)
    
    $Global:TestResults = @{
        TestSuite = $Name
        StartTime = Get-Date
        EndTime = $null
        TotalTests = 0
        Passed = 0
        Failed = 0
        Skipped = 0
        Tests = @()
    }
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  TEST SUITE: $Name" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Add-TestResult {
    param(
        [string]$Name,
        [string]$Status,
        [string]$Endpoint = "",
        [hashtable]$Request = $null,
        [hashtable]$Response = $null,
        [double]$Duration = 0,
        [string]$ErrorMessage = ""
    )
    
    $Global:TestResults.TotalTests++
    
    switch ($Status) {
        "passed" { $Global:TestResults.Passed++ }
        "failed" { $Global:TestResults.Failed++ }
        "skipped" { $Global:TestResults.Skipped++ }
    }
    
    $Global:TestResults.Tests += @{
        Name = $Name
        Status = $Status
        Endpoint = $Endpoint
        Duration = $Duration
        ErrorMessage = $ErrorMessage
        Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
}

function Complete-TestSuite {
    param([string]$OutputFile = "test-results.json")
    
    $Global:TestResults.EndTime = Get-Date
    $duration = ($Global:TestResults.EndTime - $Global:TestResults.StartTime).TotalSeconds
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  TEST SUITE COMPLETE" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Write-Host "Duration: $([math]::Round($duration, 2))s"
    Write-Host "Total Tests: $($Global:TestResults.TotalTests)"
    Write-Host "Passed: $($Global:TestResults.Passed)" -ForegroundColor Green
    Write-Host "Failed: $($Global:TestResults.Failed)" -ForegroundColor Red
    Write-Host "Skipped: $($Global:TestResults.Skipped)" -ForegroundColor Yellow
    
    $Global:TestResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8
    Write-Host "`nResults saved to: $OutputFile" -ForegroundColor Cyan
}

function Assert-Equal {
    param($Expected, $Actual, [string]$Message = "")
    
    if ($Expected -eq $Actual) {
        return $true
    } else {
        Write-TestError "Assertion failed: $Message (Expected: $Expected, Actual: $Actual)"
        return $false
    }
}

function Assert-NotNull {
    param($Value, [string]$Message = "")
    
    if ($null -ne $Value) {
        return $true
    } else {
        Write-TestError "Assertion failed: $Message (Value is null)"
        return $false
    }
}

function Generate-TestPhone {
    param([string]$Prefix = "+96399")
    
    $random = Get-Random -Minimum 1000000 -Maximum 9999999
    return "$Prefix$random"
}

function Generate-TestEmail {
    param([string]$Prefix = "test")
    
    $random = Get-Random -Minimum 1000 -Maximum 9999
    return "$Prefix$random@daraa-test.com"
}

