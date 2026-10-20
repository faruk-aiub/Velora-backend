import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly redis;
    private readonly logger;
    private isConnected;
    private lastLoggedErrorTime;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private readonly memoryCache;
    getOrSet<T>(key: string, ttl: number, fallback: () => Promise<T>): Promise<T>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    del(key: string): Promise<void>;
    delByPattern(pattern: string): Promise<void>;
}
