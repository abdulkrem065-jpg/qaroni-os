import { ITenantContext } from './ICache';

export interface IQueueMessageOptions {
    delayMs?: number;
    maxRetries?: number;
    retryBackoffMs?: number;
    priority?: number;
}

export interface IQueueMessageContext extends ITenantContext {
    correlationId: string;
}

export interface IQueueMessage {
    id: string;
    queueName: string;
    payload: any;
    context: IQueueMessageContext;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    attempts: number;
    error?: string;
}

export interface IQueueDispatcher {
    dispatch(queueName: string, payload: any, context: IQueueMessageContext, options?: IQueueMessageOptions): Promise<string>;
}

export interface IQueueWorker {
    start(queueName: string, handler: (message: IQueueMessage) => Promise<void>): void;
    stop(): Promise<void>;
}

export interface IQueueManager {
    pause(queueName: string): Promise<void>;
    resume(queueName: string): Promise<void>;
    clear(queueName: string): Promise<void>;
}

export interface IQueueSupervisor {
    monitor(queueName: string): Promise<void>;
}

export interface IQueueHealthMonitor {
    checkHealth(queueName: string): Promise<{
        queueLength: number;
        activeWorkers: number;
        failedJobs: number;
        retryCount: number;
        averageProcessingTimeMs: number;
        dlqSize: number;
    }>;
}

export interface IDeadLetterQueue {
    sendToDeadLetter(message: IQueueMessage, reason: string): Promise<void>;
    retryDeadLetter(messageId: string): Promise<void>;
}

export interface IFailedJobRepository {
    saveFailedJob(message: IQueueMessage, reason: string): Promise<void>;
    getFailedJob(messageId: string): Promise<IQueueMessage | null>;
    removeFailedJob(messageId: string): Promise<void>;
}

export interface IRetryPolicy {
    shouldRetry(attempts: number, maxRetries: number, error: Error): boolean;
}

export interface IRetryBackoff {
    calculateBackoffMs(attempts: number, baseBackoffMs: number): number;
}

export interface IFailureHandler {
    handleFailure(message: IQueueMessage, error: Error): Promise<void>;
}

export interface IIdempotencyManager {
    checkAndSet(key: string, ttlSeconds: number): Promise<boolean>;
    clear(key: string): Promise<void>;
}

export interface IDuplicateMessageDetector {
    isDuplicate(messageId: string): Promise<boolean>;
}

export interface IReplayProtection {
    protect(message: IQueueMessage): Promise<void>;
}
