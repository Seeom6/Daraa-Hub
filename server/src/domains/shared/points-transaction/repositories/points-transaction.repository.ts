import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PointsTransaction,
  PointsTransactionDocument,
} from '../../../../database/schemas/points-transaction.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class PointsTransactionRepository extends BaseRepository<PointsTransactionDocument> {
  constructor(
    @InjectModel(PointsTransaction.name)
    private readonly pointsModel: Model<PointsTransactionDocument>,
  ) {
    super(pointsModel);
  }

  /**
   * Find transactions by user ID
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: PointsTransactionDocument[]; total: number }> {
    return this.findWithPagination(
      { userId: new Types.ObjectId(userId) },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find transactions by type
   */
  async findByType(
    userId: string,
    type: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: PointsTransactionDocument[]; total: number }> {
    return this.findWithPagination(
      {
        userId: new Types.ObjectId(userId),
        type,
      },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Get total points for user
   */
  async getTotalPoints(userId: string): Promise<number> {
    const result = await this.pointsModel.aggregate([
      {
        $match: { userId: new Types.ObjectId(userId) },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$points' },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Get points summary by type
   */
  async getPointsSummary(userId: string): Promise<any[]> {
    return this.pointsModel.aggregate([
      {
        $match: { userId: new Types.ObjectId(userId) },
      },
      {
        $group: {
          _id: '$type',
          totalPoints: { $sum: '$points' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
    ]);
  }

  /**
   * Find transactions by date range
   */
  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PointsTransactionDocument[]> {
    return this.find({
      userId: new Types.ObjectId(userId),
      createdAt: { $gte: startDate, $lte: endDate },
    });
  }
}
