import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { 
    IQueueDispatcher, 
    IQueueWorker, 
    IQueueManager, 
    IQueueSupervisor, 
    IQueueHealthMonitor, 
    IQueueMessage, 
    IQueueMessageContext, 
    IQueueMessageOptions 
} from '../../../../domain/platform/ports/IQueueEngine';
import { RedisConnectionManager } from '../../cache/redis/RedisConnectionManager';

export class BullMQQueueProvider implements IQueueDispatcher, IQueueWorker, IQueueManager, IQueueSupervisor, IQueueHealthMonitor {
    private queues: Map<string, Queue> = new Map();
    private workers: Map<string, Worker> = new Map();
    private queueEvents: Map<string, QueueEvents> = new Map();

    constructor(private readonly redisConnectionManager: RedisConnectionManager) {}

    private getQueue(queueName: string): Queue {
        if (!this.queues.has(queueName)) {
            const client = this.redisConnectionManager.getClient();
            this.queues.set(queueName, new Queue(queueName, { connection: client }));
        }
        return this.queues.get(queueName)!;
    }

    public async dispatch(queueName: string, payload: any, context: IQueueMessageContext, options?: IQueueMessageOptions): Promise<string> {
        const queue = this.getQueue(queueName);
        const jobOptions = {
            delay: options?.delayMs,
            attempts: options?.maxRetries,
            backoff: options?.retryBackoffMs ? { type: 'fixed', delay: options.retryBackoffMs } : undefined,
            priority: options?.priority,
        };
        const job = await queue.add(queueName, { payload, context }, jobOptions);
        return job.id!;
    }

    public start(queueName: string, handler: (message: IQueueMessage) => Promise<void>): void {
        if (this.workers.has(queueName)) {
            throw new Error(`Worker already started for queue: ${queueName}`);
        }
        const client = this.redisConnectionManager.getClient();
        
        const worker = new Worker(queueName, async (job: Job) => {
            const message: IQueueMessage = {
                id: job.id!,
                queueName: queueName,
                payload: job.data.payload,
                context: job.data.context,
                status: 'PROCESSING',
                attempts: job.attemptsMade
            };
            await handler(message);
        }, { connection: client });

        this.workers.set(queueName, worker);
    }

    public async stop(): Promise<void> {
        for (const worker of this.workers.values()) {
            await worker.close();
        }
        this.workers.clear();
    }

    public async pause(queueName: string): Promise<void> {
        const queue = this.getQueue(queueName);
        await queue.pause();
    }

    public async resume(queueName: string): Promise<void> {
        const queue = this.getQueue(queueName);
        await queue.resume();
    }

    public async clear(queueName: string): Promise<void> {
        const queue = this.getQueue(queueName);
        await queue.obliterate({ force: true });
    }

    public async monitor(queueName: string): Promise<void> {
        if (!this.queueEvents.has(queueName)) {
            const client = this.redisConnectionManager.getClient();
            const events = new QueueEvents(queueName, { connection: client });
            
            events.on('completed', ({ jobId, returnvalue }) => {
                console.log(`[QueueSupervisor] Job ${jobId} completed.`);
            });
            
            events.on('failed', ({ jobId, failedReason }) => {
                console.log(`[QueueSupervisor] Job ${jobId} failed. Reason: ${failedReason}`);
            });
            
            this.queueEvents.set(queueName, events);
        }
    }

    public async checkHealth(queueName: string): Promise<{
        queueLength: number;
        activeWorkers: number;
        failedJobs: number;
        retryCount: number;
        averageProcessingTimeMs: number;
        dlqSize: number;
    }> {
        const queue = this.getQueue(queueName);
        const jobCounts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
        
        return {
            queueLength: jobCounts.waiting,
            activeWorkers: jobCounts.active, // Approximation based on active jobs
            failedJobs: jobCounts.failed,
            retryCount: 0, // BullMQ doesn't provide aggregated retry count easily out of the box
            averageProcessingTimeMs: 0, // Requires additional metrics tracking
            dlqSize: jobCounts.failed // DLQ is usually the failed set in standard BullMQ
        };
    }
}
