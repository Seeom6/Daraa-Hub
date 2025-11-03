import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterStep1Dto } from './dto/register-step1.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registration Step 1: Send OTP
   * POST /auth/register/step1
   */
  @Post('register/step1')
  @HttpCode(HttpStatus.OK)
  async registerStep1(@Body() dto: RegisterStep1Dto) {
    return this.authService.registerStep1(dto);
  }

  /**
   * Registration Step 2: Verify OTP
   * POST /auth/register/verify-otp
   */
  @Post('register/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  /**
   * Registration Step 3: Complete Profile
   * POST /auth/register/complete-profile
   */
  @Post('register/complete-profile')
  @HttpCode(HttpStatus.CREATED)
  async completeProfile(
    @Body() dto: CompleteProfileDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.completeProfile(dto);

    // Set JWT tokens in HTTP-only cookies
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      message: result.message,
      role: result.role,
      dashboard: '/account/dashboard',
    };
  }

  /**
   * Login
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Get IP and device info
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const device = request.headers['user-agent'] || 'unknown';

    const result = await this.authService.login(dto, ip, device);

    // Set JWT tokens in HTTP-only cookies
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      message: 'Login successful',
      role: result.role,
    };
  }

  /**
   * Logout
   * POST /auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) response: Response) {
    // Clear the access token cookie
    response.clearCookie('access_token');

    return {
      message: 'Logout successful',
    };
  }

  /**
   * Get current user
   * GET /auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() request: Request) {
    // The user is attached to the request by the JWT strategy
    return {
      user: request.user,
    };
  }

  /**
   * Forgot Password Step 1: Send OTP
   * POST /auth/forgot-password
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  /**
   * Forgot Password Step 2: Verify OTP
   * POST /auth/forgot-password/verify-otp
   */
  @Post('forgot-password/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyForgotPasswordOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyForgotPasswordOtp(dto);
  }

  /**
   * Forgot Password Step 3: Reset Password
   * POST /auth/reset-password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}

