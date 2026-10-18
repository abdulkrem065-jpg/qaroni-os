import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export class AuditEventId extends EntityId {
    constructor(id: string) { super(id); }
}

export type AuditEventType = 'POSTING' | 'CLOSING' | 'VOIDING' | 'ADJUSTING' | 'REOPENING' | 'ACCOUNT_MODIFICATION';

export class FinancialAuditEvent extends AggregateRoot<AuditEventId> {
    private constructor(
        id: AuditEventId,
        private readonly _organizationId: OrganizationId,
        private readonly _eventType: AuditEventType,
        private readonly _userId: string,
        private readonly _timestamp: Date,
        private readonly _previousValue: string | null,
        private readonly _newValue: string | null,
        private readonly _reason: string,
        private readonly _entityId: string,
        private readonly _entityType: string
    ) {
        super(id);
    }

    public static create(
        id: AuditEventId,
        organizationId: OrganizationId,
        eventType: AuditEventType,
        userId: string,
        previousValue: string | null,
        newValue: string | null,
        reason: string,
        entityId: string,
        entityType: string
    ): FinancialAuditEvent {
        return new FinancialAuditEvent(
            id,
            organizationId,
            eventType,
            userId,
            new Date(),
            previousValue,
            newValue,
            reason,
            entityId,
            entityType
        );
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get eventType(): AuditEventType { return this._eventType; }
    public get userId(): string { return this._userId; }
    public get timestamp(): Date { return this._timestamp; }
    public get previousValue(): string | null { return this._previousValue; }
    public get newValue(): string | null { return this._newValue; }
    public get reason(): string { return this._reason; }
    public get entityId(): string { return this._entityId; }
    public get entityType(): string { return this._entityType; }
}
