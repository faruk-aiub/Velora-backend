import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private configService: ConfigService) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<number>('SMTP_PORT') === 465,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private lastLoggedErrorTime = 0;

  @OnWorkerEvent('error')
  onError(err: Error) {
    const now = Date.now();
    if (now - this.lastLoggedErrorTime > 10000) {
      this.lastLoggedErrorTime = now;
      this.logger.warn(`BullMQ mail worker connection unavailable: ${err.message || 'ECONNREFUSED'}`);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`BullMQ mail job ${job?.id} failed: ${err.message}`);
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'send-password-reset':
        return this.handlePasswordReset(job.data);
      case 'send-verification':
        return this.handleVerification(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handlePasswordReset(data: { to: string; token: string }) {
    const { to, token } = data;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Velora Support" <${this.configService.get<string>('SMTP_FROM')}>`,
      to,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You recently requested to reset your password for your Velora account. Click the button below to reset it. This link is valid for 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">If you're having trouble clicking the password reset button, copy and paste the URL below into your web browser:</p>
          <p style="font-size: 12px; color: #007bff; word-break: break-all;">${resetLink}</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  private async handleVerification(data: { to: string; token: string }) {
    const { to, token } = data;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Velora Support" <${this.configService.get<string>('SMTP_FROM')}>`,
      to,
      subject: 'Verify your Velora Account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">Welcome to Velora!</h2>
          <p>Hello,</p>
          <p>Please verify your email address to activate your account. Click the button below to verify. This link is valid for 24 hours.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
          </div>
          <p>If you did not sign up for a Velora account, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">If you're having trouble clicking the verify button, copy and paste the URL below into your web browser:</p>
          <p style="font-size: 12px; color: #007bff; word-break: break-all;">${verifyLink}</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
      throw error;
    }
  }
}
