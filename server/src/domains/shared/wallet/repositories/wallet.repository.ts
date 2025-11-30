import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import {
  Wallet,
  WalletDocument,
} from '../../../../database/schemas/wallet.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class WalletRepository extends BaseRepository<WalletDocument> {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
  ) {
    super(walletModel);
  }

  /**
   * Find wallet by account ID
   */
  async findByAccountId(accountId: string): Promise<WalletDocument | null> {
    return this.model
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .exec();
  }

  /**
   * Create wallet for account
   */
  async createForAccount(accountId: string): Promise<WalletDocument> {
    const wallet = new this.walletModel({
      accountId: new Types.ObjectId(accountId),
      balance: 0,
      pendingBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalSpent: 0,
      totalEarned: 0,
    });
    return wallet.save();
  }

  /**
   * Get or create wallet for account
   */
  async getOrCreate(accountId: string): Promise<WalletDocument> {
    let wallet = await this.findByAccountId(accountId);
    if (!wallet) {
      wallet = await this.createForAccount(accountId);
    }
    return wallet;
  }

  /**
   * Add balance (deposit, refund, earning)
   */
  async addBalance(
    walletId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<WalletDocument | null> {
    return this.walletModel
      .findByIdAndUpdate(
        walletId,
        { $inc: { balance: amount } },
        { new: true, session },
      )
      .exec();
  }

  /**
   * Deduct balance (payment, withdrawal)
   */
  async deductBalance(
    walletId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<WalletDocument | null> {
    return this.walletModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(walletId), balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { new: true, session },
      )
      .exec();
  }

  /**
   * Update statistics
   */
  async updateStats(
    walletId: string,
    stats: {
      deposited?: number;
      withdrawn?: number;
      spent?: number;
      earned?: number;
    },
    session?: ClientSession,
  ): Promise<WalletDocument | null> {
    const update: any = {};
    if (stats.deposited) update.totalDeposited = stats.deposited;
    if (stats.withdrawn) update.totalWithdrawn = stats.withdrawn;
    if (stats.spent) update.totalSpent = stats.spent;
    if (stats.earned) update.totalEarned = stats.earned;

    return this.walletModel
      .findByIdAndUpdate(walletId, { $inc: update }, { new: true, session })
      .exec();
  }

  /**
   * Freeze wallet
   */
  async freezeWallet(
    walletId: string,
    reason: string,
    frozenBy: string,
  ): Promise<WalletDocument | null> {
    return this.walletModel
      .findByIdAndUpdate(
        walletId,
        {
          isFrozen: true,
          frozenReason: reason,
          frozenAt: new Date(),
          frozenBy: new Types.ObjectId(frozenBy),
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Unfreeze wallet
   */
  async unfreezeWallet(walletId: string): Promise<WalletDocument | null> {
    return this.walletModel
      .findByIdAndUpdate(
        walletId,
        {
          isFrozen: false,
          $unset: { frozenReason: 1, frozenAt: 1, frozenBy: 1 },
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Get wallets with balance above threshold
   */
  async findWithBalanceAbove(minBalance: number): Promise<WalletDocument[]> {
    return this.walletModel
      .find({ balance: { $gte: minBalance }, isActive: true })
      .populate('accountId')
      .exec();
  }
}
