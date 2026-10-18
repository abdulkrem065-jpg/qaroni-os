import { RedisConnectionManager } from './RedisConnectionManager';

export class RedisHealthChecker {
    constructor(private readonly connectionManager: RedisConnectionManager) {}

    public async isHealthy(): Promise<boolean> {
        try {
            const client = this.connectionManager.getClient();
            const result = await client.ping();
            return result === 'PONG';
        } catch (error) {
            return false;
        }
    }
}
