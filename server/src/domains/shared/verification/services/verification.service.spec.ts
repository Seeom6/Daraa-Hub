import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VerificationService } from './verification.service';
import { VerificationRequest } from '../../../../database/schemas/verification-request.schema';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';
import { generateObjectId } from '../../testing';

describe('VerificationService', () => {
  let service: VerificationService;
  let mockVerificationModel: any;
  let mockStoreOwnerModel: any;
  let mockCourierModel: any;
  let mockEventEmitter: any;
  let mockSave: jest.Mock;

  const accountId = generateObjectId();
  const verificationId = generateObjectId();

  const mockVerification = {
    _id: verificationId,
    accountId,
    applicantType: 'store_owner',
    status: 'pending',
  };

  const mockStoreProfile = {
    _id: generateObjectId(),
    accountId,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockCourierProfile = {
    _id: generateObjectId(),
    accountId,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockSave = jest.fn().mockResolvedValue({ _id: generateObjectId() });
    mockVerificationModel = jest
      .fn()
      .mockImplementation(() => ({ save: mockSave }));
    mockVerificationModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
      sort: jest.fn().mockReturnThis(),
    });
    mockVerificationModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockVerification]),
    });
    mockVerificationModel.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockVerification),
    });
    mockVerificationModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    mockStoreOwnerModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreProfile),
      }),
      findOneAndUpdate: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(true) }),
    };

    mockCourierModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourierProfile),
      }),
      findOneAndUpdate: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(true) }),
    };

    mockEventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: getModelToken(VerificationRequest.name),
          useValue: mockVerificationModel,
        },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreOwnerModel,
        },
        {
          provide: getModelToken(CourierProfile.name),
          useValue: mockCourierModel,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitVerification', () => {
    it('should submit verification for store owner', async () => {
      await service.submitVerification(accountId, {
        applicantType: 'store_owner',
        personalInfo: { fullName: 'Test', nationalId: '123' },
      });

      expect(mockSave).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });

    it('should submit verification for courier', async () => {
      await service.submitVerification(accountId, {
        applicantType: 'courier',
        personalInfo: { fullName: 'Test', nationalId: '123' },
      });

      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw if pending request exists', async () => {
      mockVerificationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVerification),
      });

      await expect(
        service.submitVerification(accountId, {
          applicantType: 'store_owner',
          personalInfo: {} as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if store profile not found', async () => {
      mockStoreOwnerModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.submitVerification(accountId, {
          applicantType: 'store_owner',
          personalInfo: {} as any,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if courier profile not found', async () => {
      mockCourierModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.submitVerification(accountId, {
          applicantType: 'courier',
          personalInfo: {} as any,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw for invalid applicant type', async () => {
      await expect(
        service.submitVerification(accountId, {
          applicantType: 'invalid' as any,
          personalInfo: {} as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyVerificationStatus', () => {
    it('should return verification status', async () => {
      mockVerificationModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockVerification),
      });

      const result = await service.getMyVerificationStatus(accountId);

      expect(result).toEqual(mockVerification);
    });
  });

  describe('getAllVerificationRequests', () => {
    it('should return paginated requests', async () => {
      const result = await service.getAllVerificationRequests({});

      expect(result.requests).toEqual([mockVerification]);
      expect(result.total).toBe(1);
    });

    it('should apply filters', async () => {
      await service.getAllVerificationRequests({
        status: 'pending',
        applicantType: 'store_owner',
        page: 1,
        limit: 10,
      });

      expect(mockVerificationModel.find).toHaveBeenCalled();
    });
  });

  describe('getVerificationRequestById', () => {
    it('should return verification by id', async () => {
      const result = await service.getVerificationRequestById(verificationId);

      expect(result).toEqual(mockVerification);
    });

    it('should throw if not found', async () => {
      mockVerificationModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getVerificationRequestById(verificationId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitVerification with business info', () => {
    it('should update store categories when primaryCategory provided', async () => {
      const categoryId = generateObjectId();
      await service.submitVerification(accountId, {
        applicantType: 'store_owner',
        personalInfo: { fullName: 'Test', nationalId: '123' },
        businessInfo: { primaryCategory: categoryId },
      } as any);

      expect(mockStoreProfile.save).toHaveBeenCalled();
    });

    it('should update store categories when storeCategories provided', async () => {
      const categoryId = generateObjectId();
      await service.submitVerification(accountId, {
        applicantType: 'store_owner',
        personalInfo: { fullName: 'Test', nationalId: '123' },
        businessInfo: { storeCategories: [categoryId] },
      } as any);

      expect(mockStoreProfile.save).toHaveBeenCalled();
    });
  });

  describe('getAllVerificationRequests with default pagination', () => {
    it('should use default page and limit when not provided', async () => {
      const result = await service.getAllVerificationRequests();

      expect(result.page).toBe(1);
    });

    it('should filter by status only', async () => {
      await service.getAllVerificationRequests({ status: 'approved' });

      expect(mockVerificationModel.find).toHaveBeenCalled();
    });

    it('should filter by applicantType only', async () => {
      await service.getAllVerificationRequests({ applicantType: 'courier' });

      expect(mockVerificationModel.find).toHaveBeenCalled();
    });
  });
});
