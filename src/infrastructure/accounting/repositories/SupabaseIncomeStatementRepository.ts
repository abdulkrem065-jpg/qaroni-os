import { SupabaseClient } from '@supabase/supabase-js';
import { IIncomeStatementRepository } from '../../../domain/accounting/repositories/IIncomeStatementRepository';
import { IncomeStatement } from '../../../domain/accounting/aggregates/IncomeStatement';
import { IncomeStatementId } from '../../../domain/accounting/valueobjects/IncomeStatementId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { IncomeStatementPeriod } from '../../../domain/accounting/valueobjects/IncomeStatementPeriod';
import { IncomeStatementSection } from '../../../domain/accounting/entities/IncomeStatementSection';
import { IncomeStatementLine } from '../../../domain/accounting/entities/IncomeStatementLine';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { TrialBalanceId } from '../../../domain/accounting/valueobjects/TrialBalanceId';
import { IncomeStatementMainSection, IncomeStatementSubSection } from '../../../domain/accounting/valueobjects/IncomeStatementClassification';

export class SupabaseIncomeStatementRepository implements IIncomeStatementRepository {
    private readonly table = 'accounting_income_statements';

    constructor(private readonly supabase: SupabaseClient) {}

    public async save(is: IncomeStatement): Promise<void> {
        const data = this.toPersistence(is);
        
        const { error } = await this.supabase
            .from(this.table)
            .upsert(data, { onConflict: 'id, organization_id' });

        if (error) {
            throw new Error(`Failed to save income statement: ${error.message}`);
        }
    }

    public async findById(id: IncomeStatementId, organizationId: OrganizationId): Promise<IncomeStatement | null> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.toDomain(data);
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<IncomeStatement[]> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('organization_id', organizationId.value)
            .order('generated_at', { ascending: false });

        if (error || !data) return [];
        return data.map(row => this.toDomain(row));
    }

    private toPersistence(is: IncomeStatement): any {
        return {
            id: is.id.value,
            organization_id: is.organizationId.value,
            trial_balance_id: is.trialBalanceId.value,
            start_date: is.period.startDate.toISOString(),
            end_date: is.period.endDate.toISOString(),
            status: is.status,
            generated_at: is.generatedAt.toISOString(),
            sections: is.sections.map(s => ({
                id: s.id.value,
                main_section: s.mainSection,
                sub_section: s.subSection,
                total: s.total,
                lines: s.lines.map(l => ({
                    id: l.id.value,
                    account_id: l.accountId.value,
                    account_number: l.accountNumber,
                    account_name: l.accountName,
                    amount: l.amount
                }))
            }))
        };
    }

    private toDomain(row: any): IncomeStatement {
        const period = new IncomeStatementPeriod(
            new Date(row.start_date),
            new Date(row.end_date)
        );

        const sections = (row.sections || []).map((secRow: any) => {
            const lines = (secRow.lines || []).map((lRow: any) => 
                IncomeStatementLine.load(
                    new EntityId(lRow.id),
                    new AccountId(lRow.account_id),
                    lRow.account_number,
                    lRow.account_name,
                    lRow.amount
                )
            );

            return IncomeStatementSection.load(
                new EntityId(secRow.id),
                secRow.main_section as IncomeStatementMainSection,
                secRow.sub_section as IncomeStatementSubSection,
                lines,
                secRow.total
            );
        });

        return IncomeStatement.load(
            new IncomeStatementId(row.id),
            new OrganizationId(row.organization_id),
            new TrialBalanceId(row.trial_balance_id),
            period,
            sections,
            row.status,
            new Date(row.generated_at)
        );
    }
}
