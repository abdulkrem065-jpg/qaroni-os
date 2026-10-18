import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { EquityStatementId } from '../valueobjects/EquityStatementId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { EquityStatementPeriod } from '../valueobjects/EquityStatementPeriod';
import { EquityStatementLine } from '../entities/EquityStatementLine';
import { BusinessRuleError } from '../../shared/errors/BusinessRuleError';
import { IncomeStatementId } from '../valueobjects/IncomeStatementId';
import { IDomainEvent } from '../../shared/core/IDomainEvent';

export class EquityStatementGeneratedEvent implements IDomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName = 'EquityStatementGeneratedEvent';
    constructor(
        public readonly organizationId: OrganizationId,
        public readonly equityStatementId: EquityStatementId
    ) {
        this.occurredOn = new Date();
    }
}

export class EquityStatement extends AggregateRoot<EquityStatementId> {
    private constructor(
        id: EquityStatementId,
        private readonly _organizationId: OrganizationId,
        private readonly _incomeStatementId: IncomeStatementId,
        private readonly _period: EquityStatementPeriod,
        private _lines: EquityStatementLine[],
        private _openingBalance: number,
        private _closingBalance: number,
        private _status: 'DRAFT' | 'PUBLISHED',
        private _generatedAt: Date
    ) {
        super(id);
    }

    public static generate(
        id: EquityStatementId,
        organizationId: OrganizationId,
        incomeStatementId: IncomeStatementId,
        period: EquityStatementPeriod,
        lines: EquityStatementLine[],
        openingBalance: number,
        closingBalance: number
    ): EquityStatement {
        const statement = new EquityStatement(
            id,
            organizationId,
            incomeStatementId,
            period,
            lines,
            openingBalance,
            closingBalance,
            'DRAFT',
            new Date()
        );
        statement.validateReconciliation();
        statement.addDomainEvent(new EquityStatementGeneratedEvent(organizationId, id));
        return statement;
    }

    public validateReconciliation(): void {
        const netMovement = this._lines.reduce((sum, line) => sum + line.amount, 0);
        const expectedClosing = this._openingBalance + netMovement;
        
        if (Math.abs(expectedClosing - this._closingBalance) > 0.001) {
            throw new BusinessRuleError(`Equity Statement Reconciliation Failed: Opening (${this._openingBalance}) + Movement (${netMovement}) = Expected (${expectedClosing}), but Actual Closing is ${this._closingBalance}`);
        }
    }

    public publish(): void {
        if (this._status !== 'DRAFT') throw new BusinessRuleError('Only DRAFT statements can be published');
        this.validateReconciliation();
        this._status = 'PUBLISHED';
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get incomeStatementId(): IncomeStatementId { return this._incomeStatementId; }
    public get period(): EquityStatementPeriod { return this._period; }
    public get lines(): ReadonlyArray<EquityStatementLine> { return this._lines; }
    public get openingBalance(): number { return this._openingBalance; }
    public get closingBalance(): number { return this._closingBalance; }
    public get status(): 'DRAFT' | 'PUBLISHED' { return this._status; }
    public get generatedAt(): Date { return this._generatedAt; }
}
