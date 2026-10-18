import { IFinancialRatiosRepository } from '../../../application/accounting/ports/IFinancialRatiosRepository';
import { FinancialRatios } from '../../../domain/accounting/aggregates/FinancialRatios';
import { FinancialRatiosId } from '../../../domain/accounting/valueobjects/FinancialRatiosId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { BalanceSheetId } from '../../../domain/accounting/valueobjects/BalanceSheetId';
import { IncomeStatementId } from '../../../domain/accounting/valueobjects/IncomeStatementId';
import { CashFlowStatementId } from '../../../domain/accounting/valueobjects/CashFlowStatementId';
import { RatioResult } from '../../../domain/accounting/entities/RatioResult';
import { RatioId } from '../../../domain/accounting/valueobjects/RatioId';
import { RatioName } from '../../../domain/accounting/valueobjects/RatioName';
import { RatioValue } from '../../../domain/accounting/valueobjects/RatioValue';
import { RatioBenchmark } from '../../../domain/accounting/valueobjects/RatioBenchmark';
import { RatioStatus } from '../../../domain/accounting/valueobjects/RatioStatus';
import { RatioCategory } from '../../../domain/accounting/valueobjects/RatioCategory';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseFinancialRatiosRepository implements IFinancialRatiosRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    public async save(ratios: FinancialRatios): Promise<void> {
        const { error: rError } = await this.supabase
            .from('accounting_financial_ratios')
            .upsert({
                id: ratios.id.value,
                organization_id: ratios.organizationId.value,
                balance_sheet_id: ratios.balanceSheetId.value,
                income_statement_id: ratios.incomeStatementId.value,
                cash_flow_statement_id: ratios.cashFlowStatementId?.value || null,
                period_end_date: ratios.periodEndDate.toISOString(),
                status: ratios.status,
                generated_at: ratios.generatedAt.toISOString()
            });
        
        if (rError) throw new Error(`Failed to save Financial Ratios: ${rError.message}`);

        // Save Results
        const resultsData = ratios.results.map(r => ({
            id: r.id.value,
            financial_ratios_id: ratios.id.value,
            category: r.category,
            name: r.name.value,
            value: r.value.value,
            benchmark: r.benchmark.value,
            status: r.status
        }));

        const { error: lError } = await this.supabase
            .from('accounting_ratio_results')
            .upsert(resultsData);

        if (lError) throw new Error(`Failed to save Ratio Results: ${lError.message}`);
    }

    public async findById(organizationId: OrganizationId, id: FinancialRatiosId): Promise<FinancialRatios | null> {
        const { data, error } = await this.supabase
            .from('accounting_financial_ratios')
            .select(`
                *,
                results:accounting_ratio_results(*)
            `)
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.toDomain(data);
    }

    public async findByOrganizationId(organizationId: OrganizationId): Promise<FinancialRatios[]> {
        const { data, error } = await this.supabase
            .from('accounting_financial_ratios')
            .select(`
                *,
                results:accounting_ratio_results(*)
            `)
            .eq('organization_id', organizationId.value);

        if (error || !data) return [];
        return data.map(d => this.toDomain(d));
    }

    private toDomain(data: any): FinancialRatios {
        const results = data.results.map((r: any) => RatioResult.load(
            new RatioId(r.id),
            r.category as RatioCategory,
            new RatioName(r.name),
            new RatioValue(r.value),
            new RatioBenchmark(r.benchmark),
            r.status as RatioStatus
        ));

        return FinancialRatios.load(
            new FinancialRatiosId(data.id),
            new OrganizationId(data.organization_id),
            new BalanceSheetId(data.balance_sheet_id),
            new IncomeStatementId(data.income_statement_id),
            data.cash_flow_statement_id ? new CashFlowStatementId(data.cash_flow_statement_id) : null,
            new Date(data.period_end_date),
            results,
            data.status,
            new Date(data.generated_at)
        );
    }
}
