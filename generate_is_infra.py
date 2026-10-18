import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Repository Implementation
create_file('src/infrastructure/accounting/repositories/SupabaseIncomeStatementRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
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
""")

# Default Classification Service Implementation
create_file('src/infrastructure/accounting/services/DefaultIncomeStatementClassificationService.ts', """import { IIncomeStatementClassificationService, IncomeClassification } from '../../../domain/accounting/services/IIncomeStatementClassificationService';

export class DefaultIncomeStatementClassificationService implements IIncomeStatementClassificationService {
    public classify(accountNumber: string): IncomeClassification | null {
        const prefix = parseInt(accountNumber.substring(0, 1) || '0', 10);
        const code = parseInt(accountNumber, 10);

        // Standard Chart of Accounts (COA) assumption:
        // 4xxx: Revenue
        // 5xxx: Cost of Goods Sold (COGS)
        // 6xxx: Operating Expenses
        // 7xxx: Financial Expenses / Other Expenses
        // 8xxx: Taxes / Extraordinary

        if (prefix === 4) {
            // REVENUE
            if (code === 4100) return { mainSection: 'REVENUE', subSection: 'SALES_REVENUE', normalBalance: 'CREDIT' };
            if (code === 4200) return { mainSection: 'REVENUE', subSection: 'SERVICE_REVENUE', normalBalance: 'CREDIT' };
            if (code >= 4300 && code < 4500) return { mainSection: 'REVENUE', subSection: 'OTHER_OPERATING_REVENUE', normalBalance: 'CREDIT' };
            return { mainSection: 'REVENUE', subSection: 'NON_OPERATING_REVENUE', normalBalance: 'CREDIT' };
        } 
        
        if (prefix === 5) {
            // COGS
            if (code === 5100) return { mainSection: 'COGS', subSection: 'INVENTORY_COST', normalBalance: 'DEBIT' };
            if (code === 5200) return { mainSection: 'COGS', subSection: 'PURCHASE_COST', normalBalance: 'DEBIT' };
            return { mainSection: 'COGS', subSection: 'DIRECT_COST', normalBalance: 'DEBIT' };
        }
        
        if (prefix === 6) {
            // OPERATING EXPENSES & DEPRECIATION
            if (code === 6100) return { mainSection: 'OPERATING_EXPENSES', subSection: 'PAYROLL', normalBalance: 'DEBIT' };
            if (code === 6200) return { mainSection: 'OPERATING_EXPENSES', subSection: 'RENT', normalBalance: 'DEBIT' };
            if (code === 6300) return { mainSection: 'OPERATING_EXPENSES', subSection: 'UTILITIES', normalBalance: 'DEBIT' };
            if (code === 6400) return { mainSection: 'OPERATING_EXPENSES', subSection: 'MARKETING_EXPENSES', normalBalance: 'DEBIT' };
            if (code === 6500) return { mainSection: 'OPERATING_EXPENSES', subSection: 'SELLING_EXPENSES', normalBalance: 'DEBIT' };
            
            // Depreciation is often in 6xxx but we classify it as its own main section as per requirements
            if (code === 6800) return { mainSection: 'DEPRECIATION', subSection: 'FIXED_ASSETS_DEPRECIATION', normalBalance: 'DEBIT' };
            if (code === 6850) return { mainSection: 'DEPRECIATION', subSection: 'INTANGIBLE_ASSETS_DEPRECIATION', normalBalance: 'DEBIT' };

            return { mainSection: 'OPERATING_EXPENSES', subSection: 'ADMINISTRATIVE_EXPENSES', normalBalance: 'DEBIT' };
        }

        if (prefix === 7) {
            // FINANCIAL EXPENSES
            if (code === 7100) return { mainSection: 'FINANCIAL_EXPENSES', subSection: 'INTEREST', normalBalance: 'DEBIT' };
            return { mainSection: 'FINANCIAL_EXPENSES', subSection: 'BANKING_CHARGES', normalBalance: 'DEBIT' };
        }

        if (prefix === 8) {
            // TAXES
            return { mainSection: 'TAXES', subSection: 'TAX_PROVISION', normalBalance: 'DEBIT' };
        }

        // Return null for Balance Sheet accounts (1xxx, 2xxx, 3xxx)
        return null;
    }
}
""")

print("Income Statement Infra generated")
