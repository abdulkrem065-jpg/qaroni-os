import { EntityId } from '../../shared/valueobjects/EntityId';

export class AuditLogId extends EntityId {}

export class AuditLog {
    constructor(
        public readonly id: AuditLogId,
        public readonly action: string,
        public readonly actorId: string,
        public readonly entityType: string,
        public readonly entityId: string,
        public readonly timestamp: Date,
        public readonly details: Record<string, any>,
        public readonly correlationId?: string
    ) {}
}
