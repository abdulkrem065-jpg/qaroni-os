import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { AccountId } from '../valueobjects/AccountId';

export class AccountCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly accountId: AccountId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class AccountUpdatedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly accountId: AccountId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class AccountArchivedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly accountId: AccountId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class AccountRestoredEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly accountId: AccountId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}

export class AccountMovedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string;
    constructor(public readonly organizationId: OrganizationId, public readonly accountId: AccountId, public readonly newParentId?: AccountId) {
        this.occurredOn = new Date();
        this.eventName = this.constructor.name;
    }
}
