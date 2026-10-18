import { TrialBalanceUseCases } from '../usecases/TrialBalanceUseCases';
import { IncomeStatementUseCases } from '../usecases/IncomeStatementUseCases';
import { BalanceSheetUseCases } from '../usecases/BalanceSheetUseCases';
import { CashFlowUseCases } from '../usecases/CashFlowUseCases';
import { EquityStatementUseCases } from '../usecases/EquityStatementUseCases';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';

export interface BuildFinancialStatementsRequest {
    organizationId: string;
    periodId: string;
    startDate: string;
    endDate: string;
    // Parameters for specific statements
    openingCashBalance: number;
    closingCashBalance: number;
    openingEquityBalance: number;
    dividends: number;
    capitalContributions: number;
    priorPeriodAdjustments: number;
}

export interface FinancialStatementsBundle {
    trialBalanceId: string;
    incomeStatementId: string;
    balanceSheetId: string;
    cashFlowStatementId: string;
    equityStatementId: string;
}

/**
 * Coordinates the generation of all financial statements in the correct order.
 * Order: 
 * 1. Trial Balance (Foundation)
 * 2. Income Statement (Requires Trial Balance)
 * 3. Equity Statement (Requires Income Statement for Net Income)
 * 4. Balance Sheet (Requires Trial Balance, incorporates Retained Earnings implicitly)
 * 5. Cash Flow Statement (Requires Opening/Closing Balance Sheets and Income Statement)
 */
export class FinancialStatementBuilder {
    constructor(
        private readonly tbUseCases: TrialBalanceUseCases,
        private readonly isUseCases: IncomeStatementUseCases,
        private readonly bsUseCases: BalanceSheetUseCases,
        private readonly cfUseCases: CashFlowUseCases,
        private readonly eqUseCases: EquityStatementUseCases
    ) {}

    public async buildBundle(req: BuildFinancialStatementsRequest): Promise<FinancialStatementsBundle> {
        // 1. Generate Trial Balance
        const tb = await this.tbUseCases.generateTrialBalance({
            organizationId: req.organizationId,
            periodType: 'CUSTOM', // Or pass it via req
            startDate: req.startDate,
            endDate: req.endDate
        });

        // 2. Generate Income Statement
        const is = await this.isUseCases.generateIncomeStatement({
            organizationId: req.organizationId,
            trialBalanceId: tb.id
        });

        // 3. Generate Equity Statement
        const eq = await this.eqUseCases.generateEquityStatement({
            organizationId: req.organizationId,
            incomeStatementId: is.id,
            startDate: req.startDate,
            endDate: req.endDate,
            openingBalance: req.openingEquityBalance,
            dividends: req.dividends,
            capitalContributions: req.capitalContributions,
            priorPeriodAdjustments: req.priorPeriodAdjustments
        });

        // 4. Generate Balance Sheet
        const bs = await this.bsUseCases.generateBalanceSheet({
            organizationId: req.organizationId,
            trialBalanceId: tb.id
        });

        // 5. Generate Cash Flow Statement
        const cf = await this.cfUseCases.generateCashFlow({
            organizationId: req.organizationId,
            startBalanceSheetId: bs.id, 
            endBalanceSheetId: bs.id,
            incomeStatementId: is.id,
            sections: []
        });

        return {
            trialBalanceId: tb.id,
            incomeStatementId: is.id,
            balanceSheetId: bs.id,
            cashFlowStatementId: cf.id,
            equityStatementId: eq.id
        };
    }
}
