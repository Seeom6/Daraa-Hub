import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  Account,
  AccountDocument,
  SecurityProfile,
  SecurityProfileDocument,
  CustomerProfile,
  CustomerProfileDocument,
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
  CourierProfile,
  CourierProfileDocument,
} from '../../../database/schemas';

/**
 * Account Service
 * Manages user accounts and their associated profiles
 */
@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  private readonly saltRounds = 12;

  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(SecurityProfile.name) private securityProfileModel: Model<SecurityProfileDocument>,
    @InjectModel(CustomerProfile.name) private customerProfileModel: Model<CustomerProfileDocument>,
    @InjectModel(StoreOwnerProfile.name) private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(CourierProfile.name) private courierProfileModel: Model<CourierProfileDocument>,
  ) {}

  /**
   * Create a new account with security profile
   */
  async createAccount(data: {
    fullName: string;
    phone: string;
  }): Promise<AccountDocument> {
    // Check if account already exists
    const existingAccount = await this.accountModel.findOne({ phone: data.phone });
    if (existingAccount) {
      throw new ConflictException('Account with this phone number already exists');
    }

    // Create account
    const account = await this.accountModel.create({
      fullName: data.fullName,
      phone: data.phone,
      role: 'customer',
      isVerified: false,
      isActive: true,
    });

    // Create security profile
    const securityProfile = await this.securityProfileModel.create({
      accountId: account._id,
      phoneVerified: false,
      idVerified: false,
      twoFactorEnabled: false,
      failedAttempts: 0,
      loginHistory: [],
    });

    // Link security profile to account
    account.securityProfileId = securityProfile._id as Types.ObjectId;
    await account.save();

    this.logger.log(`Account created for phone: ${data.phone}`);
    return account;
  }

  /**
   * Verify phone and create customer profile
   */
  async verifyPhoneAndCreateProfile(phone: string): Promise<{
    account: AccountDocument;
    securityProfile: SecurityProfileDocument;
    customerProfile: CustomerProfileDocument;
  }> {
    const account = await this.accountModel.findOne({ phone });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Update security profile
    const securityProfile = await this.securityProfileModel.findOne({
      accountId: account._id,
    });
    if (!securityProfile) {
      throw new NotFoundException('Security profile not found');
    }

    securityProfile.phoneVerified = true;
    await securityProfile.save();

    // Update account
    account.isVerified = true;
    await account.save();

    // Create customer profile
    const customerProfile = await this.customerProfileModel.create({
      accountId: account._id,
      loyaltyPoints: 0,
      tier: 'bronze',
      addresses: [],
      orders: [],
      wishlist: [],
    });

    // Link customer profile to account
    account.roleProfileId = customerProfile._id as Types.ObjectId;
    account.roleProfileRef = 'CustomerProfile';
    await account.save();

    this.logger.log(`Phone verified and customer profile created for: ${phone}`);
    return { account, securityProfile, customerProfile };
  }

  /**
   * Set password for account
   */
  async setPassword(phone: string, password: string, email?: string): Promise<AccountDocument> {
    const account = await this.accountModel.findOne({ phone });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (!account.isVerified) {
      throw new BadRequestException('Account must be verified before setting password');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Update account
    account.passwordHash = passwordHash;
    if (email) {
      account.email = email;
    }
    await account.save();

    this.logger.log(`Password set for account: ${phone}`);
    return account;
  }

  /**
   * Find account by phone
   */
  async findByPhone(phone: string): Promise<AccountDocument | null> {
    return this.accountModel.findOne({ phone, isActive: true });
  }

  /**
   * Find account by ID
   */
  async findById(id: string | Types.ObjectId): Promise<AccountDocument | null> {
    return this.accountModel.findById(id);
  }

  /**
   * Validate password
   */
  async validatePassword(account: AccountDocument, password: string): Promise<boolean> {
    if (!account.passwordHash) {
      return false;
    }
    return bcrypt.compare(password, account.passwordHash);
  }

  /**
   * Update password
   */
  async updatePassword(phone: string, newPassword: string): Promise<void> {
    const account = await this.accountModel.findOne({ phone });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);
    account.passwordHash = passwordHash;
    await account.save();

    this.logger.log(`Password updated for account: ${phone}`);
  }

  /**
   * Add login history entry
   */
  async addLoginHistory(
    accountId: Types.ObjectId,
    ip: string,
    device: string,
    success: boolean,
  ): Promise<void> {
    const securityProfile = await this.securityProfileModel.findOne({ accountId });
    if (!securityProfile) {
      return;
    }

    securityProfile.loginHistory.push({
      ip,
      device,
      timestamp: new Date(),
      success,
    });

    // Keep only last 50 entries
    if (securityProfile.loginHistory.length > 50) {
      securityProfile.loginHistory = securityProfile.loginHistory.slice(-50);
    }

    if (success) {
      securityProfile.failedAttempts = 0;
      securityProfile.lockedUntil = undefined;
    } else {
      securityProfile.failedAttempts += 1;

      // Lock account after 5 failed attempts for 10 minutes
      if (securityProfile.failedAttempts >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 10);
        securityProfile.lockedUntil = lockUntil;
        this.logger.warn(`Account locked until ${lockUntil} due to failed attempts`);
      }
    }

    await securityProfile.save();
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(accountId: Types.ObjectId): Promise<boolean> {
    const securityProfile = await this.securityProfileModel.findOne({ accountId });
    if (!securityProfile || !securityProfile.lockedUntil) {
      return false;
    }

    if (new Date() > securityProfile.lockedUntil) {
      // Unlock account
      securityProfile.lockedUntil = undefined;
      securityProfile.failedAttempts = 0;
      await securityProfile.save();
      return false;
    }

    return true;
  }

  /**
   * Get account with profile
   */
  async getAccountWithProfile(accountId: Types.ObjectId): Promise<any> {
    const account = await this.accountModel.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    let profile = null;
    if (account.roleProfileId && account.roleProfileRef) {
      switch (account.roleProfileRef) {
        case 'CustomerProfile':
          profile = await this.customerProfileModel.findById(account.roleProfileId);
          break;
        case 'StoreOwnerProfile':
          profile = await this.storeOwnerProfileModel.findById(account.roleProfileId);
          break;
        case 'CourierProfile':
          profile = await this.courierProfileModel.findById(account.roleProfileId);
          break;
      }
    }

    return {
      id: account._id,
      fullName: account.fullName,
      phone: account.phone,
      email: account.email,
      role: account.role,
      isVerified: account.isVerified,
      isActive: account.isActive,
      profile,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  /**
   * Upgrade account role
   */
  async upgradeRole(
    accountId: Types.ObjectId,
    newRole: 'store_owner' | 'courier',
  ): Promise<AccountDocument> {
    const account = await this.accountModel.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.role !== 'customer') {
      throw new BadRequestException('Only customer accounts can be upgraded');
    }

    // Create appropriate profile
    let newProfile: any;
    let profileRef: 'StoreOwnerProfile' | 'CourierProfile';

    if (newRole === 'store_owner') {
      newProfile = await this.storeOwnerProfileModel.create({
        accountId: account._id,
        verificationStatus: 'pending',
        rating: 0,
        totalReviews: 0,
        totalSales: 0,
        totalRevenue: 0,
        products: [],
        orders: [],
        isStoreActive: false,
      });
      profileRef = 'StoreOwnerProfile';
    } else {
      newProfile = await this.courierProfileModel.create({
        accountId: account._id,
        verificationStatus: 'pending',
        status: 'offline',
        rating: 0,
        totalReviews: 0,
        totalDeliveries: 0,
        totalEarnings: 0,
        deliveries: [],
        activeDeliveries: [],
        isAvailableForDelivery: false,
      });
      profileRef = 'CourierProfile';
    }

    // Update account
    account.role = newRole;
    account.roleProfileId = newProfile._id as Types.ObjectId;
    account.roleProfileRef = profileRef;
    await account.save();

    this.logger.log(`Account ${accountId} upgraded to ${newRole}`);
    return account;
  }
}

