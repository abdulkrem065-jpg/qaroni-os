import { ISchedulerHealthMonitor, ISchedulerRegistry } from '../../../domain/platform/ports/ISchedulerEngine';

export class SchedulerHealthMonitor implements ISchedulerHealthMonitor {
    constructor(private readonly registry: ISchedulerRegistry) {}

    public async checkHealth() {
        const jobs = await this.registry.getRegisteredJobs();
        const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
        const waitingJobs = jobs.filter(j => j.status === 'PAUSED').length;
        
        let latestExecution: Date | undefined;
        let failedExecutions = 0; // In a full implementation, you'd track this via Queue failed jobs or a separate repository

        for (const job of jobs) {
            if (job.status === 'FAILED') failedExecutions++;
            if (job.lastExecution) {
                if (!latestExecution || job.lastExecution > latestExecution) {
                    latestExecution = job.lastExecution;
                }
            }
        }

        return {
            status: 'UP' as const,
            activeJobs,
            waitingJobs,
            failedExecutions,
            lastExecution: latestExecution
        };
    }
}
