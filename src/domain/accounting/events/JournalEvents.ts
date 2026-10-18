import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { JournalId } from '../valueobjects/JournalId';

export class JournalCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly journalId: JournalId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class JournalStatusChangedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly journalId: JournalId, public readonly oldStatus: string, public readonly newStatus: string) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}
