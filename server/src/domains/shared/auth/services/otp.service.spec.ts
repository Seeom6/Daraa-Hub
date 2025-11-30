import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { Otp } from '../entities/otp.entity';
import { MockModelFactory } from '../../testing';

describe('OtpService', () => {
  let service: OtpService;
  let mockModel: any;

  const mockConfigService = {
    get: jest.fn().mockReturnValue(5),
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create();
    mockModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: getModelToken(Otp.name), useValue: mockModel },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOtp', () => {
    it('should generate a numeric OTP', () => {
      const otp = service.generateOtp();

      expect(parseInt(otp)).toBeGreaterThanOrEqual(10000);
      expect(parseInt(otp)).toBeLessThanOrEqual(999999);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs on each call', () => {
      const otp1 = service.generateOtp();
      const otp2 = service.generateOtp();
      const otp3 = service.generateOtp();

      // At least 2 of 3 should be different (statistically very likely)
      const unique = new Set([otp1, otp2, otp3]);
      expect(unique.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('hashOtp', () => {
    it('should hash OTP', async () => {
      const otp = '123456';
      const hashedOtp = await service.hashOtp(otp);

      expect(hashedOtp).not.toBe(otp);
      expect(hashedOtp.length).toBeGreaterThan(0);
    });
  });

  describe('verifyOtp', () => {
    it('should return true for valid OTP', async () => {
      const otp = '123456';
      const hashedOtp = await service.hashOtp(otp);

      const result = await service.verifyOtp(otp, hashedOtp);

      expect(result).toBe(true);
    });

    it('should return false for invalid OTP', async () => {
      const otp = '123456';
      const hashedOtp = await service.hashOtp(otp);

      const result = await service.verifyOtp('654321', hashedOtp);

      expect(result).toBe(false);
    });
  });

  describe('createOtp', () => {
    it('should create and store OTP', async () => {
      mockModel.create.mockResolvedValue({});

      await service.createOtp('+963991234567', '123456', 'login');

      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        phoneNumber: '+963991234567',
        type: 'login',
      });
      expect(mockModel.create).toHaveBeenCalled();
    });
  });

  describe('findOtp', () => {
    it('should find OTP by phone number and type', async () => {
      const mockOtp = { phoneNumber: '+963991234567', type: 'login' };
      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOtp),
      });

      const result = await service.findOtp('+963991234567', 'login');

      expect(result).toEqual(mockOtp);
    });

    it('should return null if OTP not found', async () => {
      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOtp('+963999999999', 'login');

      expect(result).toBeNull();
    });
  });

  describe('incrementAttempts', () => {
    it('should increment OTP attempts', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue({});

      await service.incrementAttempts('otp-id');

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('otp-id', {
        $inc: { attempts: 1 },
      });
    });
  });

  describe('markAsUsed', () => {
    it('should mark OTP as used', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue({});

      await service.markAsUsed('otp-id');

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('otp-id', {
        isUsed: true,
      });
    });
  });

  describe('isExpired', () => {
    it('should return true for expired OTP', () => {
      const pastDate = new Date(Date.now() - 60000);

      const result = service.isExpired(pastDate);

      expect(result).toBe(true);
    });

    it('should return false for valid OTP', () => {
      const futureDate = new Date(Date.now() + 60000);

      const result = service.isExpired(futureDate);

      expect(result).toBe(false);
    });
  });

  describe('isMaxAttemptsReached', () => {
    it('should return true when max attempts reached', () => {
      const result = service.isMaxAttemptsReached(5);

      expect(result).toBe(true);
    });

    it('should return false when attempts below max', () => {
      const result = service.isMaxAttemptsReached(2);

      expect(result).toBe(false);
    });
  });

  describe('deleteOtp', () => {
    it('should delete OTP by phone number and type', async () => {
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 1 });

      await service.deleteOtp('+963991234567', 'login');

      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        phoneNumber: '+963991234567',
        type: 'login',
      });
    });
  });
});
