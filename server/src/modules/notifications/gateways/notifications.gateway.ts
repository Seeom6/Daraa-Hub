import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../services/notifications.service';

/**
 * WebSocket Gateway for real-time notifications
 * 
 * Usage from client:
 * ```javascript
 * const socket = io('http://localhost:3001', {
 *   auth: {
 *     token: 'your-jwt-token'
 *   }
 * });
 * 
 * socket.on('notification', (data) => {
 *   console.log('New notification:', data);
 * });
 * ```
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Configure this properly in production
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    try {
      // Extract and verify JWT token
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store socket connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Store userId in socket data for later use
      client.data.userId = userId;

      // Join user to their personal room
      client.join(`user:${userId}`);

      this.logger.log(`Client ${client.id} connected for user ${userId}`);

      // Send unread count on connection
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread-count', { count: unreadCount });

    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      
      // Remove user entry if no more sockets
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    this.logger.log(`Client ${client.id} disconnected`);
  }

  /**
   * Subscribe to notifications
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    this.logger.log(`User ${userId} subscribed to notifications`);
    return { event: 'subscribed', data: { success: true } };
  }

  /**
   * Mark notification as read
   */
  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      await this.notificationsService.markAsRead(data.notificationId);
      const userId = client.data.userId;
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      
      // Emit updated unread count to all user's sockets
      this.server.to(`user:${userId}`).emit('unread-count', { count: unreadCount });
      
      return { event: 'marked-read', data: { success: true } };
    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${error.message}`);
      return { event: 'error', data: { message: error.message } };
    }
  }

  /**
   * Send notification to a specific user
   * Called from NotificationProcessor or other services
   */
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Sent notification to user ${userId}`);
  }

  /**
   * Send unread count update to a specific user
   */
  sendUnreadCountToUser(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('unread-count', { count });
  }

  /**
   * Broadcast notification to all connected users
   */
  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Broadcasted notification to all users');
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  /**
   * Get user's socket count
   */
  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }
}

