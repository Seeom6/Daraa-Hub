import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const emailConfig = this.configService.get('email');

    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      },
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Email service connection error:', error);
      } else {
        this.logger.log('Email service is ready');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const emailConfig = this.configService.get('email');

      const mailOptions = {
        from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>مرحباً ${name}!</h2>
        <p>نرحب بك في منصة Daraa للتجارة الإلكترونية.</p>
        <p>نحن سعداء بانضمامك إلينا!</p>
        <br>
        <p>مع أطيب التحيات،</p>
        <p>فريق Daraa</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'مرحباً بك في منصة Daraa',
      html,
    });
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    verificationUrl: string,
  ): Promise<boolean> {
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>تأكيد البريد الإلكتروني</h2>
        <p>مرحباً ${name}،</p>
        <p>يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          تأكيد البريد الإلكتروني
        </a>
        <p>إذا لم تقم بإنشاء حساب، يرجى تجاهل هذه الرسالة.</p>
        <br>
        <p>مع أطيب التحيات،</p>
        <p>فريق Daraa</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'تأكيد البريد الإلكتروني - منصة Daraa',
      html,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string,
  ): Promise<boolean> {
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>مرحباً ${name}،</p>
        <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
        <p>يرجى النقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          إعادة تعيين كلمة المرور
        </a>
        <p>هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
        <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.</p>
        <br>
        <p>مع أطيب التحيات،</p>
        <p>فريق Daraa</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'إعادة تعيين كلمة المرور - منصة Daraa',
      html,
    });
  }
}
