export interface ICacheOptions {
    ttlSeconds?: number;
    slidingExpirationSeconds?: number;
    absoluteExpirationDate?: Date;
    tags?: string[];
    region?: string;
}

export interface ITenantContext {
    organizationId: string;
    branchId?: string;
}

export interface ICache {
    get<T>(context: ITenantContext, key: string): Promise<T | null>;
    set<T>(context: ITenantContext, key: string, value: T, options?: ICacheOptions): Promise<void>;
    delete(context: ITenantContext, key: string): Promise<void>;
    invalidateByTag(context: ITenantContext, tag: string): Promise<void>;
    invalidateRegion(context: ITenantContext, region: string): Promise<void>;
}

export interface ICacheHealth {
    status: 'up' | 'down';
    latencyMs: number;
    hitRatio: number;
    missRatio: number;
    totalKeys: number;
}
