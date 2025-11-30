# Run All Authentication Tests

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  AUTHENTICATION TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$startTime = Get-Date

# Check if server is running
Write-Host "Checking if server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5
    Write-Host "Server is running and healthy" -ForegroundColor Green
} catch {
    Write-Host "Server is not running!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test scripts
$testScripts = @(
    "01-customer-registration.ps1",
    "02-store-owner-registration.ps1",
    "05-login-scenarios.ps1"
)

$allResults = @{
    TotalTests = 0
    Passed = 0
    Failed = 0
}

# Run each test
foreach ($script in $testScripts) {
    Write-Host "`nRunning: $script" -ForegroundColor Magenta
    $scriptPath = Join-Path $PSScriptRoot $script
    
    if (Test-Path $scriptPath) {
        try {
            & $scriptPath
            
            $resultFiles = Get-ChildItem -Path $PSScriptRoot -Filter "test-results-*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            
            if ($resultFiles) {
                $result = Get-Content $resultFiles.FullName | ConvertFrom-Json
                $allResults.TotalTests += $result.TotalTests
                $allResults.Passed += $result.Passed
                $allResults.Failed += $result.Failed
                
                Write-Host "Completed: Tests: $($result.TotalTests) | Passed: $($result.Passed) | Failed: $($result.Failed)" -ForegroundColor Green
            }
        } catch {
            Write-Host "Error: $_" -ForegroundColor Red
        }
    }
}

$duration = ((Get-Date) - $startTime).TotalSeconds

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FINAL REPORT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Duration: $([math]::Round($duration, 2))s"
Write-Host "Total Tests: $($allResults.TotalTests)"
Write-Host "Passed: $($allResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($allResults.Failed)" -ForegroundColor Red

$successRate = if ($allResults.TotalTests -gt 0) {
    [math]::Round(($allResults.Passed / $allResults.TotalTests) * 100, 2)
} else { 0 }

Write-Host "`nSuccess Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } else { "Yellow" })

if ($allResults.Failed -eq 0) {
    Write-Host "`nAll tests passed!" -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed. Please review." -ForegroundColor Yellow
}

