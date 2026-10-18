import { ILogFormatter, ILogEntry } from '../../../../domain/platform/ports/IObservability';

export class JsonLogFormatter implements ILogFormatter {
    public format(entry: ILogEntry): string {
        const payload: Record<string, any> = {
            timestamp: entry.timestamp.toISOString(),
            severity: entry.severity,
            message: entry.message,
            component: entry.component,
            eventType: entry.eventType,
            correlationId: entry.context?.correlationId,
            requestId: entry.context?.requestId,
            organizationId: entry.context?.organizationId,
            branchId: entry.context?.branchId,
            userId: entry.context?.userId,
        };

        if (entry.metadata) {
            payload.metadata = entry.metadata;
        }

        if (entry.error) {
            payload.error = {
                message: entry.error.message,
                name: entry.error.name,
                stack: entry.error.stack
            };
        }

        return JSON.stringify(payload);
    }
}
