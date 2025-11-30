# Run all store management tests
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STORE MANAGEMENT TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date
$totalTests = 0
$passedTests = 0
$failedTests = 0
$skippedTests = 0

# Test files to run
$testFiles = @(
    "01-public-stores.ps1",
    "02-store-profile-management.ps1",
    "03-store-verification.ps1",
    "04-admin-verification-approval.ps1"
)

foreach ($testFile in $testFiles) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  Running: $testFile" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    
    $testPath = Join-Path $PSScriptRoot $testFile
    
    if (Test-Path $testPath) {
        try {
            & powershell -ExecutionPolicy Bypass -File $testPath
            
            # Read results
            $resultFile = $testPath -replace '\.ps1$', ''
            $resultFile = "$resultFile-results.json"
            $resultFile = $resultFile -replace '01-public-stores', 'test-results-public-stores'
            $resultFile = $resultFile -replace '02-store-profile-management', 'test-results-store-profile'
            $resultFile = $resultFile -replace '03-store-verification', 'test-results-store-verification'
            $resultFile = $resultFile -replace '04-admin-verification-approval', 'test-results-admin-verification'
            
            if (Test-Path $resultFile) {
                $results = Get-Content $resultFile | ConvertFrom-Json
                $totalTests += $results.TotalTests
                $passedTests += $results.Passed
                $failedTests += $results.Failed
                $skippedTests += $results.Skipped
            }
        } catch {
            Write-Host "ERROR running $testFile : $_" -ForegroundColor Red
            $failedTests++
        }
    } else {
        Write-Host "WARNING: Test file not found: $testFile" -ForegroundColor Yellow
    }
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

# Print summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SUITE SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Duration: $([math]::Round($duration, 2))s"
Write-Host "Total Tests: $totalTests"
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { "Red" } else { "Green" })
Write-Host "Skipped: $skippedTests" -ForegroundColor Yellow
Write-Host ""

if ($totalTests -gt 0) {
    $successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Save combined results
$combinedResults = @{
    TestSuite = "Store Management - All Tests"
    StartTime = $startTime
    EndTime = $endTime
    Duration = $duration
    TotalTests = $totalTests
    Passed = $passedTests
    Failed = $failedTests
    Skipped = $skippedTests
    SuccessRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }
}

$combinedResults | ConvertTo-Json -Depth 10 | Out-File "$PSScriptRoot\test-results-all-stores.json"

Write-Host ""
Write-Host "Combined results saved to: test-results-all-stores.json" -ForegroundColor Green
Write-Host ""

