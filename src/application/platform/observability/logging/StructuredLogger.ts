import { IStructuredLogger, ILoggerManager, ILogFormatter, ICorrelationIdProvider, LogSeverity } from '../../../../domain/platform/ports/IObservability';

export class StructuredLogger implements IStructuredLogger {
    constructor(
        private readonly component: string,
        private readonly formatter: ILogFormatter,
        private readonly correlationIdProvider: ICorrelationIdProvider
    ) {}

    private log(severity: LogSeverity, message: string, eventType: string, error?: Error, metadata?: Record<string, any>) {
        const context = this.correlationIdProvider.getContext() || { correlationId: 'SYSTEM' };
        
        const entry = {
            timestamp: new Date(),
            severity,
            message,
            component: this.component,
            eventType,
            context,
            metadata,
            error
        };

        const formatted = this.formatter.format(entry);
        
        // Output to stdout/stderr - abstract enough for a 12-factor app
        if (severity === LogSeverity.ERROR || severity === LogSeverity.FATAL) {
            console.error(formatted);
        } else if (severity === LogSeverity.WARN) {
            console.warn(formatted);
        } else {
            console.log(formatted);
        }
    }

    public debug(message: string, component: string, eventType: string, metadata?: Record<string, any>): void {
        this.log(LogSeverity.DEBUG, message, eventType, undefined, metadata);
    }

    public info(message: string, component: string, eventType: string, metadata?: Record<string, any>): void {
        this.log(LogSeverity.INFO, message, eventType, undefined, metadata);
    }

    public warn(message: string, component: string, eventType: string, metadata?: Record<string, any>): void {
        this.log(LogSeverity.WARN, message, eventType, undefined, metadata);
    }

    public error(message: string, component: string, eventType: string, error?: Error, metadata?: Record<string, any>): void {
        this.log(LogSeverity.ERROR, message, eventType, error, metadata);
    }

    public fatal(message: string, component: string, eventType: string, error?: Error, metadata?: Record<string, any>): void {
        this.log(LogSeverity.FATAL, message, eventType, error, metadata);
    }
}

export class LoggerManager implements ILoggerManager {
    constructor(
        private readonly formatter: ILogFormatter,
        private readonly correlationIdProvider: ICorrelationIdProvider
    ) {}

    public getLogger(component: string): IStructuredLogger {
        return new StructuredLogger(component, this.formatter, this.correlationIdProvider);
    }
}
