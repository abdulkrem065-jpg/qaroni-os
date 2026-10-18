import { ICache, ICacheOptions, ITenantContext } from '../../../domain/platform/ports/ICache';
import { CacheKeyBuilder } from './CacheKeyBuilder';
import { IConfiguration } from '../../../domain/platform/ports/IConfig';

export class CacheService {
    constructor(
        private readonly cache: ICache,
        private readonly config: IConfiguration
    ) {}

    public async get<T>(context: ITenantContext, key: string): Promise<T | null> {
        return this.cache.get<T>(context, key);
    }

    public async set<T>(context: ITenantContext, key: string, value: T, options?: ICacheOptions): Promise<void> {
        return this.cache.set(context, key, value, options);
    }

    public async delete(context: ITenantContext, key: string): Promise<void> {
        return this.cache.delete(context, key);
    }

    public async invalidateByTag(context: ITenantContext, tag: string): Promise<void> {
        return this.cache.invalidateByTag(context, tag);
    }

    public async invalidateRegion(context: ITenantContext, region: string): Promise<void> {
        return this.cache.invalidateRegion(context, region);
    }
}
