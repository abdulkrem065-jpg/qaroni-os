import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Value Objects
create_file('src/domain/accounting/valueobjects/IncomeStatementId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class IncomeStatementId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/IncomeStatementPeriod.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class IncomeStatementPeriod {
    constructor(
        public readonly startDate: Date,
        public readonly endDate: Date
    ) {
        if (startDate > endDate) {
            throw new ValidationError('StartDate cannot be after EndDate');
        }
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/RevenueTotal.ts', """export class RevenueTotal {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/ExpenseTotal.ts', """export class ExpenseTotal {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/GrossProfit.ts', """export class GrossProfit {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/OperatingProfit.ts', """export class OperatingProfit {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/NetProfit.ts', """export class NetProfit {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/IncomeStatementClassification.ts', """export type IncomeStatementMainSection = 'REVENUE' | 'COGS' | 'OPERATING_EXPENSES' | 'FINANCIAL_EXPENSES' | 'DEPRECIATION' | 'TAXES';
export type IncomeStatementSubSection = 'SALES_REVENUE' | 'SERVICE_REVENUE' | 'OTHER_OPERATING_REVENUE' | 'NON_OPERATING_REVENUE' | 'INVENTORY_COST' | 'PURCHASE_COST' | 'DIRECT_COST' | 'ADMINISTRATIVE_EXPENSES' | 'SELLING_EXPENSES' | 'MARKETING_EXPENSES' | 'PAYROLL' | 'RENT' | 'UTILITIES' | 'INTEREST' | 'BANKING_CHARGES' | 'FIXED_ASSETS_DEPRECIATION' | 'INTANGIBLE_ASSETS_DEPRECIATION' | 'TAX_PROVISION';
""")

# Entities
create_file('src/domain/accounting/entities/IncomeStatementLine.ts', """import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { AccountId } from '../valueobjects/AccountId';

export class IncomeStatementLine extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _accountId: AccountId,
        private readonly _accountNumber: string,
        private readonly _accountName: string,
        private readonly _amount: number
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        accountId: AccountId,
        accountNumber: string,
        accountName: string,
        amount: number
    ): IncomeStatementLine {
        return new IncomeStatementLine(id, accountId, accountNumber, accountName, amount);
    }

    public static load(
        id: EntityId,
        accountId: AccountId,
        accountNumber: string,
        accountName: string,
        amount: number
    ): IncomeStatementLine {
        return new IncomeStatementLine(id, accountId, accountNumber, accountName, amount);
    }

    public get accountId(): AccountId { return this._accountId; }
    public get accountNumber(): string { return this._accountNumber; }
    public get accountName(): string { return this._accountName; }
    public get amount(): number { return this._amount; }
}
""")

create_file('src/domain/accounting/entities/IncomeStatementSection.ts', """import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { IncomeStatementMainSection, IncomeStatementSubSection } from '../valueobjects/IncomeStatementClassification';
import { IncomeStatementLine } from './IncomeStatementLine';

export class IncomeStatementSection extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _mainSection: IncomeStatementMainSection,
        private readonly _subSection: IncomeStatementSubSection,
        private _lines: IncomeStatementLine[],
        private _total: number
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        mainSection: IncomeStatementMainSection,
        subSection: IncomeStatementSubSection,
        lines: IncomeStatementLine[]
    ): IncomeStatementSection {
        const total = lines.reduce((sum, line) => sum + line.amount, 0);
        return new IncomeStatementSection(id, mainSection, subSection, lines, total);
    }

    public static load(
        id: EntityId,
        mainSection: IncomeStatementMainSection,
        subSection: IncomeStatementSubSection,
        lines: IncomeStatementLine[],
        total: number
    ): IncomeStatementSection {
        return new IncomeStatementSection(id, mainSection, subSection, lines, total);
    }

    public get mainSection(): IncomeStatementMainSection { return this._mainSection; }
    public get subSection(): IncomeStatementSubSection { return this._subSection; }
    public get lines(): ReadonlyArray<IncomeStatementLine> { return this._lines; }
    public get total(): number { return this._total; }
}
""")

# Events
create_file('src/domain/accounting/events/IncomeStatementEvents.ts', """import { IDomainEvent } from '../../shared/core/IDomainEvent';
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
""")

# Aggregate
create_file('src/domain/accounting/aggregates/IncomeStatement.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { IncomeStatementId } from '../valueobjects/IncomeStatementId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { IncomeStatementPeriod } from '../valueobjects/IncomeStatementPeriod';
import { IncomeStatementSection } from '../entities/IncomeStatementSection';
import { RevenueTotal } from '../valueobjects/RevenueTotal';
import { ExpenseTotal } from '../valueobjects/ExpenseTotal';
import { GrossProfit } from '../valueobjects/GrossProfit';
import { OperatingProfit } from '../valueobjects/OperatingProfit';
import { NetProfit } from '../valueobjects/NetProfit';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { TrialBalanceId } from '../valueobjects/TrialBalanceId';
import { IncomeStatementGeneratedEvent, ProfitCalculatedEvent, LossDetectedEvent, IncomeStatementValidatedEvent } from '../events/IncomeStatementEvents';

export class IncomeStatement extends AggregateRoot<IncomeStatementId> {
    private constructor(
        id: IncomeStatementId,
        private readonly _organizationId: OrganizationId,
        private readonly _trialBalanceId: TrialBalanceId,
        private readonly _period: IncomeStatementPeriod,
        private _sections: IncomeStatementSection[],
        private _status: 'DRAFT' | 'PUBLISHED',
        private _generatedAt: Date
    ) {
        super(id);
    }

    public static generate(
        id: IncomeStatementId,
        organizationId: OrganizationId,
        trialBalanceId: TrialBalanceId,
        period: IncomeStatementPeriod,
        sections: IncomeStatementSection[]
    ): IncomeStatement {
        const is = new IncomeStatement(id, organizationId, trialBalanceId, period, sections, 'DRAFT', new Date());
        is.calculateTotals(); // Validates calculation rule internally
        
        is.addDomainEvent(new IncomeStatementGeneratedEvent(organizationId, id));
        
        const net = is.calculateNetProfit().value;
        if (net >= 0) {
            is.addDomainEvent(new ProfitCalculatedEvent(organizationId, id, net));
        } else {
            is.addDomainEvent(new LossDetectedEvent(organizationId, id, Math.abs(net)));
        }

        return is;
    }

    public static load(
        id: IncomeStatementId,
        organizationId: OrganizationId,
        trialBalanceId: TrialBalanceId,
        period: IncomeStatementPeriod,
        sections: IncomeStatementSection[],
        status: 'DRAFT' | 'PUBLISHED',
        generatedAt: Date
    ): IncomeStatement {
        return new IncomeStatement(id, organizationId, trialBalanceId, period, sections, status, generatedAt);
    }

    public calculateTotals(): { grossProfit: GrossProfit, operatingProfit: OperatingProfit, netProfit: NetProfit } {
        const revenue = this.calculateSectionTotal('REVENUE');
        const cogs = this.calculateSectionTotal('COGS');
        const operatingExpenses = this.calculateSectionTotal('OPERATING_EXPENSES');
        const financialExpenses = this.calculateSectionTotal('FINANCIAL_EXPENSES');
        const depreciation = this.calculateSectionTotal('DEPRECIATION');
        const taxes = this.calculateSectionTotal('TAXES'); // Abstraction only

        const grossProfit = revenue - cogs;
        const operatingProfit = grossProfit - operatingExpenses;
        const netProfit = operatingProfit - financialExpenses - depreciation - taxes;

        return {
            grossProfit: new GrossProfit(grossProfit),
            operatingProfit: new OperatingProfit(operatingProfit),
            netProfit: new NetProfit(netProfit)
        };
    }

    private calculateSectionTotal(mainSection: string): number {
        return this._sections
            .filter(s => s.mainSection === mainSection)
            .reduce((sum, s) => sum + s.total, 0);
    }

    public calculateRevenueTotal(): RevenueTotal {
        return new RevenueTotal(this.calculateSectionTotal('REVENUE'));
    }

    public calculateExpenseTotal(): ExpenseTotal {
        const cogs = this.calculateSectionTotal('COGS');
        const operatingExpenses = this.calculateSectionTotal('OPERATING_EXPENSES');
        const financialExpenses = this.calculateSectionTotal('FINANCIAL_EXPENSES');
        const depreciation = this.calculateSectionTotal('DEPRECIATION');
        const taxes = this.calculateSectionTotal('TAXES');

        return new ExpenseTotal(cogs + operatingExpenses + financialExpenses + depreciation + taxes);
    }

    public calculateGrossProfit(): GrossProfit {
        return this.calculateTotals().grossProfit;
    }

    public calculateOperatingProfit(): OperatingProfit {
        return this.calculateTotals().operatingProfit;
    }

    public calculateNetProfit(): NetProfit {
        return this.calculateTotals().netProfit;
    }

    public validate(): void {
        this.addDomainEvent(new IncomeStatementValidatedEvent(this._organizationId, this.id));
    }

    public publish(): void {
        if (this._status !== 'DRAFT') throw new BusinessRuleError('Only DRAFT income statements can be published');
        this.validate();
        this._status = 'PUBLISHED';
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get trialBalanceId(): TrialBalanceId { return this._trialBalanceId; }
    public get period(): IncomeStatementPeriod { return this._period; }
    public get sections(): ReadonlyArray<IncomeStatementSection> { return this._sections; }
    public get status(): 'DRAFT' | 'PUBLISHED' { return this._status; }
    public get generatedAt(): Date { return this._generatedAt; }
}
""")

print("Income Statement Domain generated")
