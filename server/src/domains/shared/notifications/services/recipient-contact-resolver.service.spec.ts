import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RecipientContactResolverService } from './recipient-contact-resolver.service';
import { Account } from '../../../../database/schemas/account.schema';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';
import { AdminProfile } from '../../../../database/schemas/admin-profile.schema';

describe('RecipientContactResolverService', () => {
  let service: RecipientContactResolverService;
  let mockAccountModel: any;
  let mockCustomerProfileModel: any;
  let mockStoreOwnerProfileModel: any;
  let mockCourierProfileModel: any;
  let mockAdminProfileModel: any;

  const mockAccountId = new Types.ObjectId().toString();
  const mockAccount = {
    _id: new Types.ObjectId(mockAccountId),
    phone: '+963991234567',
    email: 'test@example.com',
    fullName: 'Test User',
  };

  beforeEach(async () => {
    mockAccountModel = {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAccount) }),
    };
    mockCustomerProfileModel = {
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    mockStoreOwnerProfileModel = {
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    mockCourierProfileModel = {
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    mockAdminProfileModel = {
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipientContactResolverService,
        { provide: getModelToken(Account.name), useValue: mockAccountModel },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: mockCustomerProfileModel,
        },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreOwnerProfileModel,
        },
        {
          provide: getModelToken(CourierProfile.name),
          useValue: mockCourierProfileModel,
        },
        {
          provide: getModelToken(AdminProfile.name),
          useValue: mockAdminProfileModel,
        },
      ],
    }).compile();

    service = module.get<RecipientContactResolverService>(
      RecipientContactResolverService,
    );
  });

  describe('resolveContactInfo', () => {
    it('should resolve contact info for customer', async () => {
      const result = await service.resolveContactInfo(
        mockAccountId,
        'customer',
      );

      expect(result).toEqual({
        phone: '+963991234567',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'customer',
      });
    });

    it('should resolve contact info for store_owner with business phone', async () => {
      mockStoreOwnerProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          businessPhone: '+963991111111',
          storeName: 'Test Store',
        }),
      });

      const result = await service.resolveContactInfo(
        mockAccountId,
        'store_owner',
      );

      expect(result?.phone).toBe('+963991111111');
      expect(result?.fullName).toBe('Test Store');
    });

    it('should return null if account not found', async () => {
      mockAccountModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.resolveContactInfo(
        mockAccountId,
        'customer',
      );

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockAccountModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const result = await service.resolveContactInfo(
        mockAccountId,
        'customer',
      );

      expect(result).toBeNull();
    });

    it('should resolve contact info for courier', async () => {
      const result = await service.resolveContactInfo(mockAccountId, 'courier');

      expect(result?.role).toBe('courier');
    });

    it('should resolve contact info for admin', async () => {
      const result = await service.resolveContactInfo(mockAccountId, 'admin');

      expect(result?.role).toBe('admin');
    });
  });

  describe('getPhoneNumber', () => {
    it('should return phone number', async () => {
      const result = await service.getPhoneNumber(mockAccountId, 'customer');

      expect(result).toBe('+963991234567');
    });

    it('should return null if contact not found', async () => {
      mockAccountModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getPhoneNumber(mockAccountId, 'customer');

      expect(result).toBeNull();
    });
  });

  describe('getEmail', () => {
    it('should return email', async () => {
      const result = await service.getEmail(mockAccountId, 'customer');

      expect(result).toBe('test@example.com');
    });

    it('should return null if contact not found', async () => {
      mockAccountModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getEmail(mockAccountId, 'customer');

      expect(result).toBeNull();
    });
  });
});
