import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { BaseRepository } from '../../base/base.repository';
import {
  Commission,
  CommissionDocument,
  CommissionStatus,
  CommissionType,
} from '../../../../database/schemas/commission.schema';

@Injectable()
export class CommissionRepository extends BaseRepository<CommissionDocument> {
  constructor(
    @InjectModel(Commission.name)
    private readonly commissionModel: Model<CommissionDocument>,
  ) {
    super(commissionModel);
  }

  async createWithSession(
    data: Partial<Commission>,
    session?: ClientSession,
  ): Promise<CommissionDocument> {
    const [doc] = await this.commissionModel.create([data], { session });
    return doc;
  }

  async findByOrderId(orderId: string): Promise<CommissionDocument | null> {
    return this.commissionModel
      .findOne({ orderId: new Types.ObjectId(orderId) })
      .exec();
  }

  async findByStoreAccountId(
    storeAccountId: string,
    status?: CommissionStatus,
    limit = 50,
    skip = 0,
  ): Promise<CommissionDocument[]> {
    const query: any = { storeAccountId: new Types.ObjectId(storeAccountId) };
    if (status) query.status = status;

    return this.commissionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findByCourierAccountId(
    courierAccountId: string,
    status?: CommissionStatus,
    limit = 50,
    skip = 0,
  ): Promise<CommissionDocument[]> {
    const query: any = {
      courierAccountId: new Types.ObjectId(courierAccountId),
    };
    if (status) query.status = status;

    return this.commissionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findPendingCommissions(
    type?: CommissionType,
    limit = 100,
  ): Promise<CommissionDocument[]> {
    const query: any = { status: CommissionStatus.PENDING };
    if (type) query.type = type;

    return this.commissionModel
      .find(query)
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async updateStatus(
    id: string,
    status: CommissionStatus,
    session?: ClientSession,
  ): Promise<CommissionDocument | null> {
    const update: any = { status };
    if (status === CommissionStatus.COLLECTED) {
      update.collectedAt = new Date();
    } else if (status === CommissionStatus.PAID_OUT) {
      update.paidOutAt = new Date();
    }

    return this.commissionModel
      .findByIdAndUpdate(id, { $set: update }, { new: true, session })
      .exec();
  }

  async getStoreSummary(
    storeAccountId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalOrders: number;
    totalOrderAmount: number;
    totalCommission: number;
    totalNetEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
  }> {
    const matchStage: any = {
      storeAccountId: new Types.ObjectId(storeAccountId),
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const result = await this.commissionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalOrderAmount: { $sum: '$orderAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalNetEarnings: { $sum: '$storeNetEarnings' },
          pendingEarnings: {
            $sum: {
              $cond: [
                { $eq: ['$status', CommissionStatus.PENDING] },
                '$storeNetEarnings',
                0,
              ],
            },
          },
          paidEarnings: {
            $sum: {
              $cond: [
                { $eq: ['$status', CommissionStatus.PAID_OUT] },
                '$storeNetEarnings',
                0,
              ],
            },
          },
        },
      },
    ]);

    return (
      result[0] || {
        totalOrders: 0,
        totalOrderAmount: 0,
        totalCommission: 0,
        totalNetEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
      }
    );
  }

  async getPlatformSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalOrders: number;
    totalOrderAmount: number;
    totalPlatformEarnings: number;
    pendingCollection: number;
    collected: number;
  }> {
    const matchStage: any = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const result = await this.commissionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalOrderAmount: { $sum: '$orderAmount' },
          totalPlatformEarnings: { $sum: '$platformNetEarnings' },
          pendingCollection: {
            $sum: {
              $cond: [
                { $eq: ['$status', CommissionStatus.PENDING] },
                '$platformNetEarnings',
                0,
              ],
            },
          },
          collected: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [CommissionStatus.COLLECTED, CommissionStatus.PAID_OUT],
                  ],
                },
                '$platformNetEarnings',
                0,
              ],
            },
          },
        },
      },
    ]);

    return (
      result[0] || {
        totalOrders: 0,
        totalOrderAmount: 0,
        totalPlatformEarnings: 0,
        pendingCollection: 0,
        collected: 0,
      }
    );
  }
}
