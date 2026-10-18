import { 
    ISlowRequestDetector, 
    ISlowJobDetector, 
    ISlowQueryDetector 
} from '../../../../domain/platform/ports/IObservability';

export class SlowRequestDetector implements ISlowRequestDetector {
    private slowRequests: { path: string; durationMs: number; timestamp: Date }[] = [];
    private thresholdMs: number;

    constructor(thresholdMs: number = 1000) {
        this.thresholdMs = thresholdMs;
    }

    public recordRequest(path: string, durationMs: number): void {
        if (durationMs > this.thresholdMs) {
            this.slowRequests.push({ path, durationMs, timestamp: new Date() });
            // Keep last 100
            if (this.slowRequests.length > 100) this.slowRequests.shift();
        }
    }

    public async getSlowRequests(): Promise<any[]> {
        return this.slowRequests;
    }
}

export class SlowJobDetector implements ISlowJobDetector {
    private slowJobs: { jobName: string; durationMs: number; timestamp: Date }[] = [];
    private thresholdMs: number;

    constructor(thresholdMs: number = 5000) {
        this.thresholdMs = thresholdMs;
    }

    public recordJob(jobName: string, durationMs: number): void {
        if (durationMs > this.thresholdMs) {
            this.slowJobs.push({ jobName, durationMs, timestamp: new Date() });
            if (this.slowJobs.length > 100) this.slowJobs.shift();
        }
    }

    public async getSlowJobs(): Promise<any[]> {
        return this.slowJobs;
    }
}

export class SlowQueryDetector implements ISlowQueryDetector {
    private slowQueries: { query: string; durationMs: number; timestamp: Date }[] = [];
    private thresholdMs: number;

    constructor(thresholdMs: number = 500) {
        this.thresholdMs = thresholdMs;
    }

    public recordQuery(query: string, durationMs: number): void {
        if (durationMs > this.thresholdMs) {
            this.slowQueries.push({ query, durationMs, timestamp: new Date() });
            if (this.slowQueries.length > 100) this.slowQueries.shift();
        }
    }

    public async getSlowQueries(): Promise<any[]> {
        return this.slowQueries;
    }
}
