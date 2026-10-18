import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { FiscalYearId } from '../valueobjects/FiscalYearId';
import { AccountingPeriodId } from '../valueobjects/AccountingPeriodId';

export class FiscalYearCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName = 'FiscalYearCreatedEvent';
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly fiscalYearId: FiscalYearId
    ) {
        this.occurredOn = new Date();
    }
}

export class FiscalYearClosedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName = 'FiscalYearClosedEvent';
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly fiscalYearId: FiscalYearId
    ) {
        this.occurredOn = new Date();
    }
}

export class AccountingPeriodStatusChangedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName = 'AccountingPeriodStatusChangedEvent';
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly periodId: AccountingPeriodId,
        public readonly oldStatus: string,
        public readonly newStatus: string
    ) {
        this.occurredOn = new Date();
    }
}

export class AccountingPeriodArchivedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName = 'AccountingPeriodArchivedEvent';
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly periodId: AccountingPeriodId
    ) {
        this.occurredOn = new Date();
    }
}
