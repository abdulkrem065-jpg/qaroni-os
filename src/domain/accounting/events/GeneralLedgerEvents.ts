import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { LedgerEntryId } from '../valueobjects/LedgerEntryId';
import { LedgerBalanceId } from '../valueobjects/LedgerBalanceId';

export class LedgerEntryCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly ledgerEntryId: LedgerEntryId) {}
}

export class LedgerBalanceUpdatedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly ledgerBalanceId: LedgerBalanceId) {}
}
