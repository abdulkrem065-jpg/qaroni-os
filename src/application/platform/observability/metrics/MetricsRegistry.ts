import { IMetricsRegistry, ICounter, IGauge, IHistogram, ITimer, IMetricsCollector } from '../../../../domain/platform/ports/IObservability';

export class SimpleCounter implements ICounter {
    private value = 0;
    public inc(val: number = 1, labels?: Record<string, string>): void {
        this.value += val;
    }
    public getValue(): number { return this.value; }
}

export class SimpleGauge implements IGauge {
    private value = 0;
    public set(val: number, labels?: Record<string, string>): void {
        this.value = val;
    }
    public inc(val: number = 1, labels?: Record<string, string>): void {
        this.value += val;
    }
    public dec(val: number = 1, labels?: Record<string, string>): void {
        this.value -= val;
    }
    public getValue(): number { return this.value; }
}

export class SimpleHistogram implements IHistogram {
    private observations: number[] = [];
    public observe(val: number, labels?: Record<string, string>): void {
        this.observations.push(val);
    }
    public getObservations(): number[] { return this.observations; }
}

export class MetricsRegistry implements IMetricsRegistry, IMetricsCollector {
    private counters = new Map<string, SimpleCounter>();
    private gauges = new Map<string, SimpleGauge>();
    private histograms = new Map<string, SimpleHistogram>();

    public createCounter(name: string, help: string): ICounter {
        if (!this.counters.has(name)) {
            this.counters.set(name, new SimpleCounter());
        }
        return this.counters.get(name)!;
    }

    public createGauge(name: string, help: string): IGauge {
        if (!this.gauges.has(name)) {
            this.gauges.set(name, new SimpleGauge());
        }
        return this.gauges.get(name)!;
    }

    public createHistogram(name: string, help: string): IHistogram {
        if (!this.histograms.has(name)) {
            this.histograms.set(name, new SimpleHistogram());
        }
        return this.histograms.get(name)!;
    }

    public async collect(): Promise<any> {
        const metrics: Record<string, any> = {
            counters: {},
            gauges: {},
            histograms: {}
        };
        for (const [name, counter] of this.counters.entries()) {
            metrics.counters[name] = counter.getValue();
        }
        for (const [name, gauge] of this.gauges.entries()) {
            metrics.gauges[name] = gauge.getValue();
        }
        for (const [name, hist] of this.histograms.entries()) {
            const obs = hist.getObservations();
            metrics.histograms[name] = {
                count: obs.length,
                avg: obs.length ? obs.reduce((a, b) => a + b, 0) / obs.length : 0
            };
        }
        return metrics;
    }
}
