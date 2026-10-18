import { ITenantContext } from './ICache';

export interface IScheduleOptions {
    cron?: string;
    intervalMs?: number;
    delayMs?: number;
    timezone?: string;
}

export interface IScheduledJob {
    id: string;
    name: string;
    queueName: string;
    payload: any;
    context: ITenantContext | { isGlobal: true };
    schedule: IScheduleOptions;
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
    lastExecution?: Date;
}

export interface ISchedulerEngine {
    start(): Promise<void>;
    stop(): Promise<void>;
}

export interface ISchedulerManager {
    pause(jobId: string): Promise<void>;
    resume(jobId: string): Promise<void>;
    getJobStatus(jobId: string): Promise<IScheduledJob | null>;
    getJobs(): Promise<IScheduledJob[]>;
}

export interface ISchedulerRegistry {
    register(job: IScheduledJob): Promise<void>;
    getRegisteredJobs(): Promise<IScheduledJob[]>;
}

export interface ISchedulerExecutor {
    execute(job: IScheduledJob): Promise<void>;
}

export interface IDistributedLock {
    acquire(key: string, ttlSeconds: number): Promise<boolean>;
    release(key: string): Promise<void>;
}

export interface ISchedulerHealthMonitor {
    checkHealth(): Promise<{
        status: 'UP' | 'DOWN';
        activeJobs: number;
        waitingJobs: number;
        failedExecutions: number;
        lastExecution?: Date;
    }>;
}
