import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AccountService } from '../../accounts/services/account.service';
import { AccountSecurityService } from '../../accounts/services/account-security.service';
import { RegisterStep1Dto } from '../dto/register-step1.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { CompleteProfileDto } from '../dto/complete-profile.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { TokenService } from './token.service';
import { RegistrationService } from './registration.service';
import { PasswordResetService } from './password-reset.service';

/**
 * Main Auth Service - orchestrates authentication operations
 * Delegates to: RegistrationService, PasswordResetService
 * Handles: Login, Refresh Token
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private accountService: AccountService,
    private accountSecurityService: AccountSecurityService,
    private tokenService: TokenService,
    private registrationService: RegistrationService,
    private passwordResetService: PasswordResetService,
  ) {}

  // ============================================
  // Registration (delegated to RegistrationService)
  // ============================================

  /**
   * Step 1: Register - Create account and send OTP
   */
  async registerStep1(dto: RegisterStep1Dto): Promise<{ message: string }> {
    return this.registrationService.registerStep1(dto);
  }

  /**
   * Step 2: Verify OTP and create customer profile
   */
  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<{ message: string; verified: boolean; next: string }> {
    return this.registrationService.verifyOtp(dto);
  }

  /**
   * Step 3: Set Password and Complete Registration
   */
  async completeProfile(dto: CompleteProfileDto): Promise<{
    accessToken: string;
    refreshToken: string;
    role: string;
    message: string;
  }> {
    return this.registrationService.completeProfile(dto);
  }

  // ============================================
  // Login & Token Management
  // ============================================

  /**
   * Login
   */
  async login(
    dto: LoginDto,
    ip: string,
    device: string,
  ): Promise<{ accessToken: string; refreshToken: string; role: string }> {
    const { phoneNumber, password } = dto;

    // Find account
    const account = await this.accountService.findByPhone(phoneNumber);
    if (!account) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    // Check if account is locked
    const isLocked = await this.accountSecurityService.isAccountLocked(
      account._id as any,
    );
    if (isLocked) {
      throw new UnauthorizedException(
        'Account is temporarily locked due to multiple failed login attempts. Please try again later.',
      );
    }

    // Validate password
    const isPasswordValid = await this.accountSecurityService.validatePassword(
      account,
      password,
    );
    if (!isPasswordValid) {
      // Record failed login attempt
      await this.accountSecurityService.addLoginHistory(
        account._id as any,
        ip,
        device,
        false,
      );
      throw new UnauthorizedException('Invalid phone number or password');
    }

    // Record successful login
    await this.accountSecurityService.addLoginHistory(
      account._id as any,
      ip,
      device,
      true,
    );

    // Generate JWT tokens
    const payload = {
      sub: (account._id as any).toString(),
      phone: account.phone,
      role: account.role,
    };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      role: account.role,
    };
  }

  /**
   * Refresh Token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);

      // Generate new access token
      const newPayload = {
        sub: payload.sub,
        phone: payload.phone,
        role: payload.role,
      };
      const accessToken = this.tokenService.generateAccessToken(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ============================================
  // Password Reset (delegated to PasswordResetService)
  // ============================================

  /**
   * Forgot Password - Step 1: Send OTP
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.passwordResetService.forgotPassword(dto);
  }

  /**
   * Verify Forgot Password OTP
   */
  async verifyForgotPasswordOtp(
    dto: VerifyOtpDto,
  ): Promise<{ message: string; verified: boolean }> {
    return this.passwordResetService.verifyForgotPasswordOtp(dto);
  }

  /**
   * Reset Password
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.passwordResetService.resetPassword(dto);
  }
}
