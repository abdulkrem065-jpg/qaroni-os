import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# Repository Implementation
create_file('src/infrastructure/accounting/repositories/SupabaseTrialBalanceRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
import { ITrialBalanceRepository } from '../../../domain/accounting/repositories/ITrialBalanceRepository';
import { TrialBalance } from '../../../domain/accounting/aggregates/TrialBalance';
import { TrialBalanceId } from '../../../domain/accounting/valueobjects/TrialBalanceId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { TrialBalancePeriod } from '../../../domain/accounting/valueobjects/TrialBalancePeriod';
import { TrialBalancePeriodType } from '../../../domain/accounting/valueobjects/TrialBalancePeriodType';
import { TrialBalanceAccount } from '../../../domain/accounting/entities/TrialBalanceAccount';
import { EntityId } from '../../../domain/shared/valueobjects/EntityId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';

export class SupabaseTrialBalanceRepository implements ITrialBalanceRepository {
    private readonly table = 'accounting_trial_balances';

    constructor(private readonly supabase: SupabaseClient) {}

    public async save(trialBalance: TrialBalance): Promise<void> {
        const data = this.toPersistence(trialBalance);
        
        const { error } = await this.supabase
            .from(this.table)
            .upsert(data, { onConflict: 'id, organization_id' });

        if (error) {
            throw new Error(`Failed to save trial balance: ${error.message}`);
        }
    }

    public async findById(id: TrialBalanceId, organizationId: OrganizationId): Promise<TrialBalance | null> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.toDomain(data);
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<TrialBalance[]> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('organization_id', organizationId.value)
            .order('generated_at', { ascending: false });

        if (error || !data) return [];
        return data.map(row => this.toDomain(row));
    }

    private toPersistence(tb: TrialBalance): any {
        return {
            id: tb.id.value,
            organization_id: tb.organizationId.value,
            period_type: tb.period.type.value,
            start_date: tb.period.startDate.toISOString(),
            end_date: tb.period.endDate.toISOString(),
            generated_at: tb.generatedAt.toISOString(),
            accounts: tb.accounts.map(acc => ({
                id: acc.id.value,
                account_id: acc.accountId.value,
                account_number: acc.accountNumber,
                account_name: acc.accountName,
                debit: acc.balance.debit.value,
                credit: acc.balance.credit.value
            }))
        };
    }

    private toDomain(row: any): TrialBalance {
        const period = new TrialBalancePeriod(
            new TrialBalancePeriodType(row.period_type),
            new Date(row.start_date),
            new Date(row.end_date)
        );

        const accounts = (row.accounts || []).map((accRow: any) => 
            TrialBalanceAccount.load(
                new EntityId(accRow.id),
                new AccountId(accRow.account_id),
                accRow.debit,
                accRow.credit,
                accRow.account_number,
                accRow.account_name
            )
        );

        return TrialBalance.load(
            new TrialBalanceId(row.id),
            new OrganizationId(row.organization_id),
            period,
            accounts,
            new Date(row.generated_at)
        );
    }
}
""")

# Ledger Query Implementation
create_file('src/infrastructure/accounting/repositories/SupabaseLedgerEntryQuery.ts', """import { SupabaseClient } from '@supabase/supabase-js';
import { ILedgerEntryQuery, LedgerAccountBalance } from '../../../domain/accounting/repositories/ILedgerEntryQuery';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';

export class SupabaseLedgerEntryQuery implements ILedgerEntryQuery {
    constructor(private readonly supabase: SupabaseClient) {}

    public async calculateBalancesByDateRange(organizationId: OrganizationId, startDate: Date, endDate: Date): Promise<LedgerAccountBalance[]> {
        // Query only from the ledger, joining with accounts to get number and name
        // We aggregate the debits and credits
        const { data, error } = await this.supabase
            .from('accounting_ledger_entries')
            .select(`
                account_id,
                debit,
                credit,
                accounting_accounts (
                    code,
                    name
                )
            `)
            .eq('organization_id', organizationId.value)
            .gte('accounting_date', startDate.toISOString())
            .lte('accounting_date', endDate.toISOString());

        if (error) {
            throw new Error(`Failed to calculate ledger balances: ${error.message}`);
        }

        const balanceMap = new Map<string, LedgerAccountBalance>();

        for (const row of data || []) {
            const accId = row.account_id;
            const accData = row.accounting_accounts as any; // Due to join
            if (!accData) continue;

            if (!balanceMap.has(accId)) {
                balanceMap.set(accId, {
                    accountId: accId,
                    accountNumber: accData.code,
                    accountName: accData.name,
                    totalDebit: 0,
                    totalCredit: 0
                });
            }

            const bal = balanceMap.get(accId)!;
            bal.totalDebit += row.debit || 0;
            bal.totalCredit += row.credit || 0;
        }

        // Return only accounts with non-zero balances
        return Array.from(balanceMap.values()).filter(b => b.totalDebit !== 0 || b.totalCredit !== 0);
    }
}
""")

print("Trial Balance Infra generated")
