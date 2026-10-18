import { ISchedulerRegistry, IScheduledJob } from '../../../domain/platform/ports/ISchedulerEngine';

export class SchedulerRegistry implements ISchedulerRegistry {
    private jobs: Map<string, IScheduledJob> = new Map();

    public async register(job: IScheduledJob): Promise<void> {
        this.jobs.set(job.id, job);
    }

    public async getRegisteredJobs(): Promise<IScheduledJob[]> {
        return Array.from(this.jobs.values());
    }

    // Pre-register standard system jobs
    public async registerSystemJobs(): Promise<void> {
        await this.register({
            id: 'sys-financial-closing',
            name: 'Financial Closing Job',
            queueName: 'system-tasks',
            payload: { task: 'FINANCIAL_CLOSING' },
            context: { isGlobal: true },
            schedule: { cron: '0 0 1 * *' }, // 1st of every month
            status: 'ACTIVE'
        });

        await this.register({
            id: 'sys-inventory-maintenance',
            name: 'Inventory Maintenance Job',
            queueName: 'system-tasks',
            payload: { task: 'INVENTORY_MAINTENANCE' },
            context: { isGlobal: true },
            schedule: { cron: '0 2 * * *' }, // 2 AM daily
            status: 'ACTIVE'
        });

        await this.register({
            id: 'sys-session-cleanup',
            name: 'Session Cleanup Job',
            queueName: 'system-tasks',
            payload: { task: 'SESSION_CLEANUP' },
            context: { isGlobal: true },
            schedule: { intervalMs: 3600000 }, // Every hour
            status: 'ACTIVE'
        });

        await this.register({
            id: 'sys-cache-cleanup',
            name: 'Cache Cleanup Job',
            queueName: 'system-tasks',
            payload: { task: 'CACHE_CLEANUP' },
            context: { isGlobal: true },
            schedule: { intervalMs: 86400000 }, // Daily
            status: 'ACTIVE'
        });

        await this.register({
            id: 'sys-audit-maintenance',
            name: 'Audit Maintenance Job',
            queueName: 'system-tasks',
            payload: { task: 'AUDIT_MAINTENANCE' },
            context: { isGlobal: true },
            schedule: { cron: '0 3 * * 0' }, // 3 AM every Sunday
            status: 'ACTIVE'
        });

        await this.register({
            id: 'sys-integration-retry',
            name: 'Integration Retry Job',
            queueName: 'system-tasks',
            payload: { task: 'INTEGRATION_RETRY' },
            context: { isGlobal: true },
            schedule: { intervalMs: 300000 }, // Every 5 minutes
            status: 'ACTIVE'
        });
    }
}
