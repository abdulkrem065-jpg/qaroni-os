import { IRuntimeStatus, IHealthMonitor } from '../../../../domain/platform/ports/IObservability';

export interface IRuntimeDashboardDependencies {
    activeWorkersCount: () => Promise<number>;
    queueSize: () => Promise<number>;
    schedulerStatus: () => Promise<string>;
    cacheStatus: () => Promise<string>;
    healthMonitor: IHealthMonitor;
}

export class RuntimeDashboard {
    private startTime = Date.now();

    constructor(private readonly deps: IRuntimeDashboardDependencies) {}

    public async getStatus(): Promise<IRuntimeStatus> {
        const [
            activeWorkers,
            queueSize,
            schedulerStatus,
            cacheStatus,
            healthResult
        ] = await Promise.all([
            this.deps.activeWorkersCount().catch(() => 0),
            this.deps.queueSize().catch(() => 0),
            this.deps.schedulerStatus().catch(() => 'UNKNOWN'),
            this.deps.cacheStatus().catch(() => 'UNKNOWN'),
            this.deps.healthMonitor.checkAll()
        ]);

        return {
            activeWorkers,
            queueSize,
            schedulerStatus,
            cacheStatus,
            healthSummary: healthResult.status,
            uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000)
        };
    }
}
