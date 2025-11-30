import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

// Mock nodemailer
const mockTransporter = {
  verify: jest.fn((callback) => callback(null)),
  sendMail: jest.fn(),
};

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransporter),
}));

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  const mockEmailConfig = {
    host: 'smtp.test.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@test.com',
      pass: 'password',
    },
    from: {
      name: 'Daraa',
      address: 'noreply@daraa.com',
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockEmailConfig),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendEmail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Daraa" <noreply@daraa.com>',
        to: 'recipient@test.com',
        subject: 'Test Subject',
        text: undefined,
        html: '<p>Test content</p>',
        attachments: undefined,
      });
    });

    it('should send email to multiple recipients', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendEmail({
        to: ['user1@test.com', 'user2@test.com'],
        subject: 'Test Subject',
        text: 'Plain text content',
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user1@test.com, user2@test.com',
        }),
      );
    });

    it('should return false on error', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await service.sendEmail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });

      expect(result).toBe(false);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendWelcomeEmail('user@test.com', 'أحمد');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'مرحباً بك في منصة Daraa',
        }),
      );
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendVerificationEmail(
        'user@test.com',
        'أحمد',
        'https://daraa.com/verify?token=abc123',
      );

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'تأكيد البريد الإلكتروني - منصة Daraa',
        }),
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendPasswordResetEmail(
        'user@test.com',
        'أحمد',
        'https://daraa.com/reset?token=abc123',
      );

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'إعادة تعيين كلمة المرور - منصة Daraa',
        }),
      );
    });
  });
});
