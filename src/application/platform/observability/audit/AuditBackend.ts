import { 
    IImmutableAuditStream, 
    IAuditReader, 
    IAuditRecord, 
    IAuditFilter 
} from '../../../../domain/platform/ports/IObservability';

export class InMemoryAuditBackend implements IImmutableAuditStream, IAuditReader {
    private records: IAuditRecord[] = [];

    public async append(record: IAuditRecord): Promise<void> {
        this.records.push({ ...record, timestamp: record.timestamp || new Date() });
        // In a real system, append to a write-only log or immutable storage
    }

    public async search(filter: IAuditFilter): Promise<IAuditRecord[]> {
        return this.records.filter(r => {
            if (filter.organizationId && r.organizationId !== filter.organizationId) return false;
            if (filter.userId && r.userId !== filter.userId) return false;
            if (filter.action && r.action !== filter.action) return false;
            if (filter.startDate && r.timestamp < filter.startDate) return false;
            if (filter.endDate && r.timestamp > filter.endDate) return false;
            return true;
        });
    }
}
