import { IQueueManager } from '../../../domain/platform/ports/IQueueEngine';

export class QueueManager {
    constructor(private readonly managerPort: IQueueManager) {}

    public async pause(queueName: string): Promise<void> {
        return this.managerPort.pause(queueName);
    }

    public async resume(queueName: string): Promise<void> {
        return this.managerPort.resume(queueName);
    }

    public async clear(queueName: string): Promise<void> {
        return this.managerPort.clear(queueName);
    }
}
