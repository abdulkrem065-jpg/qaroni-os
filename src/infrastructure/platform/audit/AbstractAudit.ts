import { IAuditPublisher, IAuditReader } from '../../../domain/platform/ports/IAudit';
import { AuditLog } from '../../../domain/platform/models/AuditLog';

export abstract class AbstractAuditPublisher implements IAuditPublisher {
    public abstract publish(log: AuditLog): Promise<void>;
}

export abstract class AbstractAuditReader implements IAuditReader {
    public abstract query(filter: Record<string, any>, limit?: number, offset?: number): Promise<AuditLog[]>;
    public abstract getById(id: string): Promise<AuditLog | null>;
}
