import { IFailureHandler, IQueueMessage, IDeadLetterQueue, IRetryPolicy, IRetryBackoff } from '../../../domain/platform/ports/IQueueEngine';

export class FailureHandler implements IFailureHandler {
    constructor(
        private readonly dlq: IDeadLetterQueue,
        private readonly retryPolicy: IRetryPolicy,
        private readonly retryBackoff: IRetryBackoff
    ) {}

    public async handleFailure(message: IQueueMessage, error: Error): Promise<void> {
        const maxRetries = 3; // Typically driven from config/options
        if (this.retryPolicy.shouldRetry(message.attempts, maxRetries, error)) {
            // Re-enqueue logic would go here or be natively handled by BullMQ
            // For now, if we reach max, send to DLQ
        } else {
            await this.dlq.sendToDeadLetter(message, error.message);
        }
    }
}
