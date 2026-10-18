import { 
    IHealthMonitor, 
    IHealthCheckRegistry, 
    IHealthStatusAggregator, 
    IHealthProvider, 
    IHealthCheckResult, 
    HealthStatus 
} from '../../../../domain/platform/ports/IObservability';

export class HealthCheckRegistry implements IHealthCheckRegistry {
    private providers: IHealthProvider[] = [];

    public register(provider: IHealthProvider): void {
        this.providers.push(provider);
    }

    public getProviders(): IHealthProvider[] {
        return this.providers;
    }
}

export class HealthStatusAggregator implements IHealthStatusAggregator {
    public aggregate(results: IHealthCheckResult[]): IHealthCheckResult {
        let finalStatus = HealthStatus.UP;
        const messages: string[] = [];

        for (const res of results) {
            if (res.status === HealthStatus.DOWN) {
                finalStatus = HealthStatus.DOWN;
            } else if (res.status === HealthStatus.DEGRADED && finalStatus !== HealthStatus.DOWN) {
                finalStatus = HealthStatus.DEGRADED;
            }
            if (res.message) {
                messages.push(`${res.component}: ${res.message}`);
            }
        }

        return {
            status: finalStatus,
            component: 'System',
            message: messages.join(' | '),
            timestamp: new Date(),
            metadata: { results }
        };
    }
}

export class HealthMonitor implements IHealthMonitor {
    constructor(
        private readonly registry: IHealthCheckRegistry,
        private readonly aggregator: IHealthStatusAggregator
    ) {}

    public async checkAll(): Promise<IHealthCheckResult> {
        const providers = this.registry.getProviders();
        const results = await Promise.all(providers.map(p => p.checkHealth().catch(e => ({
            status: HealthStatus.DOWN,
            component: 'Unknown',
            message: e.message || 'Health check failed',
            timestamp: new Date()
        }))));
        return this.aggregator.aggregate(results);
    }
}
