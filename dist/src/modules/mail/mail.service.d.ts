import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
export declare class MailService implements OnModuleInit {
    private mailQueue;
    private readonly logger;
    private lastLoggedErrorTime;
    constructor(mailQueue: Queue);
    onModuleInit(): void;
    sendPasswordResetEmail(to: string, token: string): Promise<void>;
    sendVerificationEmail(to: string, token: string): Promise<void>;
}
