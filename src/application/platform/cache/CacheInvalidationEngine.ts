import { CacheService } from './CacheService';
import { ITenantContext } from '../../../domain/platform/ports/ICache';

export class CacheInvalidationEngine {
    constructor(private readonly cacheService: CacheService) {}

    public async processInvalidationEvents(events: Array<{ type: 'TAG' | 'REGION' | 'KEY', value: string, context: ITenantContext }>): Promise<void> {
        for (const event of events) {
            if (event.type === 'TAG') {
                await this.cacheService.invalidateByTag(event.context, event.value);
            } else if (event.type === 'REGION') {
                await this.cacheService.invalidateRegion(event.context, event.value);
            } else if (event.type === 'KEY') {
                await this.cacheService.delete(event.context, event.value);
            }
        }
    }
}
