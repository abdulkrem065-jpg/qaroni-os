import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
