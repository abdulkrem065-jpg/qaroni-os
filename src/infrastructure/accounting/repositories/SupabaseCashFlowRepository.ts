import { SupabaseClient } from '@supabase/supabase-js';
import { ICashFlowRepository } from '../../../domain/accounting/repositories/ICashFlowRepository';
import { CashFlowStatement } from '../../../domain/accounting/aggregates/CashFlowStatement';
import { CashFlowStatementId } from '../../../domain/accounting/valueobjects/CashFlowStatementId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { CashFlowPeriod } from '../../../domain/accounting/valueobjects/CashFlowPeriod';
import { CashFlowSection } from '../../../domain/accounting/entities/CashFlowSection';
import { CashFlowLine } from '../../../domain/accounting/entities/CashFlowLine';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { BalanceSheetId } from '../../../domain/accounting/valueobjects/BalanceSheetId';
import { IncomeStatementId } from '../../../domain/accounting/valueobjects/IncomeStatementId';
import { OpeningCashBalance } from '../../../domain/accounting/valueobjects/OpeningCashBalance';
import { ClosingCashBalance } from '../../../domain/accounting/valueobjects/ClosingCashBalance';
import { CashFlowMainSection } from '../../../domain/accounting/valueobjects/CashFlowClassification';

export class SupabaseCashFlowRepository implements ICashFlowRepository {
    private readonly table = 'accounting_cash_flows';

    constructor(private readonly supabase: SupabaseClient) {}

    public async save(cf: CashFlowStatement): Promise<void> {
        const data = this.toPersistence(cf);
        
        const { error } = await this.supabase
            .from(this.table)
            .upsert(data, { onConflict: 'id, organization_id' });

        if (error) {
            throw new Error(`Failed to save cash flow statement: ${error.message}`);
        }
    }

    public async findById(id: CashFlowStatementId, organizationId: OrganizationId): Promise<CashFlowStatement | null> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.toDomain(data);
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<CashFlowStatement[]> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('organization_id', organizationId.value)
            .order('generated_at', { ascending: false });

        if (error || !data) return [];
        return data.map(row => this.toDomain(row));
    }

    private toPersistence(cf: CashFlowStatement): any {
        return {
            id: cf.id.value,
            organization_id: cf.organizationId.value,
            start_balance_sheet_id: cf.startBalanceSheetId.value,
            end_balance_sheet_id: cf.endBalanceSheetId.value,
            income_statement_id: cf.incomeStatementId.value,
            start_date: cf.period.startDate.toISOString(),
            end_date: cf.period.endDate.toISOString(),
            status: cf.status,
            generated_at: cf.generatedAt.toISOString(),
            opening_cash: cf.openingCash.value,
            closing_cash: cf.closingCash.value,
            sections: cf.sections.map(s => ({
                id: s.id.value,
                main_section: s.mainSection,
                total: s.total,
                lines: s.lines.map(l => ({
                    id: l.id.value,
                    account_id: l.accountId ? l.accountId.value : null,
                    description: l.description,
                    amount: l.amount
                }))
            }))
        };
    }

    private toDomain(row: any): CashFlowStatement {
        const period = new CashFlowPeriod(
            new Date(row.start_date),
            new Date(row.end_date)
        );

        const sections = (row.sections || []).map((secRow: any) => {
            const lines = (secRow.lines || []).map((lRow: any) => 
                CashFlowLine.load(
                    new EntityId(lRow.id),
                    lRow.account_id ? new AccountId(lRow.account_id) : null,
                    lRow.description,
                    lRow.amount
                )
            );

            return CashFlowSection.load(
                new EntityId(secRow.id),
                secRow.main_section as CashFlowMainSection,
                lines,
                secRow.total
            );
        });

        return CashFlowStatement.load(
            new CashFlowStatementId(row.id),
            new OrganizationId(row.organization_id),
            new BalanceSheetId(row.start_balance_sheet_id),
            new BalanceSheetId(row.end_balance_sheet_id),
            new IncomeStatementId(row.income_statement_id),
            period,
            sections,
            new OpeningCashBalance(row.opening_cash),
            new ClosingCashBalance(row.closing_cash),
            row.status,
            new Date(row.generated_at)
        );
    }
}
