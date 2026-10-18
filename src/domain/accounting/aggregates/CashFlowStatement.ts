import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
