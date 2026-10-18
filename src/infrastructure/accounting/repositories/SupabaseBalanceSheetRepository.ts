import { SupabaseClient } from '@supabase/supabase-js';
import { IBalanceSheetRepository } from '../../../domain/accounting/repositories/IBalanceSheetRepository';
import { BalanceSheet } from '../../../domain/accounting/aggregates/BalanceSheet';
import { BalanceSheetId } from '../../../domain/accounting/valueobjects/BalanceSheetId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { BalanceSheetPeriod } from '../../../domain/accounting/valueobjects/BalanceSheetPeriod';
import { BalanceSheetStatus } from '../../../domain/accounting/valueobjects/BalanceSheetStatus';
import { BalanceSheetSection } from '../../../domain/accounting/entities/BalanceSheetSection';
import { BalanceSheetLine } from '../../../domain/accounting/entities/BalanceSheetLine';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { TrialBalanceId } from '../../../domain/accounting/valueobjects/TrialBalanceId';
import { BalanceSheetMainSection, BalanceSheetSubSection } from '../../../domain/accounting/valueobjects/BalanceSheetClassification';

export class SupabaseBalanceSheetRepository implements IBalanceSheetRepository {
    private readonly table = 'accounting_balance_sheets';

    constructor(private readonly supabase: SupabaseClient) {}

    public async save(balanceSheet: BalanceSheet): Promise<void> {
        const data = this.toPersistence(balanceSheet);
        
        const { error } = await this.supabase
            .from(this.table)
            .upsert(data, { onConflict: 'id, organization_id' });

        if (error) {
            throw new Error(`Failed to save balance sheet: ${error.message}`);
        }
    }

    public async findById(id: BalanceSheetId, organizationId: OrganizationId): Promise<BalanceSheet | null> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.toDomain(data);
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<BalanceSheet[]> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('organization_id', organizationId.value)
            .order('generated_at', { ascending: false });

        if (error || !data) return [];
        return data.map(row => this.toDomain(row));
    }

    private toPersistence(bs: BalanceSheet): any {
        return {
            id: bs.id.value,
            organization_id: bs.organizationId.value,
            trial_balance_id: bs.trialBalanceId.value,
            start_date: bs.period.startDate.toISOString(),
            end_date: bs.period.endDate.toISOString(),
            status: bs.status.value,
            generated_at: bs.generatedAt.toISOString(),
            sections: bs.sections.map(s => ({
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

    private toDomain(row: any): BalanceSheet {
        const period = new BalanceSheetPeriod(
            new Date(row.start_date),
            new Date(row.end_date)
        );

        const sections = (row.sections || []).map((secRow: any) => {
            const lines = (secRow.lines || []).map((lRow: any) => 
                BalanceSheetLine.load(
                    new EntityId(lRow.id),
                    new AccountId(lRow.account_id),
                    lRow.account_number,
                    lRow.account_name,
                    lRow.amount
                )
            );

            return BalanceSheetSection.load(
                new EntityId(secRow.id),
                secRow.main_section as BalanceSheetMainSection,
                secRow.sub_section as BalanceSheetSubSection,
                lines,
                secRow.total
            );
        });

        return BalanceSheet.load(
            new BalanceSheetId(row.id),
            new OrganizationId(row.organization_id),
            new TrialBalanceId(row.trial_balance_id),
            period,
            new BalanceSheetStatus(row.status),
            sections,
            new Date(row.generated_at)
        );
    }
}
