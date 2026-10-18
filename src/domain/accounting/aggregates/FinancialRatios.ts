import { AggregateRoot } from '../../shared/core/AggregateRoot';
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
