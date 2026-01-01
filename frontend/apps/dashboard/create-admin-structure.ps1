# Create Admin Dashboard Structure
Write-Host "Creating Admin Dashboard Structure..." -ForegroundColor Green

$baseDir = "src/app/(admin)"

# Create all directories
$directories = @(
    # Pages
    "$baseDir/dashboard",
    "$baseDir/users",
    "$baseDir/users/[id]",
    "$baseDir/users/search",
    "$baseDir/stores",
    "$baseDir/stores/[id]",
    "$baseDir/stores/verification",
    "$baseDir/stores/verification/[id]",
    "$baseDir/stores/categories",
    "$baseDir/couriers",
    "$baseDir/couriers/[id]",
    "$baseDir/couriers/map",
    "$baseDir/couriers/verification",
    "$baseDir/couriers/verification/[id]",
    "$baseDir/products",
    "$baseDir/products/[id]",
    "$baseDir/products/categories",
    "$baseDir/orders",
    "$baseDir/orders/[id]",
    "$baseDir/payments",
    "$baseDir/payments/refunds",
    "$baseDir/payments/returns",
    "$baseDir/coupons",
    "$baseDir/coupons/create",
    "$baseDir/coupons/[id]",
    "$baseDir/coupons/[id]/edit",
    "$baseDir/reviews",
    "$baseDir/reviews/[id]",
    "$baseDir/notifications",
    "$baseDir/notifications/templates",
    "$baseDir/notifications/history",
    "$baseDir/reports",
    "$baseDir/reports/sales",
    "$baseDir/reports/revenue",
    "$baseDir/reports/users",
    "$baseDir/reports/stores",
    "$baseDir/settings",
    "$baseDir/settings/general",
    "$baseDir/settings/payment",
    "$baseDir/settings/shipping",
    "$baseDir/settings/notifications",
    "$baseDir/settings/security",
    "$baseDir/settings/commission",
    "$baseDir/settings/features",
    "$baseDir/audit-logs",
    "$baseDir/audit-logs/statistics",
    "$baseDir/profile",
    
    # Features - Components
    "src/features/admin/components/layout",
    "src/features/admin/components/dashboard",
    "src/features/admin/components/users",
    "src/features/admin/components/stores",
    "src/features/admin/components/couriers",
    "src/features/admin/components/products",
    "src/features/admin/components/orders",
    "src/features/admin/components/payments",
    "src/features/admin/components/coupons",
    "src/features/admin/components/reviews",
    "src/features/admin/components/notifications",
    "src/features/admin/components/reports",
    "src/features/admin/components/settings",
    "src/features/admin/components/audit-logs",
    "src/features/admin/components/modals",
    "src/features/admin/components/shared",
    
    # Features - Other
    "src/features/admin/hooks",
    "src/features/admin/api",
    "src/features/admin/types",
    "src/features/admin/utils",
    "src/features/admin/constants"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "Created: $dir" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Admin Dashboard Structure Created Successfully!" -ForegroundColor Green
Write-Host "Total Directories: $($directories.Count)" -ForegroundColor Cyan

