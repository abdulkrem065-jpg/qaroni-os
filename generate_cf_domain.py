import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Value Objects
create_file('src/domain/accounting/valueobjects/CashFlowStatementId.ts', """import { EntityId } from '../../shared/valueobjects/EntityId';
export class CashFlowStatementId extends EntityId {}
""")

create_file('src/domain/accounting/valueobjects/CashFlowPeriod.ts', """import { ValidationError } from '../../shared/errors/ValidationError';
export class CashFlowPeriod {
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

create_file('src/domain/accounting/valueobjects/OpeningCashBalance.ts', """export class OpeningCashBalance {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/ClosingCashBalance.ts', """export class ClosingCashBalance {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/OperatingCashFlow.ts', """export class OperatingCashFlow {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/InvestingCashFlow.ts', """export class InvestingCashFlow {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/FinancingCashFlow.ts', """export class FinancingCashFlow {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/NetCashMovement.ts', """export class NetCashMovement {
    constructor(public readonly value: number) {
        Object.freeze(this);
    }
}
""")

create_file('src/domain/accounting/valueobjects/CashFlowClassification.ts', """export type CashFlowMainSection = 'OPERATING' | 'INVESTING' | 'FINANCING';
""")

# Entities
create_file('src/domain/accounting/entities/CashFlowLine.ts', """import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { AccountId } from '../valueobjects/AccountId';

export class CashFlowLine extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _accountId: AccountId | null, // null if it's a computed line like Net Income
        private readonly _description: string,
        private readonly _amount: number
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        accountId: AccountId | null,
        description: string,
        amount: number
    ): CashFlowLine {
        return new CashFlowLine(id, accountId, description, amount);
    }

    public static load(
        id: EntityId,
        accountId: AccountId | null,
        description: string,
        amount: number
    ): CashFlowLine {
        return new CashFlowLine(id, accountId, description, amount);
    }

    public get accountId(): AccountId | null { return this._accountId; }
    public get description(): string { return this._description; }
    public get amount(): number { return this._amount; }
}
""")

create_file('src/domain/accounting/entities/CashFlowSection.ts', """import { Entity } from '../../shared/core/Entity';
import { EntityId } from '../../shared/valueobjects/EntityId';
import { CashFlowMainSection } from '../valueobjects/CashFlowClassification';
import { CashFlowLine } from './CashFlowLine';

export class CashFlowSection extends Entity<EntityId> {
    private constructor(
        id: EntityId,
        private readonly _mainSection: CashFlowMainSection,
        private _lines: CashFlowLine[],
        private _total: number
    ) {
        super(id);
    }

    public static create(
        id: EntityId,
        mainSection: CashFlowMainSection,
        lines: CashFlowLine[]
    ): CashFlowSection {
        const total = lines.reduce((sum, line) => sum + line.amount, 0);
        return new CashFlowSection(id, mainSection, lines, total);
    }

    public static load(
        id: EntityId,
        mainSection: CashFlowMainSection,
        lines: CashFlowLine[],
        total: number
    ): CashFlowSection {
        return new CashFlowSection(id, mainSection, lines, total);
    }

    public get mainSection(): CashFlowMainSection { return this._mainSection; }
    public get lines(): ReadonlyArray<CashFlowLine> { return this._lines; }
    public get total(): number { return this._total; }
}
""")

# Events
create_file('src/domain/accounting/events/CashFlowEvents.ts', """import { IDomainEvent } from '../../shared/core/IDomainEvent';
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
""")

# Aggregate
create_file('src/domain/accounting/aggregates/CashFlowStatement.ts', """import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { CashFlowStatementId } from '../valueobjects/CashFlowStatementId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CashFlowPeriod } from '../valueobjects/CashFlowPeriod';
import { CashFlowSection } from '../entities/CashFlowSection';
import { OpeningCashBalance } from '../valueobjects/OpeningCashBalance';
import { ClosingCashBalance } from '../valueobjects/ClosingCashBalance';
import { OperatingCashFlow } from '../valueobjects/OperatingCashFlow';
import { InvestingCashFlow } from '../valueobjects/InvestingCashFlow';
import { FinancingCashFlow } from '../valueobjects/FinancingCashFlow';
import { NetCashMovement } from '../valueobjects/NetCashMovement';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { CashFlowGeneratedEvent, CashFlowValidatedEvent, CashFlowMismatchDetectedEvent, CashPositionChangedEvent } from '../events/CashFlowEvents';
import { BalanceSheetId } from '../valueobjects/BalanceSheetId';
import { IncomeStatementId } from '../valueobjects/IncomeStatementId';

export class CashFlowStatement extends AggregateRoot<CashFlowStatementId> {
    private constructor(
        id: CashFlowStatementId,
        private readonly _organizationId: OrganizationId,
        private readonly _startBalanceSheetId: BalanceSheetId,
        private readonly _endBalanceSheetId: BalanceSheetId,
        private readonly _incomeStatementId: IncomeStatementId,
        private readonly _period: CashFlowPeriod,
        private _sections: CashFlowSection[],
        private _openingCash: OpeningCashBalance,
        private _closingCash: ClosingCashBalance,
        private _status: 'DRAFT' | 'PUBLISHED',
        private _generatedAt: Date
    ) {
        super(id);
    }

    public static generate(
        id: CashFlowStatementId,
        organizationId: OrganizationId,
        startBalanceSheetId: BalanceSheetId,
        endBalanceSheetId: BalanceSheetId,
        incomeStatementId: IncomeStatementId,
        period: CashFlowPeriod,
        sections: CashFlowSection[],
        openingCash: OpeningCashBalance,
        closingCash: ClosingCashBalance
    ): CashFlowStatement {
        const cf = new CashFlowStatement(
            id, 
            organizationId, 
            startBalanceSheetId, 
            endBalanceSheetId, 
            incomeStatementId, 
            period, 
            sections, 
            openingCash, 
            closingCash, 
            'DRAFT', 
            new Date()
        );

        cf.validateReconciliation();

        cf.addDomainEvent(new CashFlowGeneratedEvent(organizationId, id));
        cf.addDomainEvent(new CashPositionChangedEvent(organizationId, id, cf.calculateNetMovement().value));

        return cf;
    }

    public static load(
        id: CashFlowStatementId,
        organizationId: OrganizationId,
        startBalanceSheetId: BalanceSheetId,
        endBalanceSheetId: BalanceSheetId,
        incomeStatementId: IncomeStatementId,
        period: CashFlowPeriod,
        sections: CashFlowSection[],
        openingCash: OpeningCashBalance,
        closingCash: ClosingCashBalance,
        status: 'DRAFT' | 'PUBLISHED',
        generatedAt: Date
    ): CashFlowStatement {
        return new CashFlowStatement(id, organizationId, startBalanceSheetId, endBalanceSheetId, incomeStatementId, period, sections, openingCash, closingCash, status, generatedAt);
    }

    public validateReconciliation(): void {
        const netMovement = this.calculateNetMovement().value;
        const expectedClosing = this._openingCash.value + netMovement;
        
        // Use a small epsilon to account for floating point errors if needed
        if (Math.abs(expectedClosing - this._closingCash.value) > 0.001) {
            this.addDomainEvent(new CashFlowMismatchDetectedEvent(this._organizationId, this.id, expectedClosing, this._closingCash.value));
            throw new BusinessRuleError(`Cash Flow Reconciliation Failed: Opening (${this._openingCash.value}) + Movement (${netMovement}) = Expected (${expectedClosing}), but Actual Closing is ${this._closingCash.value}`);
        }
    }

    public calculateTotals(): { operating: OperatingCashFlow, investing: InvestingCashFlow, financing: FinancingCashFlow, netMovement: NetCashMovement } {
        const operating = this.calculateSectionTotal('OPERATING');
        const investing = this.calculateSectionTotal('INVESTING');
        const financing = this.calculateSectionTotal('FINANCING');

        const netMovement = operating + investing + financing;

        return {
            operating: new OperatingCashFlow(operating),
            investing: new InvestingCashFlow(investing),
            financing: new FinancingCashFlow(financing),
            netMovement: new NetCashMovement(netMovement)
        };
    }

    private calculateSectionTotal(mainSection: string): number {
        return this._sections
            .filter(s => s.mainSection === mainSection)
            .reduce((sum, s) => sum + s.total, 0);
    }

    public calculateNetMovement(): NetCashMovement {
        return this.calculateTotals().netMovement;
    }

    public validate(): void {
        this.validateReconciliation();
        this.addDomainEvent(new CashFlowValidatedEvent(this._organizationId, this.id));
    }

    public publish(): void {
        if (this._status !== 'DRAFT') throw new BusinessRuleError('Only DRAFT statements can be published');
        this.validate();
        this._status = 'PUBLISHED';
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get startBalanceSheetId(): BalanceSheetId { return this._startBalanceSheetId; }
    public get endBalanceSheetId(): BalanceSheetId { return this._endBalanceSheetId; }
    public get incomeStatementId(): IncomeStatementId { return this._incomeStatementId; }
    public get period(): CashFlowPeriod { return this._period; }
    public get sections(): ReadonlyArray<CashFlowSection> { return this._sections; }
    public get openingCash(): OpeningCashBalance { return this._openingCash; }
    public get closingCash(): ClosingCashBalance { return this._closingCash; }
    public get status(): 'DRAFT' | 'PUBLISHED' { return this._status; }
    public get generatedAt(): Date { return this._generatedAt; }
}
""")

print("Cash Flow Domain generated")
