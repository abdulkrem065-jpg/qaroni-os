import { IRetryPolicy, IRetryBackoff } from '../../../domain/platform/ports/IQueueEngine';

export class DefaultRetryPolicy implements IRetryPolicy {
    public shouldRetry(attempts: number, maxRetries: number, error: Error): boolean {
        // Do not retry on unrecoverable errors, e.g., validation errors
        if (error.name === 'ValidationError') return false;
        return attempts < maxRetries;
    }
}

export class ExponentialRetryBackoff implements IRetryBackoff {
    public calculateBackoffMs(attempts: number, baseBackoffMs: number): number {
        return Math.pow(2, attempts) * baseBackoffMs;
    }
}
