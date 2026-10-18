import { CacheService } from './CacheService';
import { ITenantContext } from '../../../domain/platform/ports/ICache';

export class CacheRegionManager {
    constructor(private readonly cacheService: CacheService) {}

    public async evictRegion(context: ITenantContext, region: string): Promise<void> {
        await this.cacheService.invalidateRegion(context, region);
    }
}
