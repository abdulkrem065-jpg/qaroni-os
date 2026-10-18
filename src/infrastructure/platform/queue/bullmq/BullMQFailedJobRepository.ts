import { IFailedJobRepository, IQueueMessage } from '../../../../domain/platform/ports/IQueueEngine';
import { RedisConnectionManager } from '../../cache/redis/RedisConnectionManager';

export class BullMQFailedJobRepository implements IFailedJobRepository {
    constructor(private readonly redisConnectionManager: RedisConnectionManager) {}

    public async saveFailedJob(message: IQueueMessage, reason: string): Promise<void> {
        const client = this.redisConnectionManager.getClient();
        await client.hset('failed_jobs', message.id, JSON.stringify({ message, reason }));
    }

    public async getFailedJob(messageId: string): Promise<IQueueMessage | null> {
        const client = this.redisConnectionManager.getClient();
        const data = await client.hget('failed_jobs', messageId);
        if (!data) return null;
        return JSON.parse(data).message;
    }

    public async removeFailedJob(messageId: string): Promise<void> {
        const client = this.redisConnectionManager.getClient();
        await client.hdel('failed_jobs', messageId);
    }
}
