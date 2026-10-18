import { ISchedulerManager, ISchedulerRegistry, IScheduledJob } from '../../../domain/platform/ports/ISchedulerEngine';
import { SchedulerEngine } from './SchedulerEngine';

export class SchedulerManager implements ISchedulerManager {
    constructor(
        private readonly registry: ISchedulerRegistry,
        private readonly engine: SchedulerEngine
    ) {}

    public async pause(jobId: string): Promise<void> {
        const jobs = await this.registry.getRegisteredJobs();
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            job.status = 'PAUSED';
            // In a real implementation, you'd need a way to tell the engine to cancel the current timer
            // For this architecture, we restart the engine to sync states
            await this.engine.stop();
            await this.engine.start();
        }
    }

    public async resume(jobId: string): Promise<void> {
        const jobs = await this.registry.getRegisteredJobs();
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            job.status = 'ACTIVE';
            await this.engine.stop();
            await this.engine.start();
        }
    }

    public async getJobStatus(jobId: string): Promise<IScheduledJob | null> {
        const jobs = await this.registry.getRegisteredJobs();
        return jobs.find(j => j.id === jobId) || null;
    }

    public async getJobs(): Promise<IScheduledJob[]> {
        return this.registry.getRegisteredJobs();
    }
}
