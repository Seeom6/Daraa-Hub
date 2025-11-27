import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
} from '../../../../database/schemas';
import { AccountRepository } from '../repositories/account.repository';

/**
 * Core Account Service
 * Handles basic account CRUD operations
 */
@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly accountRepository: AccountRepository,
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
    const existingAccount = await this.accountRepository.getModel().findOne({ phone: data.phone });
    if (existingAccount) {
      throw new ConflictException('Account with this phone number already exists');
    }

    // Create account
    const account = await this.accountRepository.create({
      fullName: data.fullName,
      phone: data.phone,
      role: 'customer',
      isVerified: false,
      isActive: true,
    });

    const savedAccount = await account.save();

    // Create security profile
    const securityProfile = new this.securityProfileModel({
      accountId: savedAccount._id,
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      loginHistory: [],
    });
    await securityProfile.save();

    this.logger.log(`Account created: ${savedAccount.phone} (${savedAccount._id})`);
    return savedAccount;
  }

  /**
   * Find account by phone
   */
  async findByPhone(phone: string): Promise<AccountDocument | null> {
    return this.accountRepository.getModel().findOne({ phone, isActive: true });
  }

  /**
   * Find account by ID
   */
  async findById(id: string | Types.ObjectId): Promise<AccountDocument | null> {
    return this.accountRepository.getModel().findById(id);
  }

  /**
   * Get account with profile
   */
  async getAccountWithProfile(accountId: Types.ObjectId): Promise<any> {
    const account = await this.accountRepository.getModel().findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    let profile: any = null;

    // Get profile based on role
    if (account.role === 'customer') {
      profile = await this.customerProfileModel.findOne({ accountId });
    } else if (account.role === 'store_owner') {
      profile = await this.storeOwnerProfileModel
        .findOne({ accountId })
        .populate('primaryCategory')
        .populate('storeCategories');
    } else if (account.role === 'courier') {
      profile = await this.courierProfileModel.findOne({ accountId });
    }

    return {
      account,
      profile,
    };
  }
}

