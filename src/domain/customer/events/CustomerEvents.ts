import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { CustomerId } from '../valueobjects/CustomerId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CreditLimit } from '../valueobjects/CreditLimit';

export class CustomerCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;

    constructor(
        public readonly customerId: CustomerId,
        public readonly organizationId: OrganizationId
    ) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class CustomerUpdatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;

    constructor(
        public readonly customerId: CustomerId,
        public readonly organizationId: OrganizationId
    ) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class CustomerArchivedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;

    constructor(
        public readonly customerId: CustomerId,
        public readonly organizationId: OrganizationId
    ) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class CustomerRestoredEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;

    constructor(
        public readonly customerId: CustomerId,
        public readonly organizationId: OrganizationId
    ) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class CustomerCreditLimitChangedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;

    constructor(
        public readonly customerId: CustomerId,
        public readonly organizationId: OrganizationId,
        public readonly oldLimit: CreditLimit,
        public readonly newLimit: CreditLimit
    ) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}
