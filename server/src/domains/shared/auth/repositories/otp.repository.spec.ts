import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OTPRepository } from './otp.repository';
import { Otp } from '../../../../database/schemas/otp.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('OTPRepository', () => {
  let repository: OTPRepository;
  let mockModel: any;

  const createMockOtp = (overrides = {}) => ({
    _id: generateObjectId(),
    phoneNumber: '+963991234567',
    code: '123456',
    isUsed: false,
    expiresAt: new Date(Date.now() + 300000), // 5 minutes from now
    createdAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    mockModel = MockModelFactory.create();
    mockModel.deleteMany = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OTPRepository,
        {
          provide: getModelToken(Otp.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<OTPRepository>(OTPRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByPhoneAndCode', () => {
    it('should find valid OTP by phone and code', async () => {
      const mockOtp = createMockOtp();
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOtp),
      });

      const result = await repository.findByPhoneAndCode(
        '+963991234567',
        '123456',
      );

      expect(result).toEqual(mockOtp);
    });

    it('should return null for invalid OTP', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByPhoneAndCode(
        '+963991234567',
        '000000',
      );

      expect(result).toBeNull();
    });
  });

  describe('findLatestByPhone', () => {
    it('should find latest OTP by phone number', async () => {
      const mockOtp = createMockOtp();
      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOtp),
        }),
      });

      const result = await repository.findLatestByPhone('+963991234567');

      expect(result).toEqual(mockOtp);
    });
  });

  describe('markAsUsed', () => {
    it('should mark OTP as used', async () => {
      const otpId = generateObjectId();
      const mockOtp = createMockOtp({ isUsed: true });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOtp),
      });

      const result = await repository.markAsUsed(otpId);

      expect(result?.isUsed).toBe(true);
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired OTPs', async () => {
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 50 });

      const result = await repository.deleteExpired();

      expect(result).toBe(50);
      expect(mockModel.deleteMany).toHaveBeenCalled();
    });
  });

  describe('countRecentByPhone', () => {
    it('should count recent OTPs sent to phone', async () => {
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await repository.countRecentByPhone('+963991234567', 60);

      expect(result).toBe(3);
    });

    it('should use default 60 minutes when not specified', async () => {
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await repository.countRecentByPhone('+963991234567');

      expect(result).toBe(5);
      expect(mockModel.countDocuments).toHaveBeenCalled();
    });
  });
});
