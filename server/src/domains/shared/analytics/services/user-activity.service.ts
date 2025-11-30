import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  UserActivityDocument,
  DeviceType,
} from '../../../../database/schemas/user-activity.schema';
import { TrackEventDto, QueryAnalyticsDto } from '../dto';
import { UserActivityRepository } from '../repositories/user-activity.repository';

/**
 * Service for tracking and managing user activity events
 * Handles session management and event tracking
 */
@Injectable()
export class UserActivityService {
  constructor(
    private readonly userActivityRepository: UserActivityRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Track user event
   */
  async trackEvent(
    userId: string,
    trackEventDto: TrackEventDto,
    deviceInfo?: any,
    locationInfo?: any,
  ): Promise<UserActivityDocument> {
    const { type, data, sessionId } = trackEventDto;

    // Find or create user activity session
    let userActivity = await this.userActivityRepository.findByUserAndSession(
      userId,
      sessionId || 'default',
    );

    const event = {
      type,
      data: data || {},
      timestamp: new Date(),
    };

    if (userActivity) {
      // Add event to existing session
      userActivity.events.push(event);
      await userActivity.save();
    } else {
      // Create new session
      userActivity = await this.userActivityRepository.create({
        userId: new Types.ObjectId(userId),
        sessionId: sessionId || 'default',
        events: [event],
        device: deviceInfo || {
          type: DeviceType.DESKTOP,
          os: 'Unknown',
          browser: 'Unknown',
          userAgent: 'Unknown',
        },
        location: locationInfo || {
          city: 'Unknown',
          country: 'Unknown',
          ip: 'Unknown',
        },
      } as any);
    }

    // Emit event for further processing
    this.eventEmitter.emit('analytics.event.tracked', {
      userId,
      type,
      data,
    });

    return userActivity;
  }

  /**
   * Get user activity with pagination
   */
  async getUserActivity(
    userId: string,
    query: QueryAnalyticsDto,
  ): Promise<{ data: UserActivityDocument[]; meta: any }> {
    const { page = 1, limit = 10, startDate, endDate } = query;

    const filter: any = {};

    // Only filter by userId if provided
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const result = await this.userActivityRepository.findWithPagination(
      filter,
      page,
      limit,
      { sort: { createdAt: -1 } },
    );

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }
}
