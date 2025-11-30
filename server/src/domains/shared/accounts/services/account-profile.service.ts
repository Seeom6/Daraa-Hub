import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  AccountDocument,
  SecurityProfileDocument,
  CustomerProfileDocument,
  StoreOwnerProfileDocument,
} from '../../../../database/schemas';
import { AccountRepository } from '../repositories/account.repository';
import { SecurityProfileRepository } from '../repositories/security-profile.repository';
import { CustomerProfileRepository } from '../repositories/customer-profile.repository';
import { StoreOwnerProfileRepository } from '../repositories/store-owner-profile.repository';
import { CourierProfileRepository } from '../repositories/courier-profile.repository';
import { StoreCategoryRepository } from '../../store-categories/repositories/store-category.repository';

/**
 * Account Profile Service
 * Handles profile creation, upgrades, and updates
 * Uses Repository Pattern for all database operations
 */
@Injectable()
export class AccountProfileService {
  private readonly logger = new Logger(AccountProfileService.name);

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly securityProfileRepository: SecurityProfileRepository,
    private readonly customerProfileRepository: CustomerProfileRepository,
    private readonly storeOwnerProfileRepository: StoreOwnerProfileRepository,
    private readonly courierProfileRepository: CourierProfileRepository,
    private readonly storeCategoryRepository: StoreCategoryRepository,
  ) {}

  /**
   * Verify phone and create customer profile
   */
  async verifyPhoneAndCreateProfile(phone: string): Promise<{
    account: AccountDocument;
    securityProfile: SecurityProfileDocument;
    customerProfile: CustomerProfileDocument;
  }> {
    const account = await this.accountRepository.findByPhone(phone);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Mark phone as verified
    account.isVerified = true;
    account.role = 'customer';
    await account.save();

    // Get or create security profile using Repository
    let securityProfile = await this.securityProfileRepository.findByAccountId(
      (account._id as Types.ObjectId).toString(),
    );
    if (!securityProfile) {
      const newSecurityProfile = await this.securityProfileRepository.create({
        accountId: account._id,
        twoFactorEnabled: false,
        failedAttempts: 0,
        loginHistory: [],
      } as any);
      securityProfile = await newSecurityProfile.save();
    }

    // Create customer profile using Repository
    const newCustomerProfile = await this.customerProfileRepository.create({
      accountId: account._id,
      fullName: account.fullName,
      loyaltyPoints: 0,
      totalOrders: 0,
      totalSpent: 0,
    } as any);
    const customerProfile = await newCustomerProfile.save();

    this.logger.log(`Customer profile created for account: ${account.phone}`);

    return {
      account,
      securityProfile,
      customerProfile,
    };
  }

  /**
   * Upgrade account role
   */
  async upgradeRole(
    accountId: Types.ObjectId,
    newRole: 'store_owner' | 'courier',
  ): Promise<AccountDocument> {
    const account = await this.accountRepository.findById(accountId.toString());
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.role === newRole) {
      throw new BadRequestException(`Account is already a ${newRole}`);
    }

    // Create appropriate profile based on new role
    if (newRole === 'store_owner') {
      const existingProfile =
        await this.storeOwnerProfileRepository.findByAccountId(
          accountId.toString(),
        );
      if (existingProfile) {
        throw new ConflictException('Store owner profile already exists');
      }

      const storeProfile = await this.storeOwnerProfileRepository.create({
        accountId,
        businessName: account.fullName,
        isVerified: false,
        verificationStatus: 'pending',
        hasActiveSubscription: false,
        dailyProductLimit: 5,
        maxImagesPerProduct: 5,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
      } as any);
      await storeProfile.save();
      this.logger.log(`Store owner profile created for account: ${accountId}`);
    } else if (newRole === 'courier') {
      const existingProfile =
        await this.courierProfileRepository.findByAccountId(
          accountId.toString(),
        );
      if (existingProfile) {
        throw new ConflictException('Courier profile already exists');
      }

      const courierProfile = await this.courierProfileRepository.create({
        accountId,
        fullName: account.fullName,
        isAvailable: false,
        isVerified: false,
        verificationStatus: 'pending',
        totalDeliveries: 0,
        successfulDeliveries: 0,
        rating: 0,
        earnings: 0,
      } as any);
      await courierProfile.save();
      this.logger.log(`Courier profile created for account: ${accountId}`);
    }

    account.role = newRole;
    await account.save();

    return account;
  }

  /**
   * Update store owner profile
   */
  async updateStoreProfile(
    accountId: string,
    updateDto: {
      storeName?: string;
      storeDescription?: string;
      storeLogo?: string;
      storeBanner?: string;
      businessAddress?: string;
      businessPhone?: string;
      primaryCategoryId?: string;
      storeCategoryIds?: string[];
    },
  ): Promise<StoreOwnerProfileDocument> {
    const profile =
      await this.storeOwnerProfileRepository.findByAccountId(accountId);

    if (!profile) {
      throw new NotFoundException('Store owner profile not found');
    }

    // Update basic fields
    if (updateDto.storeName) profile.storeName = updateDto.storeName;
    if (updateDto.storeDescription)
      profile.storeDescription = updateDto.storeDescription;
    if (updateDto.storeLogo) profile.storeLogo = updateDto.storeLogo;
    if (updateDto.storeBanner) profile.storeBanner = updateDto.storeBanner;
    if (updateDto.businessAddress)
      profile.businessAddress = updateDto.businessAddress;
    if (updateDto.businessPhone)
      profile.businessPhone = updateDto.businessPhone;

    // Update primary category using Repository
    if (updateDto.primaryCategoryId) {
      const category = await this.storeCategoryRepository.findById(
        updateDto.primaryCategoryId,
      );
      if (!category) {
        throw new NotFoundException('Primary category not found');
      }
      profile.primaryCategory = new Types.ObjectId(updateDto.primaryCategoryId);
    }

    // Update store categories using Repository
    if (updateDto.storeCategoryIds && updateDto.storeCategoryIds.length > 0) {
      // Validate all categories exist
      const categories = await Promise.all(
        updateDto.storeCategoryIds.map((id) =>
          this.storeCategoryRepository.findById(id),
        ),
      );

      if (categories.some((c) => !c)) {
        throw new NotFoundException('One or more store categories not found');
      }

      profile.storeCategories = updateDto.storeCategoryIds.map(
        (id) => new Types.ObjectId(id),
      );
    }

    await profile.save();

    this.logger.log(`Store profile updated for account: ${accountId}`);
    return profile;
  }

  /**
   * Get store owner profile
   */
  async getStoreProfile(accountId: string): Promise<StoreOwnerProfileDocument> {
    const profile =
      await this.storeOwnerProfileRepository.findByAccountId(accountId);

    if (!profile) {
      throw new NotFoundException('Store owner profile not found');
    }

    return profile;
  }
}
