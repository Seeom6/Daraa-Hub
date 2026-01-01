# Admin Dashboard Structure

## 📁 Directory Structure

```
src/
├── app/
│   └── (admin)/                          # Admin route group
│       ├── layout.tsx                    # Admin layout with sidebar
│       ├── page.tsx                      # Redirect to /admin/dashboard
│       │
│       ├── dashboard/                    # Dashboard page
│       │   └── page.tsx
│       │
│       ├── users/                        # Users management
│       │   ├── page.tsx                  # Users list
│       │   ├── [id]/
│       │   │   └── page.tsx              # User details
│       │   └── search/
│       │       └── page.tsx              # User search
│       │
│       ├── stores/                       # Stores management
│       │   ├── page.tsx                  # Stores list
│       │   ├── [id]/
│       │   │   └── page.tsx              # Store details
│       │   ├── verification/
│       │   │   ├── page.tsx              # Verification requests list
│       │   │   └── [id]/
│       │   │       └── page.tsx          # Verification request details
│       │   └── categories/
│       │       └── page.tsx              # Store categories
│       │
│       ├── couriers/                     # Couriers management
│       │   ├── page.tsx                  # Couriers list
│       │   ├── [id]/
│       │   │   └── page.tsx              # Courier details
│       │   ├── map/
│       │   │   └── page.tsx              # Couriers map view
│       │   └── verification/
│       │       ├── page.tsx              # Courier verification requests
│       │       └── [id]/
│       │           └── page.tsx          # Courier verification details
│       │
│       ├── products/                     # Products management
│       │   ├── page.tsx                  # Products list
│       │   ├── [id]/
│       │   │   └── page.tsx              # Product details
│       │   └── categories/
│       │       └── page.tsx              # Product categories
│       │
│       ├── orders/                       # Orders management
│       │   ├── page.tsx                  # Orders list
│       │   └── [id]/
│       │       └── page.tsx              # Order details
│       │
│       ├── payments/                     # Payments management
│       │   ├── page.tsx                  # Payments list
│       │   ├── refunds/
│       │   │   └── page.tsx              # Refunds list
│       │   └── returns/
│       │       └── page.tsx              # Returns list
│       │
│       ├── coupons/                      # Coupons management
│       │   ├── page.tsx                  # Coupons list
│       │   ├── create/
│       │   │   └── page.tsx              # Create coupon
│       │   └── [id]/
│       │       ├── page.tsx              # Coupon details
│       │       └── edit/
│       │           └── page.tsx          # Edit coupon
│       │
│       ├── reviews/                      # Reviews management
│       │   ├── page.tsx                  # Reviews list
│       │   └── [id]/
│       │       └── page.tsx              # Review details
│       │
│       ├── notifications/                # Notifications
│       │   ├── page.tsx                  # Send notification
│       │   ├── templates/
│       │   │   └── page.tsx              # Notification templates
│       │   └── history/
│       │       └── page.tsx              # Notifications history
│       │
│       ├── reports/                      # Reports
│       │   ├── page.tsx                  # Reports dashboard
│       │   ├── sales/
│       │   │   └── page.tsx              # Sales report
│       │   ├── revenue/
│       │   │   └── page.tsx              # Revenue report
│       │   ├── users/
│       │   │   └── page.tsx              # User analytics
│       │   └── stores/
│       │       └── page.tsx              # Store analytics
│       │
│       ├── settings/                     # Settings
│       │   ├── page.tsx                  # Settings dashboard
│       │   ├── general/
│       │   │   └── page.tsx              # General settings
│       │   ├── payment/
│       │   │   └── page.tsx              # Payment settings
│       │   ├── shipping/
│       │   │   └── page.tsx              # Shipping settings
│       │   ├── notifications/
│       │   │   └── page.tsx              # Notifications settings
│       │   ├── security/
│       │   │   └── page.tsx              # Security settings
│       │   ├── commission/
│       │   │   └── page.tsx              # Commission settings
│       │   └── features/
│       │       └── page.tsx              # Features settings
│       │
│       ├── audit-logs/                   # Audit logs
│       │   ├── page.tsx                  # Audit logs list
│       │   └── statistics/
│       │       └── page.tsx              # Audit logs statistics
│       │
│       └── profile/                      # Admin profile
│           └── page.tsx                  # Admin profile page
│
├── features/
│   └── admin/                            # Admin feature module
│       ├── components/                   # Admin-specific components
│       │   ├── layout/
│       │   │   ├── AdminSidebar.tsx
│       │   │   ├── AdminHeader.tsx
│       │   │   ├── AdminBreadcrumbs.tsx
│       │   │   └── AdminLayout.tsx
│       │   │
│       │   ├── dashboard/
│       │   │   ├── StatisticsCards.tsx
│       │   │   ├── RevenueChart.tsx
│       │   │   ├── OrdersChart.tsx
│       │   │   ├── RecentOrders.tsx
│       │   │   └── PendingActions.tsx
│       │   │
│       │   ├── users/
│       │   │   ├── UsersTable.tsx
│       │   │   ├── UserDetailsCard.tsx
│       │   │   ├── UserFilters.tsx
│       │   │   ├── SuspendUserModal.tsx
│       │   │   ├── BanUserModal.tsx
│       │   │   └── UserActivityLog.tsx
│       │   │
│       │   ├── stores/
│       │   │   ├── StoresTable.tsx
│       │   │   ├── StoreDetailsCard.tsx
│       │   │   ├── StoreFilters.tsx
│       │   │   ├── VerificationRequestsTable.tsx
│       │   │   ├── VerificationDetailsCard.tsx
│       │   │   ├── ApproveVerificationModal.tsx
│       │   │   ├── RejectVerificationModal.tsx
│       │   │   ├── RequestMoreInfoModal.tsx
│       │   │   └── StoreCategoriesTable.tsx
│       │   │
│       │   ├── couriers/
│       │   │   ├── CouriersTable.tsx
│       │   │   ├── CourierDetailsCard.tsx
│       │   │   ├── CourierFilters.tsx
│       │   │   ├── CouriersMap.tsx
│       │   │   ├── AssignOrderModal.tsx
│       │   │   └── CourierStatistics.tsx
│       │   │
│       │   ├── products/
│       │   │   ├── ProductsTable.tsx
│       │   │   ├── ProductsGrid.tsx
│       │   │   ├── ProductDetailsCard.tsx
│       │   │   ├── ProductFilters.tsx
│       │   │   └── ProductCategoriesTable.tsx
│       │   │
│       │   ├── orders/
│       │   │   ├── OrdersTable.tsx
│       │   │   ├── OrderDetailsCard.tsx
│       │   │   ├── OrderFilters.tsx
│       │   │   ├── OrderTimeline.tsx
│       │   │   ├── AssignCourierModal.tsx
│       │   │   ├── CancelOrderModal.tsx
│       │   │   └── ProcessRefundModal.tsx
│       │   │
│       │   ├── payments/
│       │   │   ├── PaymentsTable.tsx
│       │   │   ├── RefundsTable.tsx
│       │   │   ├── ReturnsTable.tsx
│       │   │   └── PaymentFilters.tsx
│       │   │
│       │   ├── coupons/
│       │   │   ├── CouponsTable.tsx
│       │   │   ├── CouponForm.tsx
│       │   │   ├── CouponDetailsCard.tsx
│       │   │   └── CouponFilters.tsx
│       │   │
│       │   ├── reviews/
│       │   │   ├── ReviewsTable.tsx
│       │   │   ├── ReviewDetailsCard.tsx
│       │   │   ├── ReviewFilters.tsx
│       │   │   └── ModerateReviewModal.tsx
│       │   │
│       │   ├── notifications/
│       │   │   ├── SendNotificationForm.tsx
│       │   │   ├── NotificationTemplates.tsx
│       │   │   ├── NotificationsHistory.tsx
│       │   │   └── NotificationsDrawer.tsx
│       │   │
│       │   ├── reports/
│       │   │   ├── SalesChart.tsx
│       │   │   ├── RevenueChart.tsx
│       │   │   ├── UserAnalyticsChart.tsx
│       │   │   ├── StoreAnalyticsChart.tsx
│       │   │   └── ReportFilters.tsx
│       │   │
│       │   ├── settings/
│       │   │   ├── GeneralSettingsForm.tsx
│       │   │   ├── PaymentSettingsForm.tsx
│       │   │   ├── ShippingSettingsForm.tsx
│       │   │   ├── NotificationsSettingsForm.tsx
│       │   │   ├── SecuritySettingsForm.tsx
│       │   │   ├── CommissionSettingsForm.tsx
│       │   │   └── FeaturesSettingsForm.tsx
│       │   │
│       │   ├── audit-logs/
│       │   │   ├── AuditLogsTable.tsx
│       │   │   ├── AuditLogFilters.tsx
│       │   │   └── AuditLogStatistics.tsx
│       │   │
│       │   ├── modals/
│       │   │   ├── GlobalSearchModal.tsx
│       │   │   ├── SendNotificationModal.tsx
│       │   │   └── DeleteConfirmationModal.tsx
│       │   │
│       │   └── shared/
│       │       ├── StatCard.tsx
│       │       ├── DataTable.tsx
│       │       ├── FilterBar.tsx
│       │       ├── StatusBadge.tsx
│       │       ├── ActionButton.tsx
│       │       └── EmptyState.tsx
│       │
│       ├── hooks/                        # Admin-specific hooks
│       │   ├── useAdminAuth.ts
│       │   ├── useAdminPermissions.ts
│       │   ├── useDashboardStats.ts
│       │   ├── useUsers.ts
│       │   ├── useStores.ts
│       │   ├── useCouriers.ts
│       │   ├── useProducts.ts
│       │   ├── useOrders.ts
│       │   ├── usePayments.ts
│       │   ├── useCoupons.ts
│       │   ├── useReviews.ts
│       │   ├── useNotifications.ts
│       │   ├── useReports.ts
│       │   ├── useSettings.ts
│       │   └── useAuditLogs.ts
│       │
│       ├── api/                          # API client functions
│       │   ├── auth.api.ts
│       │   ├── dashboard.api.ts
│       │   ├── users.api.ts
│       │   ├── stores.api.ts
│       │   ├── verification.api.ts
│       │   ├── couriers.api.ts
│       │   ├── products.api.ts
│       │   ├── orders.api.ts
│       │   ├── payments.api.ts
│       │   ├── coupons.api.ts
│       │   ├── reviews.api.ts
│       │   ├── notifications.api.ts
│       │   ├── reports.api.ts
│       │   ├── settings.api.ts
│       │   └── audit-logs.api.ts
│       │
│       ├── types/                        # TypeScript types
│       │   ├── admin.types.ts
│       │   ├── dashboard.types.ts
│       │   ├── user.types.ts
│       │   ├── store.types.ts
│       │   ├── verification.types.ts
│       │   ├── courier.types.ts
│       │   ├── product.types.ts
│       │   ├── order.types.ts
│       │   ├── payment.types.ts
│       │   ├── coupon.types.ts
│       │   ├── review.types.ts
│       │   ├── notification.types.ts
│       │   ├── report.types.ts
│       │   ├── settings.types.ts
│       │   └── audit-log.types.ts
│       │
│       ├── utils/                        # Utility functions
│       │   ├── permissions.ts
│       │   ├── formatters.ts
│       │   ├── validators.ts
│       │   └── constants.ts
│       │
│       └── constants/                    # Constants
│           ├── permissions.ts
│           ├── roles.ts
│           ├── statuses.ts
│           └── navigation.ts
│
└── components/
    ├── guards/
    │   ├── AdminGuard.tsx               # Admin authentication guard
    │   └── PermissionGuard.tsx          # Permission-based guard
    │
    └── ui/                              # Shared UI components (shadcn/ui)
        ├── button.tsx
        ├── card.tsx
        ├── table.tsx
        ├── modal.tsx
        ├── drawer.tsx
        ├── badge.tsx
        ├── input.tsx
        ├── select.tsx
        ├── checkbox.tsx
        ├── radio.tsx
        ├── textarea.tsx
        ├── date-picker.tsx
        ├── tabs.tsx
        ├── dropdown.tsx
        └── toast.tsx
```

## 📊 Statistics

- **Total Pages:** 40+ pages
- **Total Components:** 100+ components
- **Total Hooks:** 15+ hooks
- **Total API Functions:** 15+ files
- **Total Types:** 15+ files

## 🎯 Next Steps

1. Create route structure in `app/(admin)/`
2. Create layout components
3. Create feature components
4. Create hooks
5. Create API functions
6. Create types
7. Implement pages
8. Add guards and permissions
9. Test and refine

---

**Created:** 2025-12-25
**Version:** 1.0


