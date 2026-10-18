import { ITraceManager, ITraceContext, ISpan, ITraceExporter } from '../../../../domain/platform/ports/IObservability';
import { AsyncLocalStorage } from 'async_hooks';
import * as crypto from 'crypto';

export class Span implements ISpan {
    private events: { name: string; attributes?: Record<string, any>; timestamp: Date }[] = [];
    private attributes: Record<string, any> = {};
    private endTime?: Date;

    constructor(
        private readonly context: ITraceContext,
        private readonly name: string,
        private readonly exporter: ITraceExporter,
        private readonly startTime: Date = new Date()
    ) {}

    public getContext(): ITraceContext {
        return this.context;
    }

    public addEvent(name: string, attributes?: Record<string, any>): void {
        this.events.push({ name, attributes, timestamp: new Date() });
    }

    public setAttribute(key: string, value: any): void {
        this.attributes[key] = value;
    }

    public end(): void {
        this.endTime = new Date();
        // In a real implementation this might be async/queued
        this.exporter.export(this).catch(console.error);
    }
}

export class TraceManager implements ITraceManager {
    private asyncLocalStorage = new AsyncLocalStorage<ITraceContext>();

    constructor(private readonly exporter: ITraceExporter) {}

    public startSpan(name: string, parentContext?: ITraceContext): ISpan {
        const parent = parentContext || this.getCurrentContext();
        
        const traceId = parent?.traceId || crypto.randomUUID();
        const spanId = crypto.randomUUID();
        
        const context: ITraceContext = {
            traceId,
            spanId,
            parentSpanId: parent?.spanId
        };
        
        return new Span(context, name, this.exporter);
    }

    public getCurrentContext(): ITraceContext | undefined {
        return this.asyncLocalStorage.getStore();
    }

    public runWithContext<T>(context: ITraceContext, fn: () => T): T {
        return this.asyncLocalStorage.run(context, fn);
    }
}
