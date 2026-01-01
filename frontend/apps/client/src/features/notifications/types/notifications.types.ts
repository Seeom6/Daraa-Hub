export type NotificationType =
  | 'order_placed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_received'
  | 'review_reply'
  | 'price_drop'
  | 'back_in_stock'
  | 'promo'
  | 'system';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface NotificationSettings {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    reviews: boolean;
    system: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    reviews: boolean;
    system: boolean;
  };
}

