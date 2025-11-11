import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Account, AccountDocument } from '../../../database/schemas/account.schema';
import { SuspendUserDto, UnsuspendUserDto } from '../dto/suspend-user.dto';
import { USER_SUSPENDED, USER_UNSUSPENDED, USER_BANNED } from '../../../infrastructure/events/event-types';

@Injectable()
export class UserManagementService {
  private readonly logger = new Logger(UserManagementService.name);

  constructor(
    @InjectModel(Account.name)
    private accountModel: Model<AccountDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAllUsers(filters?: {
    role?: string;
    isActive?: boolean;
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ users: AccountDocument[]; total: number; page: number; totalPages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters?.role) {
      query.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.isVerified !== undefined) {
      query.isVerified = filters.isVerified;
    }

    const [users, total] = await Promise.all([
      this.accountModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .exec(),
      this.accountModel.countDocuments(query).exec(),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findUserById(id: string): Promise<AccountDocument> {
    const user = await this.accountModel
      .findById(id)
      .select('-passwordHash')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async suspendUser(
    userId: string,
    suspendDto: SuspendUserDto,
    adminId: string,
  ): Promise<AccountDocument> {
    const user = await this.accountModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const suspensionExpiresAt = suspendDto.durationDays
      ? new Date(Date.now() + suspendDto.durationDays * 24 * 60 * 60 * 1000)
      : null;

    user.isActive = false;
    // Note: These fields need to be added to Account schema
    (user as any).isSuspended = true;
    (user as any).suspendedAt = new Date();
    (user as any).suspendedBy = new Types.ObjectId(adminId);
    (user as any).suspensionReason = suspendDto.reason;
    (user as any).suspensionExpiresAt = suspensionExpiresAt;

    await user.save();

    this.logger.log(`User suspended: ${userId} by admin: ${adminId}`);

    // Emit event for notification
    this.eventEmitter.emit(USER_SUSPENDED, {
      userId,
      adminId,
      reason: suspendDto.reason,
      expiresAt: suspensionExpiresAt,
      notifyUser: suspendDto.notifyUser,
    });

    return user;
  }

  async unsuspendUser(
    userId: string,
    unsuspendDto: UnsuspendUserDto,
    adminId: string,
  ): Promise<AccountDocument> {
    const user = await this.accountModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = true;
    (user as any).isSuspended = false;
    (user as any).suspendedAt = null;
    (user as any).suspendedBy = null;
    (user as any).suspensionReason = null;
    (user as any).suspensionExpiresAt = null;

    await user.save();

    this.logger.log(`User unsuspended: ${userId} by admin: ${adminId}`);

    // Emit event for notification
    this.eventEmitter.emit(USER_UNSUSPENDED, {
      userId,
      adminId,
      reason: unsuspendDto.reason,
      notifyUser: unsuspendDto.notifyUser,
    });

    return user;
  }

  async banUser(
    userId: string,
    reason: string,
    adminId: string,
  ): Promise<AccountDocument> {
    const user = await this.accountModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    (user as any).isSuspended = true;
    (user as any).suspendedAt = new Date();
    (user as any).suspendedBy = new Types.ObjectId(adminId);
    (user as any).suspensionReason = reason;
    (user as any).suspensionExpiresAt = null; // Permanent ban

    await user.save();

    this.logger.log(`User permanently banned: ${userId} by admin: ${adminId}`);

    // Emit event for notification
    this.eventEmitter.emit(USER_BANNED, {
      userId,
      adminId,
      reason,
    });

    return user;
  }

  async getUserActivity(userId: string): Promise<any> {
    // This will be implemented when we have activity tracking
    // For now, return basic user info
    const user = await this.findUserById(userId);
    return {
      user,
      // TODO: Add order history, login history, etc.
    };
  }

  async searchUsers(query: string): Promise<AccountDocument[]> {
    const searchRegex = new RegExp(query, 'i');

    return this.accountModel
      .find({
        $or: [
          { fullName: searchRegex },
          { phone: searchRegex },
          { email: searchRegex },
        ],
      })
      .select('-passwordHash')
      .limit(20)
      .exec();
  }
}

