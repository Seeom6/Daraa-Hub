import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import {
  WalletTransaction,
  WalletTransactionDocument,
  TransactionType,
  TransactionStatus,
} from '../../../../database/schemas/wallet-transaction.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class WalletTransactionRepository extends BaseRepository<WalletTransactionDocument> {
  constructor(
    @InjectModel(WalletTransaction.name)
    private readonly transactionModel: Model<WalletTransactionDocument>,
  ) {
    super(transactionModel);
  }

  /**
   * Create transaction
   */
  async createTransaction(
    data: {
      walletId: string;
      accountId: string;
      type: TransactionType;
      amount: number;
      balanceBefore: number;
      balanceAfter: number;
      description: string;
      descriptionAr?: string;
      orderId?: string;
      paymentId?: string;
      relatedAccountId?: string;
      relatedTransactionId?: string;
      metadata?: Record<string, any>;
      performedBy?: string;
      ipAddress?: string;
    },
    session?: ClientSession,
  ): Promise<WalletTransactionDocument> {
    const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const transaction = new this.transactionModel({
      walletId: new Types.ObjectId(data.walletId),
      accountId: new Types.ObjectId(data.accountId),
      type: data.type,
      amount: data.amount,
      balanceBefore: data.balanceBefore,
      balanceAfter: data.balanceAfter,
      status: TransactionStatus.COMPLETED,
      description: data.description,
      descriptionAr: data.descriptionAr,
      orderId: data.orderId ? new Types.ObjectId(data.orderId) : undefined,
      paymentId: data.paymentId
        ? new Types.ObjectId(data.paymentId)
        : undefined,
      relatedAccountId: data.relatedAccountId
        ? new Types.ObjectId(data.relatedAccountId)
        : undefined,
      relatedTransactionId: data.relatedTransactionId
        ? new Types.ObjectId(data.relatedTransactionId)
        : undefined,
      metadata: data.metadata,
      performedBy: data.performedBy
        ? new Types.ObjectId(data.performedBy)
        : undefined,
      ipAddress: data.ipAddress,
      transactionRef,
    });

    return session ? transaction.save({ session }) : transaction.save();
  }

  /**
   * Get transactions for wallet
   */
  async findByWalletId(
    walletId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: WalletTransactionDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter = { walletId: new Types.ObjectId(walletId) };

    const [data, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  /**
   * Get transactions for account
   */
  async findByAccountId(
    accountId: string,
    options?: {
      type?: TransactionType;
      status?: TransactionStatus;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: WalletTransactionDocument[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = { accountId: new Types.ObjectId(accountId) };

    if (options?.type) filter.type = options.type;
    if (options?.status) filter.status = options.status;
    if (options?.startDate || options?.endDate) {
      filter.createdAt = {};
      if (options?.startDate) filter.createdAt.$gte = options.startDate;
      if (options?.endDate) filter.createdAt.$lte = options.endDate;
    }

    const [data, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  /**
   * Find by transaction reference
   */
  async findByRef(
    transactionRef: string,
  ): Promise<WalletTransactionDocument | null> {
    return this.transactionModel.findOne({ transactionRef }).exec();
  }

  /**
   * Find by order ID
   */
  async findByOrderId(orderId: string): Promise<WalletTransactionDocument[]> {
    return this.transactionModel
      .find({ orderId: new Types.ObjectId(orderId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get transaction summary for account
   */
  async getSummary(
    accountId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalPayments: number;
    totalRefunds: number;
    totalEarnings: number;
  }> {
    const match: any = {
      accountId: new Types.ObjectId(accountId),
      status: TransactionStatus.COMPLETED,
    };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    const result = await this.transactionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const summary = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalPayments: 0,
      totalRefunds: 0,
      totalEarnings: 0,
    };

    result.forEach((item) => {
      switch (item._id) {
        case TransactionType.DEPOSIT:
          summary.totalDeposits = item.total;
          break;
        case TransactionType.WITHDRAWAL:
          summary.totalWithdrawals = item.total;
          break;
        case TransactionType.PAYMENT:
          summary.totalPayments = item.total;
          break;
        case TransactionType.REFUND:
          summary.totalRefunds = item.total;
          break;
        case TransactionType.EARNING:
          summary.totalEarnings = item.total;
          break;
      }
    });

    return summary;
  }
}
