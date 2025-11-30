import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserActivity,
  UserActivityDocument,
} from '../../../../database/schemas/user-activity.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class UserActivityRepository extends BaseRepository<UserActivityDocument> {
  constructor(
    @InjectModel(UserActivity.name)
    private readonly userActivityModel: Model<UserActivityDocument>,
  ) {
    super(userActivityModel);
  }

  /**
   * Find by user ID and session ID
   */
  async findByUserAndSession(
    userId: string,
    sessionId: string,
  ): Promise<UserActivityDocument | null> {
    return this.findOne({
      userId: new Types.ObjectId(userId),
      sessionId: sessionId || 'default',
    });
  }

  /**
   * Find all activities by user ID
   */
  async findByUserId(userId: string): Promise<UserActivityDocument[]> {
    return this.findAll({ userId: new Types.ObjectId(userId) });
  }

  /**
   * Add event to existing session
   */
  async addEventToSession(
    sessionId: string,
    event: { type: string; data: any; timestamp: Date },
  ): Promise<UserActivityDocument | null> {
    return this.userActivityModel.findOneAndUpdate(
      { sessionId },
      { $push: { events: event } },
      { new: true },
    );
  }
}
