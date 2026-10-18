import { IDeadLetterQueue, IQueueMessage } from '../../../domain/platform/ports/IQueueEngine';

export class DeadLetterQueue {
    constructor(private readonly dlqPort: IDeadLetterQueue) {}

    public async sendToDeadLetter(message: IQueueMessage, reason: string): Promise<void> {
        return this.dlqPort.sendToDeadLetter(message, reason);
    }

    public async retryDeadLetter(messageId: string): Promise<void> {
        return this.dlqPort.retryDeadLetter(messageId);
    }
}
