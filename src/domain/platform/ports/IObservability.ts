export interface ICorrelationContext {
    correlationId: string;
    requestId?: string;
    organizationId?: string;
    branchId?: string;
    userId?: string;
}

export interface ICorrelationIdProvider {
    get(): string;
    setContext(context: ICorrelationContext): void;
    getContext(): ICorrelationContext | undefined;
}

export enum LogSeverity {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL'
}

export interface ILogEntry {
    timestamp: Date;
    severity: LogSeverity;
    message: string;
    component: string;
    eventType: string;
    context: ICorrelationContext;
    metadata?: Record<string, any>;
    error?: Error;
}

export interface ILogFormatter {
    format(entry: ILogEntry): string | Record<string, any>;
}

export interface IStructuredLogger {
    debug(message: string, component: string, eventType: string, metadata?: Record<string, any>): void;
    info(message: string, component: string, eventType: string, metadata?: Record<string, any>): void;
    warn(message: string, component: string, eventType: string, metadata?: Record<string, any>): void;
    error(message: string, component: string, eventType: string, error?: Error, metadata?: Record<string, any>): void;
    fatal(message: string, component: string, eventType: string, error?: Error, metadata?: Record<string, any>): void;
}

export interface ILoggerManager {
    getLogger(component: string): IStructuredLogger;
}

// Metrics Engine
export interface ICounter {
    inc(value?: number, labels?: Record<string, string>): void;
}

export interface IGauge {
    set(value: number, labels?: Record<string, string>): void;
    inc(value?: number, labels?: Record<string, string>): void;
    dec(value?: number, labels?: Record<string, string>): void;
}

export interface IHistogram {
    observe(value: number, labels?: Record<string, string>): void;
}

export interface ITimer {
    start(): void;
    stop(labels?: Record<string, string>): number;
}

export interface IMetricsRegistry {
    createCounter(name: string, help: string): ICounter;
    createGauge(name: string, help: string): IGauge;
    createHistogram(name: string, help: string): IHistogram;
}

export interface IMetricsCollector {
    collect(): Promise<any>;
}

// Health Monitoring
export enum HealthStatus {
    UP = 'UP',
    DOWN = 'DOWN',
    DEGRADED = 'DEGRADED'
}

export interface IHealthCheckResult {
    status: HealthStatus;
    component: string;
    message?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface IHealthProvider {
    checkHealth(): Promise<IHealthCheckResult>;
}

export interface IHealthCheckRegistry {
    register(provider: IHealthProvider): void;
    getProviders(): IHealthProvider[];
}

export interface IHealthStatusAggregator {
    aggregate(results: IHealthCheckResult[]): IHealthCheckResult;
}

export interface IHealthMonitor {
    checkAll(): Promise<IHealthCheckResult>;
}

// Distributed Tracing
export interface ITraceContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
}

export interface ISpan {
    getContext(): ITraceContext;
    addEvent(name: string, attributes?: Record<string, any>): void;
    setAttribute(key: string, value: any): void;
    end(): void;
}

export interface ITraceExporter {
    export(span: ISpan): Promise<void>;
}

export interface ITraceManager {
    startSpan(name: string, parentContext?: ITraceContext): ISpan;
    getCurrentContext(): ITraceContext | undefined;
}

// Audit Backend
export interface IAuditFilter {
    organizationId?: string;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface IAuditRecord {
    id: string;
    timestamp: Date;
    organizationId: string;
    userId: string;
    action: string;
    resource: string;
    details: Record<string, any>;
}

export interface IImmutableAuditStream {
    append(record: IAuditRecord): Promise<void>;
}

export interface IAuditReader {
    search(filter: IAuditFilter): Promise<IAuditRecord[]>;
}

// Alert Engine
export enum AlertSeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL'
}

export interface IAlertRule {
    id: string;
    name: string;
    condition: string; // Abstract representation
    severity: AlertSeverity;
}

export interface IAlertHistory {
    id: string;
    ruleId: string;
    timestamp: Date;
    message: string;
    severity: AlertSeverity;
}

export interface IAlertDispatcher {
    dispatch(alert: IAlertHistory): Promise<void>;
}

// Performance Diagnostics
export interface IExecutionStatistics {
    averageDurationMs: number;
    p95DurationMs: number;
    p99DurationMs: number;
    totalExecutions: number;
    failedExecutions: number;
}

export interface ISlowRequestDetector {
    recordRequest(path: string, durationMs: number): void;
    getSlowRequests(): Promise<any[]>;
}

export interface ISlowJobDetector {
    recordJob(jobName: string, durationMs: number): void;
    getSlowJobs(): Promise<any[]>;
}

export interface ISlowQueryDetector {
    recordQuery(query: string, durationMs: number): void;
    getSlowQueries(): Promise<any[]>;
}

// Runtime Dashboard Backend
export interface IRuntimeStatus {
    activeWorkers: number;
    queueSize: number;
    schedulerStatus: string;
    cacheStatus: string;
    healthSummary: HealthStatus;
    uptimeSeconds: number;
}
