import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { IncomeStatementId } from '../valueobjects/IncomeStatementId';

export class IncomeStatementGeneratedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly incomeStatementId: IncomeStatementId) {}
}

export class ProfitCalculatedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly incomeStatementId: IncomeStatementId, public readonly netProfit: number) {}
}

export class LossDetectedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly incomeStatementId: IncomeStatementId, public readonly netLoss: number) {}
}

export class IncomeStatementValidatedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly eventName: string = this.constructor.name;
    constructor(public readonly organizationId: OrganizationId, public readonly incomeStatementId: IncomeStatementId) {}
}
