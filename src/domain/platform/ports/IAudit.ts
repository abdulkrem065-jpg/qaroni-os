import { AuditLog } from '../models/AuditLog';

export interface IAuditPublisher {
    publish(log: AuditLog): Promise<void>;
}

export interface IAuditReader {
    query(filter: Record<string, any>, limit?: number, offset?: number): Promise<AuditLog[]>;
    getById(id: string): Promise<AuditLog | null>;
}
