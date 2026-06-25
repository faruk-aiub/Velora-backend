import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    private readonly logger;
    constructor(configService: ConfigService);
    sendPasswordResetEmail(to: string, token: string): Promise<void>;
    sendVerificationEmail(to: string, token: string): Promise<void>;
}
