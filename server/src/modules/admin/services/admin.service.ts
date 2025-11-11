import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdminProfile, AdminProfileDocument } from '../../../database/schemas/admin-profile.schema';
import { CreateAdminDto } from '../dto/create-admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(AdminProfile.name)
    private adminProfileModel: Model<AdminProfileDocument>,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<AdminProfileDocument> {
    const adminProfile = new this.adminProfileModel({
      accountId: new Types.ObjectId(createAdminDto.accountId),
      permissions: createAdminDto.permissions,
      role: createAdminDto.role,
      department: createAdminDto.department,
    });

    const saved = await adminProfile.save();
    this.logger.log(`Admin profile created for account: ${createAdminDto.accountId}`);
    return saved;
  }

  async findByAccountId(accountId: string): Promise<AdminProfileDocument | null> {
    return this.adminProfileModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .exec();
  }

  async findById(id: string): Promise<AdminProfileDocument> {
    const admin = await this.adminProfileModel.findById(id).exec();
    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }
    return admin;
  }

  async findAll(filters?: {
    role?: string;
    department?: string;
    isActive?: boolean;
  }): Promise<AdminProfileDocument[]> {
    const query: any = {};

    if (filters?.role) {
      query.role = filters.role;
    }

    if (filters?.department) {
      query.department = filters.department;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    return this.adminProfileModel.find(query).populate('accountId').exec();
  }

  async updatePermissions(
    id: string,
    permissions: any,
  ): Promise<AdminProfileDocument> {
    const admin = await this.adminProfileModel
      .findByIdAndUpdate(
        id,
        { permissions },
        { new: true },
      )
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    this.logger.log(`Admin permissions updated: ${id}`);
    return admin;
  }

  async updateRole(
    id: string,
    role: 'super_admin' | 'admin' | 'moderator' | 'support',
  ): Promise<AdminProfileDocument> {
    const admin = await this.adminProfileModel
      .findByIdAndUpdate(
        id,
        { role },
        { new: true },
      )
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    this.logger.log(`Admin role updated: ${id} -> ${role}`);
    return admin;
  }

  async deactivate(id: string): Promise<AdminProfileDocument> {
    const admin = await this.adminProfileModel
      .findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true },
      )
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    this.logger.log(`Admin deactivated: ${id}`);
    return admin;
  }

  async activate(id: string): Promise<AdminProfileDocument> {
    const admin = await this.adminProfileModel
      .findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true },
      )
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    this.logger.log(`Admin activated: ${id}`);
    return admin;
  }

  async logActivity(
    accountId: string,
    action: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.adminProfileModel
      .findOneAndUpdate(
        { accountId: new Types.ObjectId(accountId) },
        {
          $push: {
            activityLog: {
              action,
              timestamp: new Date(),
              ipAddress,
              userAgent,
              details,
            },
          },
          lastLoginAt: action === 'login' ? new Date() : undefined,
        },
      )
      .exec();
  }

  async getActivityLog(accountId: string, limit: number = 50): Promise<any[]> {
    const admin = await this.adminProfileModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .select('activityLog')
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    return admin.activityLog.slice(-limit).reverse();
  }

  // Helper method to create default permissions based on role
  static getDefaultPermissions(role: string): any {
    switch (role) {
      case 'super_admin':
        return {
          users: { view: true, create: true, edit: true, delete: true, suspend: true },
          stores: { view: true, approve: true, reject: true, suspend: true },
          couriers: { view: true, approve: true, reject: true, suspend: true },
          products: { view: true, edit: true, delete: true, feature: true },
          orders: { view: true, cancel: true, refund: true },
          payments: { view: true, refund: true },
          reports: { view: true, export: true },
          settings: { view: true, edit: true },
          coupons: { view: true, create: true, edit: true, delete: true },
          categories: { view: true, create: true, edit: true, delete: true },
          notifications: { send_bulk: true },
        };

      case 'admin':
        return {
          users: { view: true, create: true, edit: true, delete: false, suspend: true },
          stores: { view: true, approve: true, reject: true, suspend: true },
          couriers: { view: true, approve: true, reject: true, suspend: true },
          products: { view: true, edit: true, delete: true, feature: true },
          orders: { view: true, cancel: true, refund: true },
          payments: { view: true, refund: false },
          reports: { view: true, export: true },
          settings: { view: true, edit: false },
          coupons: { view: true, create: true, edit: true, delete: true },
          categories: { view: true, create: true, edit: true, delete: true },
          notifications: { send_bulk: true },
        };

      case 'moderator':
        return {
          users: { view: true, create: false, edit: false, delete: false, suspend: false },
          stores: { view: true, approve: true, reject: true, suspend: false },
          couriers: { view: true, approve: true, reject: true, suspend: false },
          products: { view: true, edit: true, delete: false, feature: true },
          orders: { view: true, cancel: false, refund: false },
          payments: { view: false, refund: false },
          reports: { view: true, export: false },
          settings: { view: false, edit: false },
          coupons: { view: true, create: false, edit: false, delete: false },
          categories: { view: true, create: false, edit: false, delete: false },
          notifications: { send_bulk: false },
        };

      case 'support':
        return {
          users: { view: true, create: false, edit: false, delete: false, suspend: false },
          stores: { view: true, approve: false, reject: false, suspend: false },
          couriers: { view: true, approve: false, reject: false, suspend: false },
          products: { view: true, edit: false, delete: false, feature: false },
          orders: { view: true, cancel: false, refund: false },
          payments: { view: false, refund: false },
          reports: { view: false, export: false },
          settings: { view: false, edit: false },
          coupons: { view: true, create: false, edit: false, delete: false },
          categories: { view: true, create: false, edit: false, delete: false },
          notifications: { send_bulk: false },
        };

      default:
        return {};
    }
  }
}

