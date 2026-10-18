import { IIdempotencyManager, IDuplicateMessageDetector, IReplayProtection, IQueueMessageContext, IQueueMessage } from '../../../domain/platform/ports/IQueueEngine';
import { CacheService } from '../cache/CacheService';

export class IdempotencyManager implements IIdempotencyManager, IDuplicateMessageDetector, IReplayProtection {
    constructor(private readonly cacheService: CacheService) {}

    public async checkAndSet(key: string, ttlSeconds: number): Promise<boolean> {
        // Implementation typically relies on Redis SET NX
        // Relying on CacheService's underlying Redis
        const existing = await this.cacheService.get<string>({ organizationId: 'system' }, `idempotency:${key}`);
        if (existing) return false;
        
        await this.cacheService.set({ organizationId: 'system' }, `idempotency:${key}`, '1', { ttlSeconds });
        return true;
    }

    public async clear(key: string): Promise<void> {
        await this.cacheService.delete({ organizationId: 'system' }, `idempotency:${key}`);
    }

    public async isDuplicate(messageId: string): Promise<boolean> {
        return !(await this.checkAndSet(`msg:${messageId}`, 86400));
    }

    public async protect(message: IQueueMessage): Promise<void> {
        if (await this.isDuplicate(message.id)) {
            throw new Error(`Duplicate message detected: ${message.id}`);
        }
    }
}
