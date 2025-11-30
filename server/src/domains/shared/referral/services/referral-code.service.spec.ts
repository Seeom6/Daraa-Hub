import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReferralCodeService } from './referral-code.service';
import {
  Referral,
  ReferralStatus,
} from '../../../../database/schemas/referral.schema';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';
import { generateObjectId, createMockEventEmitter } from '../../testing';

describe('ReferralCodeService', () => {
  let service: ReferralCodeService;
  let referralModel: any;
  let customerProfileModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const customerId = generateObjectId();
  const referredId = generateObjectId();

  const mockCustomer = {
    _id: customerId,
    accountId: 'customer123',
    orders: [],
  };

  const mockReferral = {
    _id: generateObjectId(),
    referrerId: customerId,
    code: 'ABC12345',
    status: ReferralStatus.PENDING,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    referralModel = {
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      create: jest.fn().mockResolvedValue(mockReferral),
    };

    customerProfileModel = {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockCustomer) }),
    };

    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralCodeService,
        { provide: getModelToken(Referral.name), useValue: referralModel },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: customerProfileModel,
        },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<ReferralCodeService>(ReferralCodeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReferralCode', () => {
    it('should generate unique 8-character code', async () => {
      const code = await service.generateReferralCode();

      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });
  });

  describe('getOrCreateReferralCode', () => {
    it('should create new referral code', async () => {
      const result = await service.getOrCreateReferralCode(customerId);

      expect(referralModel.create).toHaveBeenCalled();
    });

    it('should return existing referral code', async () => {
      referralModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReferral),
      });

      const result = await service.getOrCreateReferralCode(customerId);

      expect(referralModel.create).not.toHaveBeenCalled();
    });

    it('should throw if customer not found', async () => {
      customerProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getOrCreateReferralCode(customerId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw for invalid customer ID', async () => {
      await expect(service.getOrCreateReferralCode('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('applyReferralCode', () => {
    it('should apply referral code', async () => {
      referralModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockReferral),
        });

      const result = await service.applyReferralCode('ABC12345', referredId);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'referral.applied',
        expect.any(Object),
      );
    });

    it('should throw if already used referral', async () => {
      referralModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReferral),
      });

      await expect(
        service.applyReferralCode('ABC12345', referredId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if using own code', async () => {
      referralModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue({
            ...mockReferral,
            referrerId: { toString: () => customerId },
          }),
        });

      await expect(
        service.applyReferralCode('ABC12345', customerId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeReferral', () => {
    it('should complete referral', async () => {
      referralModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReferral),
      });

      await service.completeReferral(referredId, generateObjectId());

      expect(mockReferral.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'referral.completed',
        expect.any(Object),
      );
    });

    it('should throw if referral not found', async () => {
      referralModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.completeReferral(referredId, generateObjectId()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw for invalid customer ID', async () => {
      await expect(
        service.completeReferral('invalid', generateObjectId()),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if referral already completed', async () => {
      const completedReferral = {
        ...mockReferral,
        status: ReferralStatus.COMPLETED,
      };
      referralModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(completedReferral),
      });

      await expect(
        service.completeReferral(referredId, generateObjectId()),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('applyReferralCode additional cases', () => {
    it('should throw for invalid customer ID', async () => {
      await expect(
        service.applyReferralCode('ABC12345', 'invalid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if customer not found', async () => {
      customerProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.applyReferralCode('ABC12345', referredId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if referral code not found', async () => {
      referralModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.applyReferralCode('INVALID', referredId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if customer has existing orders', async () => {
      const customerWithOrders = { ...mockCustomer, orders: ['order1'] };
      customerProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(customerWithOrders),
      });
      referralModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockReferral),
        });

      await expect(
        service.applyReferralCode('ABC12345', referredId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateReferralCode with collision', () => {
    it('should regenerate code if collision occurs', async () => {
      let callCount = 0;
      referralModel.findOne.mockImplementation(() => ({
        exec: jest.fn().mockImplementation(() => {
          callCount++;
          return callCount === 1 ? { code: 'EXISTS' } : null;
        }),
      }));

      const code = await service.generateReferralCode();

      expect(code).toHaveLength(8);
    });
  });
});
