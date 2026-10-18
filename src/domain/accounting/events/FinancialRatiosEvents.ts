import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { FinancialRatiosId } from '../valueobjects/FinancialRatiosId';

export class FinancialRatiosGeneratedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly financialRatiosId: FinancialRatiosId) {}
}

export class FinancialRatioCalculatedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(
        public readonly organizationId: OrganizationId, 
        public readonly financialRatiosId: FinancialRatiosId,
        public readonly ratioName: string,
        public readonly ratioValue: number | null
    ) {}
}

export class FinancialRatiosValidationCompletedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly financialRatiosId: FinancialRatiosId) {}
}
