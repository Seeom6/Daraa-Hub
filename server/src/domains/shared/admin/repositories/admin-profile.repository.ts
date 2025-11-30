import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AdminProfile,
  AdminProfileDocument,
} from '../../../../database/schemas/admin-profile.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class AdminProfileRepository extends BaseRepository<AdminProfileDocument> {
  constructor(
    @InjectModel(AdminProfile.name)
    private readonly adminProfileModel: Model<AdminProfileDocument>,
  ) {
    super(adminProfileModel);
  }

  /**
   * Find admin profile by account ID
   */
  async findByAccountId(
    accountId: string,
  ): Promise<AdminProfileDocument | null> {
    return this.model
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .exec();
  }

  /**
   * Find all admins by role
   */
  async findByRole(
    role: 'super_admin' | 'admin' | 'moderator' | 'support',
  ): Promise<AdminProfileDocument[]> {
    return this.model.find({ role }).populate('accountId').exec();
  }

  /**
   * Find all admins by department
   */
  async findByDepartment(department: string): Promise<AdminProfileDocument[]> {
    return this.model.find({ department }).populate('accountId').exec();
  }

  /**
   * Find active admins
   */
  async findActive(): Promise<AdminProfileDocument[]> {
    return this.model.find({ isActive: true }).populate('accountId').exec();
  }

  /**
   * Update permissions
   */
  async updatePermissions(
    id: string,
    permissions: any,
  ): Promise<AdminProfileDocument | null> {
    return this.model
      .findByIdAndUpdate(id, { permissions }, { new: true })
      .exec();
  }

  /**
   * Update role
   */
  async updateRole(
    id: string,
    role: 'super_admin' | 'admin' | 'moderator' | 'support',
  ): Promise<AdminProfileDocument | null> {
    return this.model.findByIdAndUpdate(id, { role }, { new: true }).exec();
  }

  /**
   * Toggle active status
   */
  async toggleActive(
    id: string,
    isActive: boolean,
  ): Promise<AdminProfileDocument | null> {
    return this.model.findByIdAndUpdate(id, { isActive }, { new: true }).exec();
  }

  /**
   * Log activity
   */
  async logActivity(
    accountId: string,
    activity: {
      action: string;
      timestamp: Date;
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, any>;
    },
    isLogin?: boolean,
  ): Promise<void> {
    const updateData: any = {
      $push: { activityLog: activity },
    };

    if (isLogin) {
      updateData.lastLoginAt = new Date();
    }

    await this.model
      .findOneAndUpdate(
        { accountId: new Types.ObjectId(accountId) },
        updateData,
      )
      .exec();
  }

  /**
   * Get activity log with limit
   */
  async getActivityLog(accountId: string, limit: number = 50): Promise<any[]> {
    const admin = await this.model
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .select('activityLog')
      .exec();

    if (!admin) {
      return [];
    }

    return admin.activityLog.slice(-limit).reverse();
  }
}
