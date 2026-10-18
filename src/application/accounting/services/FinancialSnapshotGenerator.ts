import * as crypto from 'crypto';
import { FinancialStatementBuilder, BuildFinancialStatementsRequest, FinancialStatementsBundle } from './FinancialStatementBuilder';
import { TrialBalanceUseCases } from '../usecases/TrialBalanceUseCases';
import { IncomeStatementUseCases } from '../usecases/IncomeStatementUseCases';
import { BalanceSheetUseCases } from '../usecases/BalanceSheetUseCases';
import { CashFlowUseCases } from '../usecases/CashFlowUseCases';
import { EquityStatementUseCases } from '../usecases/EquityStatementUseCases';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';

export interface FinancialSnapshot {
    snapshotId: string;
    organizationId: string;
    generatedAt: string;
    bundleIds: FinancialStatementsBundle;
    data: {
        trialBalance: any;
        incomeStatement: any;
        balanceSheet: any;
        cashFlowStatement: any;
        equityStatement: any;
    };
}

export class FinancialSnapshotGenerator {
    constructor(
        private readonly builder: FinancialStatementBuilder,
        private readonly tbUseCases: TrialBalanceUseCases,
        private readonly isUseCases: IncomeStatementUseCases,
        private readonly bsUseCases: BalanceSheetUseCases,
        private readonly cfUseCases: CashFlowUseCases,
        private readonly eqUseCases: EquityStatementUseCases
    ) {}

    public async generateSnapshot(req: BuildFinancialStatementsRequest): Promise<FinancialSnapshot> {
        // Build the statements bundle
        const bundle = await this.builder.buildBundle(req);

        // Fetch DTOs for snapshotting
        const tb = await this.tbUseCases.getTrialBalance(req.organizationId, bundle.trialBalanceId);
        const is = await this.isUseCases.getIncomeStatement(req.organizationId, bundle.incomeStatementId);
        const bs = await this.bsUseCases.getBalanceSheet(req.organizationId, bundle.balanceSheetId);
        const cf = await this.cfUseCases.getCashFlow(req.organizationId, bundle.cashFlowStatementId);
        const eq = await this.eqUseCases.getEquityStatement(req.organizationId, bundle.equityStatementId);

        // In a real system, you'd persist this snapshot as a single document/record for point-in-time auditing.
        return {
            snapshotId: crypto.randomUUID(),
            organizationId: req.organizationId,
            generatedAt: new Date().toISOString(),
            bundleIds: bundle,
            data: {
                trialBalance: tb,
                incomeStatement: is,
                balanceSheet: bs,
                cashFlowStatement: cf,
                equityStatement: eq
            }
        };
    }
}
