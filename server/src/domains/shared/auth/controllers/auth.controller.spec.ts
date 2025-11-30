import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { generateObjectId } from '../../testing';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    registerStep1: jest.fn(),
    verifyOtp: jest.fn(),
    completeProfile: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    forgotPassword: jest.fn(),
    verifyForgotPasswordOtp: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  const mockRequest = {
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
    headers: { 'user-agent': 'test-agent' },
    cookies: {},
    user: { userId: generateObjectId(), role: 'customer' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerStep1', () => {
    it('should send OTP for registration', async () => {
      const dto = { phoneNumber: '+963991234567', role: 'customer' };
      const mockResult = { success: true, message: 'OTP sent' };

      mockAuthService.registerStep1.mockResolvedValue(mockResult);

      const result = await controller.registerStep1(dto as any);

      expect(result).toEqual(mockResult);
      expect(mockAuthService.registerStep1).toHaveBeenCalledWith(dto);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP', async () => {
      const dto = { phoneNumber: '+963991234567', otp: '123456' };
      const mockResult = { success: true, verificationToken: 'token' };

      mockAuthService.verifyOtp.mockResolvedValue(mockResult);

      const result = await controller.verifyOtp(dto as any);

      expect(result).toEqual(mockResult);
    });
  });

  describe('completeProfile', () => {
    it('should complete profile and set cookies', async () => {
      const dto = {
        verificationToken: 'token',
        name: 'Test User',
        password: 'Password123',
      };
      const mockResult = {
        message: 'Profile completed',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        role: 'customer',
      };

      mockAuthService.completeProfile.mockResolvedValue(mockResult);

      const result = await controller.completeProfile(
        dto as any,
        mockResponse as any,
      );

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result.message).toBe('Profile completed');
      expect(result.role).toBe('customer');
    });
  });

  describe('login', () => {
    it('should login and set cookies', async () => {
      const dto = { phoneNumber: '+963991234567', password: 'Password123' };
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        role: 'customer',
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const result = await controller.login(
        dto as any,
        mockRequest as any,
        mockResponse as any,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('logout', () => {
    it('should clear cookies on logout', async () => {
      const result = await controller.logout(mockResponse as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const result = await controller.getCurrentUser(mockRequest as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRequest.user);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const requestWithToken = {
        ...mockRequest,
        cookies: { refresh_token: 'valid-token' },
      };
      const mockResult = { accessToken: 'new-access-token' };

      mockAuthService.refreshToken.mockResolvedValue(mockResult);

      const result = await controller.refreshToken(
        requestWithToken as any,
        mockResponse as any,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Token refreshed successfully');
    });

    it('should return error when refresh token not found', async () => {
      const result = await controller.refreshToken(
        mockRequest as any,
        mockResponse as any,
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Refresh token not found');
    });
  });

  describe('forgotPassword', () => {
    it('should send OTP for password reset', async () => {
      const dto = { phoneNumber: '+963991234567' };
      const mockResult = { success: true, message: 'OTP sent' };

      mockAuthService.forgotPassword.mockResolvedValue(mockResult);

      const result = await controller.forgotPassword(dto as any);

      expect(result).toEqual(mockResult);
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const dto = { resetToken: 'token', newPassword: 'NewPassword123' };
      const mockResult = {
        success: true,
        message: 'Password reset successful',
      };

      mockAuthService.resetPassword.mockResolvedValue(mockResult);

      const result = await controller.resetPassword(dto as any);

      expect(result).toEqual(mockResult);
    });
  });

  describe('verifyForgotPasswordOtp', () => {
    it('should verify forgot password OTP', async () => {
      const dto = { phoneNumber: '+963991234567', otp: '123456' };
      const mockResult = { success: true, resetToken: 'reset-token' };

      mockAuthService.verifyForgotPasswordOtp.mockResolvedValue(mockResult);

      const result = await controller.verifyForgotPasswordOtp(dto as any);

      expect(result).toEqual(mockResult);
      expect(mockAuthService.verifyForgotPasswordOtp).toHaveBeenCalledWith(dto);
    });
  });

  describe('refreshToken error handling', () => {
    it('should return error when refresh token is invalid', async () => {
      const requestWithToken = {
        ...mockRequest,
        cookies: { refresh_token: 'invalid-token' },
      };

      mockAuthService.refreshToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      const result = await controller.refreshToken(
        requestWithToken as any,
        mockResponse as any,
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid refresh token');
    });
  });

  describe('login with fallback IP', () => {
    it('should use socket remoteAddress when ip is undefined', async () => {
      const dto = { phoneNumber: '+963991234567', password: 'Password123' };
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        role: 'customer',
      };
      const requestWithoutIp = {
        ...mockRequest,
        ip: undefined,
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      await controller.login(
        dto as any,
        requestWithoutIp as any,
        mockResponse as any,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        dto,
        '127.0.0.1',
        'test-agent',
      );
    });

    it('should use unknown when both ip and remoteAddress are undefined', async () => {
      const dto = { phoneNumber: '+963991234567', password: 'Password123' };
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        role: 'customer',
      };
      const requestWithoutIp = {
        ...mockRequest,
        ip: undefined,
        socket: { remoteAddress: undefined },
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      await controller.login(
        dto as any,
        requestWithoutIp as any,
        mockResponse as any,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        dto,
        'unknown',
        'test-agent',
      );
    });

    it('should use unknown when user-agent is undefined', async () => {
      const dto = { phoneNumber: '+963991234567', password: 'Password123' };
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        role: 'customer',
      };
      const requestWithoutAgent = {
        ...mockRequest,
        headers: {},
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      await controller.login(
        dto as any,
        requestWithoutAgent as any,
        mockResponse as any,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        dto,
        '127.0.0.1',
        'unknown',
      );
    });
  });
});
