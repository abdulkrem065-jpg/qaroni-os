import { ISchedulerEngine, IScheduledJob, IDistributedLock, ISchedulerExecutor, ISchedulerRegistry } from '../../../domain/platform/ports/ISchedulerEngine';
import { CronExpressionParser } from 'cron-parser';

export class SchedulerEngine implements ISchedulerEngine {
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private running: boolean = false;

    constructor(
        private readonly registry: ISchedulerRegistry,
        private readonly executor: ISchedulerExecutor,
        private readonly lock: IDistributedLock
    ) {}

    public async start(): Promise<void> {
        if (this.running) return;
        this.running = true;

        const jobs = await this.registry.getRegisteredJobs();
        for (const job of jobs) {
            if (job.status === 'ACTIVE') {
                this.scheduleJob(job);
            }
        }
    }

    public async stop(): Promise<void> {
        this.running = false;
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
            clearInterval(timer);
        }
        this.timers.clear();
    }

    private scheduleJob(job: IScheduledJob): void {
        if (!this.running || job.status !== 'ACTIVE') return;

        if (job.schedule.cron) {
            this.scheduleCron(job);
        } else if (job.schedule.intervalMs) {
            this.scheduleInterval(job);
        } else if (job.schedule.delayMs) {
            this.scheduleDelayed(job);
        }
    }

    private scheduleCron(job: IScheduledJob): void {
        try {
            const interval = CronExpressionParser.parse(job.schedule.cron!, { tz: job.schedule.timezone });
            const nextDate = interval.next().toDate();
            const delay = Math.max(0, nextDate.getTime() - Date.now());

            const timer = setTimeout(async () => {
                await this.executeJobWithLock(job);
                this.scheduleCron(job); // Reschedule for next run
            }, delay);
            this.timers.set(job.id, timer);
        } catch (err) {
            console.error(`Failed to parse cron for job ${job.id}:`, err);
        }
    }

    private scheduleInterval(job: IScheduledJob): void {
        const timer = setInterval(async () => {
            await this.executeJobWithLock(job);
        }, job.schedule.intervalMs!);
        this.timers.set(job.id, timer);
    }

    private scheduleDelayed(job: IScheduledJob): void {
        const timer = setTimeout(async () => {
            await this.executeJobWithLock(job);
            // One-time execution, no reschedule
            this.timers.delete(job.id);
        }, job.schedule.delayMs!);
        this.timers.set(job.id, timer);
    }

    private async executeJobWithLock(job: IScheduledJob): Promise<void> {
        const lockKey = `scheduler:lock:${job.id}:${Date.now()}`;
        // Try to acquire lock for 30 seconds
        const acquired = await this.lock.acquire(lockKey, 30);
        if (!acquired) {
            // Another instance is handling this specific execution
            return;
        }

        try {
            await this.executor.execute(job);
            job.lastExecution = new Date();
        } catch (error) {
            console.error(`Failed to execute scheduled job ${job.id}`, error);
        }
    }
}
