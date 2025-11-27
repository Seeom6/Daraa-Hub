import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
  StoreCategory,
  StoreCategoryDocument,
} from '../../../../database/schemas';
import { AccountRepository } from '../repositories/account.repository';

/**
 * Account Profile Service
 * Handles profile creation, upgrades, and updates
 */
@Injectable()
export class AccountProfileService {
  private readonly logger = new Logger(AccountProfileService.name);

  constructor(
    private readonly accountRepository: AccountRepository,
    @InjectModel(SecurityProfile.name) private securityProfileModel: Model<SecurityProfileDocument>,
    @InjectModel(CustomerProfile.name) private customerProfileModel: Model<CustomerProfileDocument>,
    @InjectModel(StoreOwnerProfile.name) private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(CourierProfile.name) private courierProfileModel: Model<CourierProfileDocument>,
    @InjectModel(StoreCategory.name) private storeCategoryModel: Model<StoreCategoryDocument>,
  ) {}

  /**
   * Verify phone and create customer profile
   */
  async verifyPhoneAndCreateProfile(phone: string): Promise<{
    account: AccountDocument;
    securityProfile: SecurityProfileDocument;
    customerProfile: CustomerProfileDocument;
  }> {
    const account = await this.accountRepository.getModel().findOne({ phone });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Mark phone as verified
    account.isVerified = true;
    account.role = 'customer';
    await account.save();

    // Get or create security profile
    let securityProfile = await this.securityProfileModel.findOne({ accountId: account._id });
    if (!securityProfile) {
      securityProfile = new this.securityProfileModel({
        accountId: account._id,
        twoFactorEnabled: false,
        failedAttempts: 0,
        loginHistory: [],
      });
      await securityProfile.save();
    }

    // Create customer profile
    const customerProfile = new this.customerProfileModel({
      accountId: account._id,
      fullName: account.fullName,
      loyaltyPoints: 0,
      totalOrders: 0,
      totalSpent: 0,
    });
    await customerProfile.save();

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
    const account = await this.accountRepository.getModel().findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.role === newRole) {
      throw new BadRequestException(`Account is already a ${newRole}`);
    }

    // Create appropriate profile based on new role
    if (newRole === 'store_owner') {
      const existingProfile = await this.storeOwnerProfileModel.findOne({ accountId });
      if (existingProfile) {
        throw new ConflictException('Store owner profile already exists');
      }

      const storeProfile = new this.storeOwnerProfileModel({
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
      });
      await storeProfile.save();
      this.logger.log(`Store owner profile created for account: ${accountId}`);
    } else if (newRole === 'courier') {
      const existingProfile = await this.courierProfileModel.findOne({ accountId });
      if (existingProfile) {
        throw new ConflictException('Courier profile already exists');
      }

      const courierProfile = new this.courierProfileModel({
        accountId,
        fullName: account.fullName,
        isAvailable: false,
        isVerified: false,
        verificationStatus: 'pending',
        totalDeliveries: 0,
        successfulDeliveries: 0,
        rating: 0,
        earnings: 0,
      });
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
    const profile = await this.storeOwnerProfileModel.findOne({
      accountId: new Types.ObjectId(accountId),
    });

    if (!profile) {
      throw new NotFoundException('Store owner profile not found');
    }

    // Update basic fields
    if (updateDto.storeName) profile.storeName = updateDto.storeName;
    if (updateDto.storeDescription) profile.storeDescription = updateDto.storeDescription;
    if (updateDto.storeLogo) profile.storeLogo = updateDto.storeLogo;
    if (updateDto.storeBanner) profile.storeBanner = updateDto.storeBanner;
    if (updateDto.businessAddress) profile.businessAddress = updateDto.businessAddress;
    if (updateDto.businessPhone) profile.businessPhone = updateDto.businessPhone;

    // Update primary category
    if (updateDto.primaryCategoryId) {
      const category = await this.storeCategoryModel.findById(updateDto.primaryCategoryId);
      if (!category) {
        throw new NotFoundException('Primary category not found');
      }
      profile.primaryCategory = new Types.ObjectId(updateDto.primaryCategoryId);
    }

    // Update store categories
    if (updateDto.storeCategoryIds && updateDto.storeCategoryIds.length > 0) {
      // Validate all categories exist
      const categories = await this.storeCategoryModel.find({
        _id: { $in: updateDto.storeCategoryIds.map(id => new Types.ObjectId(id)) },
      });

      if (categories.length !== updateDto.storeCategoryIds.length) {
        throw new NotFoundException('One or more store categories not found');
      }

      profile.storeCategories = updateDto.storeCategoryIds.map(id => new Types.ObjectId(id));
    }

    await profile.save();

    this.logger.log(`Store profile updated for account: ${accountId}`);
    return profile;
  }

  /**
   * Get store owner profile
   */
  async getStoreProfile(accountId: string): Promise<StoreOwnerProfileDocument> {
    const profile = await this.storeOwnerProfileModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .populate('primaryCategory')
      .populate('storeCategories');

    if (!profile) {
      throw new NotFoundException('Store owner profile not found');
    }

    return profile;
  }
}
