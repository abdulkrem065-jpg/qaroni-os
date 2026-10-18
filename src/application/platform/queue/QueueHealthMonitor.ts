import { IQueueHealthMonitor } from '../../../domain/platform/ports/IQueueEngine';

export class QueueHealthMonitor {
    constructor(private readonly monitorPort: IQueueHealthMonitor) {}

    public async checkHealth(queueName: string) {
        return this.monitorPort.checkHealth(queueName);
    }
}
