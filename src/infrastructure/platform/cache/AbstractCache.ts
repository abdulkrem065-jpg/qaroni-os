import { ICache, ICacheOptions, ITenantContext, ICacheHealth } from '../../../domain/platform/ports/ICache';

export abstract class AbstractCache implements ICache {
    public abstract get<T>(context: ITenantContext, key: string): Promise<T | null>;
    public abstract set<T>(context: ITenantContext, key: string, value: T, options?: ICacheOptions): Promise<void>;
    public abstract delete(context: ITenantContext, key: string): Promise<void>;
    public abstract invalidateByTag(context: ITenantContext, tag: string): Promise<void>;
    public abstract invalidateRegion(context: ITenantContext, region: string): Promise<void>;
    public abstract checkHealth(): Promise<ICacheHealth>;
}
