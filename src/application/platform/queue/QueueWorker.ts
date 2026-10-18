import { IQueueWorker, IQueueMessage } from '../../../domain/platform/ports/IQueueEngine';

export class QueueWorker {
    constructor(private readonly workerPort: IQueueWorker) {}

    public start(queueName: string, handler: (message: IQueueMessage) => Promise<void>): void {
        this.workerPort.start(queueName, handler);
    }

    public async stop(): Promise<void> {
        return this.workerPort.stop();
    }
}
