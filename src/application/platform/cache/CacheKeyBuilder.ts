import { ITenantContext } from '../../../domain/platform/ports/ICache';

export class CacheKeyBuilder {
    public static build(context: ITenantContext, region: string, key: string): string {
        const branchPart = context.branchId ? `:${context.branchId}` : '';
        return `org:${context.organizationId}${branchPart}:region:${region}:key:${key}`;
    }

    public static buildTagKey(context: ITenantContext, tag: string): string {
        const branchPart = context.branchId ? `:${context.branchId}` : '';
        return `org:${context.organizationId}${branchPart}:tag:${tag}`;
    }

    public static buildRegionPrefix(context: ITenantContext, region: string): string {
        const branchPart = context.branchId ? `:${context.branchId}` : '';
        return `org:${context.organizationId}${branchPart}:region:${region}:`;
    }
}
