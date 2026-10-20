import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private lastLoggedErrorTime = 0;

  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  onModuleInit() {
    this.mailQueue.on('error', (err) => {
      const now = Date.now();
      if (now - this.lastLoggedErrorTime > 10000) {
        this.lastLoggedErrorTime = now;
        this.logger.warn(`BullMQ mail queue connection unavailable: ${err.message || 'ECONNREFUSED'}`);
      }
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    try {
      await this.mailQueue.add('send-password-reset', { to, token });
      this.logger.log(`Password reset email job added to queue for ${to}`);
    } catch (err: any) {
      this.logger.error(`Failed to queue password reset email for ${to}: ${err.message}`);
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    try {
      await this.mailQueue.add('send-verification', { to, token });
      this.logger.log(`Verification email job added to queue for ${to}`);
    } catch (err: any) {
      this.logger.error(`Failed to queue verification email for ${to}: ${err.message}`);
    }
  }
}
