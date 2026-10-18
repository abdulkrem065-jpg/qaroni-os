import { IDistributedLock } from '../../../domain/platform/ports/ISchedulerEngine';
import { RedisConnectionManager } from '../cache/redis/RedisConnectionManager';

export class RedisDistributedLock implements IDistributedLock {
    constructor(private readonly redisConnectionManager: RedisConnectionManager) {}

    public async acquire(key: string, ttlSeconds: number): Promise<boolean> {
        const client = this.redisConnectionManager.getClient();
        // NX = Only set if it doesn't exist
        // EX = Expire in seconds
        const result = await client.set(key, 'locked', 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }

    public async release(key: string): Promise<void> {
        const client = this.redisConnectionManager.getClient();
        await client.del(key);
    }
}
