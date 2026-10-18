import { IQueueSupervisor } from '../../../domain/platform/ports/IQueueEngine';

export class QueueSupervisor {
    constructor(private readonly supervisorPort: IQueueSupervisor) {}

    public async monitor(queueName: string): Promise<void> {
        return this.supervisorPort.monitor(queueName);
    }
}
