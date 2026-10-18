import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Repository Implementation
create_file('src/infrastructure/accounting/repositories/SupabaseBalanceSheetRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
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
""")

# Default Classification Service Implementation
create_file('src/infrastructure/accounting/services/DefaultAccountClassificationService.ts', """import { IAccountClassificationService, AccountClassification } from '../../../domain/accounting/services/IAccountClassificationService';

export class DefaultAccountClassificationService implements IAccountClassificationService {
    public classify(accountNumber: string): AccountClassification {
        const prefix = parseInt(accountNumber.substring(0, 1) || '0', 10);
        const code = parseInt(accountNumber, 10);

        if (prefix === 1) {
            // ASSETS
            if (code >= 1000 && code < 1500) return { mainSection: 'ASSETS', subSection: 'CURRENT_ASSETS', normalBalance: 'DEBIT' };
            return { mainSection: 'ASSETS', subSection: 'NON_CURRENT_ASSETS', normalBalance: 'DEBIT' };
        } 
        
        if (prefix === 2) {
            // LIABILITIES
            if (code >= 2000 && code < 2500) return { mainSection: 'LIABILITIES', subSection: 'CURRENT_LIABILITIES', normalBalance: 'CREDIT' };
            return { mainSection: 'LIABILITIES', subSection: 'LONG_TERM_LIABILITIES', normalBalance: 'CREDIT' };
        }
        
        if (prefix === 3) {
            // EQUITY
            if (code === 3100) return { mainSection: 'EQUITY', subSection: 'RETAINED_EARNINGS', normalBalance: 'CREDIT' };
            if (code === 3200) return { mainSection: 'EQUITY', subSection: 'CURRENT_PROFIT', normalBalance: 'CREDIT' };
            if (code >= 3300 && code <= 3500) return { mainSection: 'EQUITY', subSection: 'RESERVES', normalBalance: 'CREDIT' };
            return { mainSection: 'EQUITY', subSection: 'CAPITAL', normalBalance: 'CREDIT' };
        }

        // Default fallback (e.g. Income/Expenses usually are 4/5, but they close into Equity -> Current Profit)
        // Since Balance Sheet only deals with Assets, Liabilities, Equity (after closing), 
        // anything else would be an error in a real system unless it's an unclosed P&L account.
        // For simplicity, map unknown to Equity Reserves
        return { mainSection: 'EQUITY', subSection: 'RESERVES', normalBalance: 'CREDIT' };
    }
}
""")

print("Balance Sheet Infra generated")
