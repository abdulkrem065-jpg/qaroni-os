import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CashFlowStatementId } from '../valueobjects/CashFlowStatementId';

export class CashFlowGeneratedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly cashFlowStatementId: CashFlowStatementId) {}
}

export class CashFlowValidatedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly cashFlowStatementId: CashFlowStatementId) {}
}

export class CashFlowMismatchDetectedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(
        public readonly organizationId: OrganizationId, 
        public readonly cashFlowStatementId: CashFlowStatementId,
        public readonly expectedClosing: number,
        public readonly actualClosing: number
    ) {}
}

export class CashPositionChangedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(
        public readonly organizationId: OrganizationId, 
        public readonly cashFlowStatementId: CashFlowStatementId,
        public readonly netMovement: number
    ) {}
}
