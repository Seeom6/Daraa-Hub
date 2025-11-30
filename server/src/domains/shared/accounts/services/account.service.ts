import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { AccountDocument } from '../../../../database/schemas';
import { AccountRepository } from '../repositories/account.repository';
import { SecurityProfileRepository } from '../repositories/security-profile.repository';
import { CustomerProfileRepository } from '../repositories/customer-profile.repository';
import { StoreOwnerProfileRepository } from '../repositories/store-owner-profile.repository';
import { CourierProfileRepository } from '../repositories/courier-profile.repository';

/**
 * Core Account Service
 * Handles basic account CRUD operations
 * Uses Repository Pattern for all database operations
 */
@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly securityProfileRepository: SecurityProfileRepository,
    private readonly customerProfileRepository: CustomerProfileRepository,
    private readonly storeOwnerProfileRepository: StoreOwnerProfileRepository,
    private readonly courierProfileRepository: CourierProfileRepository,
  ) {}

  /**
   * Create a new account with security profile
   */
  async createAccount(data: {
    fullName: string;
    phone: string;
  }): Promise<AccountDocument> {
    // Check if account already exists
    const existingAccount = await this.accountRepository
      .getModel()
      .findOne({ phone: data.phone });
    if (existingAccount) {
      throw new ConflictException(
        'Account with this phone number already exists',
      );
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

    // Create security profile using Repository
    const securityProfile = await this.securityProfileRepository.create({
      accountId: savedAccount._id,
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      loginHistory: [],
    } as any);
    await securityProfile.save();

    this.logger.log(
      `Account created: ${savedAccount.phone} (${savedAccount._id})`,
    );
    return savedAccount;
  }

  /**
   * Find account by phone
   */
  async findByPhone(phone: string): Promise<AccountDocument | null> {
    return this.accountRepository.findByPhone(phone);
  }

  /**
   * Find account by ID
   */
  async findById(id: string | Types.ObjectId): Promise<AccountDocument | null> {
    return this.accountRepository.findById(id.toString());
  }

  /**
   * Get account with profile
   */
  async getAccountWithProfile(accountId: Types.ObjectId): Promise<any> {
    const account = await this.accountRepository.findById(accountId.toString());
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    let profile: any = null;

    // Get profile based on role using Repositories
    if (account.role === 'customer') {
      profile = await this.customerProfileRepository.findByAccountId(
        accountId.toString(),
      );
    } else if (account.role === 'store_owner') {
      profile = await this.storeOwnerProfileRepository.findByAccountId(
        accountId.toString(),
      );
    } else if (account.role === 'courier') {
      profile = await this.courierProfileRepository.findByAccountId(
        accountId.toString(),
      );
    }

    return {
      account,
      profile,
    };
  }
}
