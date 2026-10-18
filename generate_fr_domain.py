import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Value Objects
create_file('src/domain/accounting/valueobjects/FinancialRatiosId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class FinancialRatiosId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/RatioId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class RatioId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/RatioName.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class RatioName {
    constructor(public readonly value: string) {
        if (!value || value.trim() === '') throw new ValidationError('RatioName cannot be empty');
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/RatioValue.ts', """export class RatioValue {
    constructor(public readonly value: number | null) { // null represents division by zero or missing data
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/RatioBenchmark.ts', """export class RatioBenchmark {
    constructor(public readonly value: number | null) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/RatioStatus.ts', """export type RatioStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
""")

create_file('src/domain/accounting/valueobjects/RatioCategory.ts', """export type RatioCategory = 'LIQUIDITY' | 'PROFITABILITY' | 'EFFICIENCY' | 'SOLVENCY' | 'PERFORMANCE' | 'GROWTH';
""")

# Entities
create_file('src/domain/accounting/entities/RatioResult.ts', """import { Entity } from '../../shared/core/Entity';
import { RatioId } from '../valueobjects/RatioId';
import { RatioName } from '../valueobjects/RatioName';
import { RatioValue } from '../valueobjects/RatioValue';
import { RatioBenchmark } from '../valueobjects/RatioBenchmark';
import { RatioStatus } from '../valueobjects/RatioStatus';
import { RatioCategory } from '../valueobjects/RatioCategory';

export class RatioResult extends Entity<RatioId> {
    private constructor(
        id: RatioId,
        private readonly _category: RatioCategory,
        private readonly _name: RatioName,
        private readonly _value: RatioValue,
        private readonly _benchmark: RatioBenchmark,
        private readonly _status: RatioStatus
    ) {
        super(id);
    }

    public static create(
        id: RatioId,
        category: RatioCategory,
        name: RatioName,
        value: RatioValue,
        benchmark: RatioBenchmark,
        status: RatioStatus
    ): RatioResult {
        return new RatioResult(id, category, name, value, benchmark, status);
    }

    public static load(
        id: RatioId,
        category: RatioCategory,
        name: RatioName,
        value: RatioValue,
        benchmark: RatioBenchmark,
        status: RatioStatus
    ): RatioResult {
        return new RatioResult(id, category, name, value, benchmark, status);
    }

    public get category(): RatioCategory { return this._category; }
    public get name(): RatioName { return this._name; }
    public get value(): RatioValue { return this._value; }
    public get benchmark(): RatioBenchmark { return this._benchmark; }
    public get status(): RatioStatus { return this._status; }
}
""")

# Events
create_file('src/domain/accounting/events/FinancialRatiosEvents.ts', """import { IDomainEvent } from '../../shared/core/IDomainEvent';
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
""")

# Aggregate
create_file('src/domain/accounting/aggregates/FinancialRatios.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { FinancialRatiosId } from '../valueobjects/FinancialRatiosId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BalanceSheetId } from '../valueobjects/BalanceSheetId';
import { IncomeStatementId } from '../valueobjects/IncomeStatementId';
import { CashFlowStatementId } from '../valueobjects/CashFlowStatementId';
import { RatioResult } from '../entities/RatioResult';
import { FinancialRatiosGeneratedEvent, FinancialRatioCalculatedEvent, FinancialRatiosValidationCompletedEvent } from '../events/FinancialRatiosEvents';

export class FinancialRatios extends AggregateRoot<FinancialRatiosId> {
    private constructor(
        id: FinancialRatiosId,
        private readonly _organizationId: OrganizationId,
        private readonly _balanceSheetId: BalanceSheetId,
        private readonly _incomeStatementId: IncomeStatementId,
        private readonly _cashFlowStatementId: CashFlowStatementId | null, // Optional if cash flow is not generated
        private _results: RatioResult[],
        private readonly _periodEndDate: Date,
        private _status: 'DRAFT' | 'PUBLISHED',
        private _generatedAt: Date
    ) {
        super(id);
    }

    public static generate(
        id: FinancialRatiosId,
        organizationId: OrganizationId,
        balanceSheetId: BalanceSheetId,
        incomeStatementId: IncomeStatementId,
        cashFlowStatementId: CashFlowStatementId | null,
        periodEndDate: Date,
        results: RatioResult[]
    ): FinancialRatios {
        const ratios = new FinancialRatios(
            id, 
            organizationId, 
            balanceSheetId, 
            incomeStatementId, 
            cashFlowStatementId, 
            results,
            periodEndDate,
            'DRAFT', 
            new Date()
        );

        ratios.addDomainEvent(new FinancialRatiosGeneratedEvent(organizationId, id));
        results.forEach(r => {
            ratios.addDomainEvent(new FinancialRatioCalculatedEvent(organizationId, id, r.name.value, r.value.value));
        });

        return ratios;
    }

    public static load(
        id: FinancialRatiosId,
        organizationId: OrganizationId,
        balanceSheetId: BalanceSheetId,
        incomeStatementId: IncomeStatementId,
        cashFlowStatementId: CashFlowStatementId | null,
        periodEndDate: Date,
        results: RatioResult[],
        status: 'DRAFT' | 'PUBLISHED',
        generatedAt: Date
    ): FinancialRatios {
        return new FinancialRatios(id, organizationId, balanceSheetId, incomeStatementId, cashFlowStatementId, results, periodEndDate, status, generatedAt);
    }

    public validate(): void {
        this.addDomainEvent(new FinancialRatiosValidationCompletedEvent(this._organizationId, this.id));
    }

    public publish(): void {
        this.validate();
        this._status = 'PUBLISHED';
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get balanceSheetId(): BalanceSheetId { return this._balanceSheetId; }
    public get incomeStatementId(): IncomeStatementId { return this._incomeStatementId; }
    public get cashFlowStatementId(): CashFlowStatementId | null { return this._cashFlowStatementId; }
    public get periodEndDate(): Date { return this._periodEndDate; }
    public get results(): ReadonlyArray<RatioResult> { return this._results; }
    public get status(): 'DRAFT' | 'PUBLISHED' { return this._status; }
    public get generatedAt(): Date { return this._generatedAt; }
}
""")

print("Financial Ratios Domain generated")
