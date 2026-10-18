import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';

export class CurrencyCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class CurrencyUpdatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class BaseCurrencyChangedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly newCurrencyId: string) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class ExchangeRateCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class FiscalYearCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class FiscalPeriodOpenedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly periodId: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class FiscalPeriodClosedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly periodId: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class TaxProfileCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class NumberSequenceCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class NumberGeneratedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly id: string, public readonly organizationId: OrganizationId, public readonly value: string) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}
