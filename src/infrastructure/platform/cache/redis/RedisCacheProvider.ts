import { AbstractCache } from '../AbstractCache';
import { ICacheOptions, ITenantContext, ICacheHealth } from '../../../../domain/platform/ports/ICache';
import { CacheKeyBuilder } from '../../../../application/platform/cache/CacheKeyBuilder';
import { RedisConnectionManager } from './RedisConnectionManager';

export class RedisCacheProvider extends AbstractCache {
    constructor(private readonly connectionManager: RedisConnectionManager) {
        super();
    }

    public async get<T>(context: ITenantContext, key: string): Promise<T | null> {
        const client = this.connectionManager.getClient();
        const fullKey = CacheKeyBuilder.build(context, 'default', key);
        
        const data = await client.get(fullKey);
        if (!data) return null;

        try {
            return JSON.parse(data) as T;
        } catch {
            return data as unknown as T;
        }
    }

    public async set<T>(context: ITenantContext, key: string, value: T, options?: ICacheOptions): Promise<void> {
        const client = this.connectionManager.getClient();
        const region = options?.region || 'default';
        const fullKey = CacheKeyBuilder.build(context, region, key);
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

        const pipeline = client.pipeline();

        if (options?.absoluteExpirationDate) {
            const ttl = Math.floor((options.absoluteExpirationDate.getTime() - Date.now()) / 1000);
            if (ttl > 0) {
                pipeline.setex(fullKey, ttl, stringValue);
            } else {
                return; // already expired
            }
        } else if (options?.ttlSeconds) {
            pipeline.setex(fullKey, options.ttlSeconds, stringValue);
        } else {
            pipeline.set(fullKey, stringValue);
        }

        // Add to tags if any
        if (options?.tags && options.tags.length > 0) {
            for (const tag of options.tags) {
                const tagKey = CacheKeyBuilder.buildTagKey(context, tag);
                pipeline.sadd(tagKey, fullKey);
                if (options.ttlSeconds) {
                    pipeline.expire(tagKey, options.ttlSeconds); // optional: keep tag key alive as long as item
                }
            }
        }

        await pipeline.exec();
    }

    public async delete(context: ITenantContext, key: string): Promise<void> {
        const client = this.connectionManager.getClient();
        const fullKey = CacheKeyBuilder.build(context, 'default', key);
        await client.del(fullKey);
    }

    public async invalidateByTag(context: ITenantContext, tag: string): Promise<void> {
        const client = this.connectionManager.getClient();
        const tagKey = CacheKeyBuilder.buildTagKey(context, tag);
        
        const keys = await client.smembers(tagKey);
        if (keys.length > 0) {
            const pipeline = client.pipeline();
            pipeline.del(...keys);
            pipeline.del(tagKey);
            await pipeline.exec();
        }
    }

    public async invalidateRegion(context: ITenantContext, region: string): Promise<void> {
        const client = this.connectionManager.getClient();
        const prefix = CacheKeyBuilder.buildRegionPrefix(context, region);
        
        // Use SCAN to find keys with this prefix and delete them
        let cursor = '0';
        do {
            const result = await client.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
            cursor = result[0];
            const keys = result[1];
            if (keys.length > 0) {
                await client.del(...keys);
            }
        } while (cursor !== '0');
    }

    public async checkHealth(): Promise<ICacheHealth> {
        const client = this.connectionManager.getClient();
        const startTime = Date.now();
        try {
            await client.ping();
            const latencyMs = Date.now() - startTime;
            
            // Retrieve some basic stats
            const info = await client.info('stats');
            const keyspace = await client.info('keyspace');
            
            let hits = 0;
            let misses = 0;
            let totalKeys = 0;

            const hitMatch = info.match(/keyspace_hits:(\d+)/);
            const missMatch = info.match(/keyspace_misses:(\d+)/);
            
            if (hitMatch) hits = parseInt(hitMatch[1], 10);
            if (missMatch) misses = parseInt(missMatch[1], 10);
            
            const totalAttempts = hits + misses;
            const hitRatio = totalAttempts > 0 ? hits / totalAttempts : 0;
            const missRatio = totalAttempts > 0 ? misses / totalAttempts : 0;

            // Extract total keys from db0 for simplicity
            const db0Match = keyspace.match(/db0:keys=(\d+),/);
            if (db0Match) totalKeys = parseInt(db0Match[1], 10);

            return {
                status: 'up',
                latencyMs,
                hitRatio,
                missRatio,
                totalKeys
            };
        } catch (error) {
            return {
                status: 'down',
                latencyMs: Date.now() - startTime,
                hitRatio: 0,
                missRatio: 0,
                totalKeys: 0
            };
        }
    }
}
