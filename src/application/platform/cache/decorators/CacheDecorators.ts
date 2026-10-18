import { ITenantContext, ICacheOptions } from '../../../../domain/platform/ports/ICache';
import { CacheService } from '../CacheService';

// Note: In a real implementation, you would use a DI container to inject CacheService into the decorator,
// or pass it in some global registry. For architectural purposes, we define the decorator interface.

let globalCacheService: CacheService | null = null;

export function setGlobalCacheService(service: CacheService) {
    globalCacheService = service;
}

export function Cacheable(keyPrefix: string, options?: ICacheOptions) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            if (!globalCacheService) return originalMethod.apply(this, args);

            // Assume the first argument is or contains the ITenantContext
            const context = args.find(arg => arg && arg.organizationId) as ITenantContext;
            if (!context) return originalMethod.apply(this, args);

            const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;
            const cachedResult = await globalCacheService.get(context, cacheKey);
            if (cachedResult !== null && cachedResult !== undefined) {
                return cachedResult;
            }

            const result = await originalMethod.apply(this, args);
            await globalCacheService.set(context, cacheKey, result, options);
            return result;
        };
        return descriptor;
    };
}

export function CacheEvict(keyPrefix: string, evictTags?: string[], region?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const result = await originalMethod.apply(this, args);
            if (!globalCacheService) return result;

            const context = args.find(arg => arg && arg.organizationId) as ITenantContext;
            if (context) {
                if (evictTags) {
                    for (const tag of evictTags) {
                        await globalCacheService.invalidateByTag(context, tag);
                    }
                }
                if (region) {
                    await globalCacheService.invalidateRegion(context, region);
                }
            }
            return result;
        };
        return descriptor;
    };
}

export function CachePut(keyPrefix: string, options?: ICacheOptions) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const result = await originalMethod.apply(this, args);
            if (!globalCacheService) return result;

            const context = args.find(arg => arg && arg.organizationId) as ITenantContext;
            if (context) {
                const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;
                await globalCacheService.set(context, cacheKey, result, options);
            }
            return result;
        };
        return descriptor;
    };
}
