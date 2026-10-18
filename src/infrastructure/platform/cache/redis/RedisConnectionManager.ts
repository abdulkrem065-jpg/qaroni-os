import { Redis } from 'ioredis';
import { IConfiguration } from '../../../../domain/platform/ports/IConfig';

export class RedisConnectionManager {
    private client: Redis | null = null;

    constructor(private readonly config: IConfiguration) {}

    public async connect(): Promise<Redis> {
        if (!this.client) {
            const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
            this.client = new Redis(redisUrl, {
                lazyConnect: true,
                maxRetriesPerRequest: 3,
            });
            await this.client.connect();
        }
        return this.client;
    }

    public getClient(): Redis {
        if (!this.client) {
            throw new Error('Redis client is not connected');
        }
        return this.client;
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.client = null;
        }
    }
}
