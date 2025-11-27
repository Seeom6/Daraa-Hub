import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountDocument } from '../../../../database/schemas/account.schema';
import { CustomerProfile, CustomerProfileDocument } from '../../../../database/schemas/customer-profile.schema';
import { StoreOwnerProfile, StoreOwnerProfileDocument } from '../../../../database/schemas/store-owner-profile.schema';
import { CourierProfile, CourierProfileDocument } from '../../../../database/schemas/courier-profile.schema';
import { AdminProfile, AdminProfileDocument } from '../../../../database/schemas/admin-profile.schema';

/**
 * معلومات الاتصال للمستلم
 * Recipient contact information
 */
export interface RecipientContactInfo {
  /** رقم الهاتف - Phone number */
  phone: string;
  
  /** البريد الإلكتروني - Email address */
  email?: string;
  
  /** الاسم الكامل - Full name */
  fullName: string;
  
  /** دور المستخدم - User role */
  role: 'customer' | 'store_owner' | 'courier' | 'admin';
}

/**
 * خدمة مركزية لجلب معلومات الاتصال للمستلمين
 * Centralized service for resolving recipient contact information
 * 
 * هذه الخدمة قابلة لإعادة الاستخدام ومستقلة عن مكتبات الإرسال (Twilio, etc.)
 * This service is reusable and independent of sending libraries (Twilio, etc.)
 * 
 * @example
 * // Get phone number for any user type
 * const contact = await resolver.resolveContactInfo(userId, 'customer');
 * await smsService.send(contact.phone, message);
 */
@Injectable()
export class RecipientContactResolverService {
  private readonly logger = new Logger(RecipientContactResolverService.name);

  constructor(
    @InjectModel(Account.name)
    private accountModel: Model<AccountDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    @InjectModel(AdminProfile.name)
    private adminProfileModel: Model<AdminProfileDocument>,
  ) {}

  /**
   * جلب معلومات الاتصال للمستلم بناءً على دوره
   * Resolve contact information for a recipient based on their role
   * 
   * @param recipientId - معرف المستلم (Account ID)
   * @param role - دور المستخدم
   * @returns معلومات الاتصال أو null إذا لم يتم العثور عليها
   */
  async resolveContactInfo(
    recipientId: string | Types.ObjectId,
    role: 'customer' | 'store_owner' | 'courier' | 'admin',
  ): Promise<RecipientContactInfo | null> {
    try {
      // جلب معلومات الحساب الأساسية
      // Get basic account information
      const account = await this.accountModel.findById(recipientId).exec();
      
      if (!account) {
        this.logger.warn(`Account not found: ${recipientId}`);
        return null;
      }

      // رقم الهاتف موجود في Account schema
      // Phone number is in Account schema
      const contactInfo: RecipientContactInfo = {
        phone: account.phone,
        email: account.email,
        fullName: account.fullName,
        role: role,
      };

      // جلب معلومات إضافية من Profile إذا لزم الأمر
      // Get additional information from Profile if needed
      switch (role) {
        case 'store_owner':
          await this.enrichStoreOwnerContact(account, contactInfo);
          break;
        case 'customer':
          await this.enrichCustomerContact(account, contactInfo);
          break;
        case 'courier':
          await this.enrichCourierContact(account, contactInfo);
          break;
        case 'admin':
          await this.enrichAdminContact(account, contactInfo);
          break;
      }

      return contactInfo;
    } catch (error) {
      this.logger.error(
        `Failed to resolve contact info for ${recipientId} (${role}):`,
        error,
      );
      return null;
    }
  }

  /**
   * إثراء معلومات الاتصال لصاحب المتجر
   * Enrich contact information for store owner
   */
  private async enrichStoreOwnerContact(
    account: AccountDocument,
    contactInfo: RecipientContactInfo,
  ): Promise<void> {
    try {
      const profile = await this.storeOwnerProfileModel
        .findOne({ accountId: account._id })
        .exec();

      if (profile) {
        // استخدام رقم العمل إذا كان متوفراً
        // Use business phone if available
        if (profile.businessPhone) {
          contactInfo.phone = profile.businessPhone;
        }
        
        // استخدام اسم المتجر إذا كان متوفراً
        // Use store name if available
        if (profile.storeName) {
          contactInfo.fullName = profile.storeName;
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to enrich store owner contact: ${error.message}`);
      // لا نرمي خطأ، نستخدم المعلومات الأساسية من Account
      // Don't throw, use basic info from Account
    }
  }

  /**
   * إثراء معلومات الاتصال للعميل
   * Enrich contact information for customer
   */
  private async enrichCustomerContact(
    account: AccountDocument,
    contactInfo: RecipientContactInfo,
  ): Promise<void> {
    try {
      const profile = await this.customerProfileModel
        .findOne({ accountId: account._id })
        .exec();

      if (profile) {
        // يمكن إضافة معلومات إضافية هنا في المستقبل
        // Can add additional information here in the future
        // مثل: العنوان المفضل، رقم هاتف بديل، إلخ
        // e.g., preferred address, alternative phone, etc.
      }
    } catch (error) {
      this.logger.warn(`Failed to enrich customer contact: ${error.message}`);
    }
  }

  /**
   * إثراء معلومات الاتصال للساعي
   * Enrich contact information for courier
   */
  private async enrichCourierContact(
    account: AccountDocument,
    contactInfo: RecipientContactInfo,
  ): Promise<void> {
    try {
      const profile = await this.courierProfileModel
        .findOne({ accountId: account._id })
        .exec();

      if (profile) {
        // يمكن إضافة معلومات إضافية هنا في المستقبل
        // Can add additional information here in the future
      }
    } catch (error) {
      this.logger.warn(`Failed to enrich courier contact: ${error.message}`);
    }
  }

  /**
   * إثراء معلومات الاتصال للمسؤول
   * Enrich contact information for admin
   */
  private async enrichAdminContact(
    account: AccountDocument,
    contactInfo: RecipientContactInfo,
  ): Promise<void> {
    try {
      const profile = await this.adminProfileModel
        .findOne({ accountId: account._id })
        .exec();

      if (profile) {
        // يمكن إضافة معلومات إضافية هنا في المستقبل
        // Can add additional information here in the future
      }
    } catch (error) {
      this.logger.warn(`Failed to enrich admin contact: ${error.message}`);
    }
  }

  /**
   * جلب رقم الهاتف فقط (اختصار)
   * Get phone number only (shortcut)
   * 
   * @param recipientId - معرف المستلم
   * @param role - دور المستخدم
   * @returns رقم الهاتف أو null
   */
  async getPhoneNumber(
    recipientId: string | Types.ObjectId,
    role: 'customer' | 'store_owner' | 'courier' | 'admin',
  ): Promise<string | null> {
    const contactInfo = await this.resolveContactInfo(recipientId, role);
    return contactInfo?.phone || null;
  }

  /**
   * جلب البريد الإلكتروني فقط (اختصار)
   * Get email only (shortcut)
   * 
   * @param recipientId - معرف المستلم
   * @param role - دور المستخدم
   * @returns البريد الإلكتروني أو null
   */
  async getEmail(
    recipientId: string | Types.ObjectId,
    role: 'customer' | 'store_owner' | 'courier' | 'admin',
  ): Promise<string | null> {
    const contactInfo = await this.resolveContactInfo(recipientId, role);
    return contactInfo?.email || null;
  }
}

