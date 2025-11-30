// Event Types for the entire application

// User Events
export const USER_REGISTERED = 'user.registered';
export const USER_VERIFIED = 'user.verified';
export const USER_SUSPENDED = 'user.suspended';
export const USER_UNSUSPENDED = 'user.unsuspended';
export const USER_BANNED = 'user.banned';

// Store Events
export const STORE_CREATED = 'store.created';
export const STORE_APPROVED = 'store.approved';
export const STORE_REJECTED = 'store.rejected';
export const STORE_SUSPENDED = 'store.suspended';
export const STORE_UNSUSPENDED = 'store.unsuspended';

// Courier Events
export const COURIER_REGISTERED = 'courier.registered';
export const COURIER_APPROVED = 'courier.approved';
export const COURIER_REJECTED = 'courier.rejected';
export const COURIER_SUSPENDED = 'courier.suspended';
export const COURIER_UNSUSPENDED = 'courier.unsuspended';

// Verification Events
export const VERIFICATION_SUBMITTED = 'verification.submitted';
export const VERIFICATION_APPROVED = 'verification.approved';
export const VERIFICATION_REJECTED = 'verification.rejected';
export const VERIFICATION_INFO_REQUESTED = 'verification.info_requested';

// Order Events
export const ORDER_CREATED = 'order.created';
export const ORDER_CONFIRMED = 'order.confirmed';
export const ORDER_CANCELLED = 'order.cancelled';
export const ORDER_DELIVERED = 'order.delivered';
export const ORDER_REFUNDED = 'order.refunded';

// Payment Events
export const PAYMENT_INITIATED = 'payment.initiated';
export const PAYMENT_COMPLETED = 'payment.completed';
export const PAYMENT_FAILED = 'payment.failed';
export const PAYMENT_REFUNDED = 'payment.refunded';

// Notification Events
export const NOTIFICATION_SEND = 'notification.send';
export const NOTIFICATION_SENT = 'notification.sent';
export const NOTIFICATION_FAILED = 'notification.failed';

// Security Events
export const SECURITY_SUSPICIOUS_LOGIN = 'security.suspicious_login';
export const SECURITY_FRAUD_DETECTED = 'security.fraud_detected';
export const SECURITY_ACCOUNT_LOCKED = 'security.account_locked';
