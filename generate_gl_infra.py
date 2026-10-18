import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

create_file('src/infrastructure/accounting/repositories/SupabaseLedgerEntryRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
import { ILedgerEntryRepository } from '../../../domain/accounting/repositories/ILedgerEntryRepository';
import { LedgerEntry } from '../../../domain/accounting/aggregates/LedgerEntry';

export class SupabaseLedgerEntryRepository implements ILedgerEntryRepository {
    private readonly table = 'accounting_ledger_entries';

    constructor(private readonly supabase: SupabaseClient) {}

    public async save(entry: LedgerEntry): Promise<void> {
        await this.saveBulk([entry]);
    }

    public async saveBulk(entries: LedgerEntry[]): Promise<void> {
        if (entries.length === 0) return;

        const data = entries.map(e => ({
            id: e.id.value,
            organization_id: e.organizationId.value,
            account_id: e.accountId.value,
            posting_batch_id: e.postingBatchId.value,
            journal_id: e.journalId.value,
            journal_line_id: e.journalLineId.value,
            accounting_date: e.accountingDate.toISOString(),
            debit: e.debit.value,
            credit: e.credit.value,
            currency_id: e.currencyId
        }));

        const { error } = await this.supabase
            .from(this.table)
            .insert(data);

        if (error) {
            throw new Error(`Failed to save ledger entries: ${error.message}`);
        }
    }
}
""")

create_file('src/infrastructure/accounting/repositories/SupabaseLedgerBalanceRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
import { ILedgerBalanceRepository } from '../../../domain/accounting/repositories/ILedgerBalanceRepository';
import { LedgerBalance } from '../../../domain/accounting/aggregates/LedgerBalance';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { LedgerPeriod } from '../../../domain/accounting/valueobjects/LedgerPeriod';
import { LedgerBalanceId } from '../../../domain/accounting/valueobjects/LedgerBalanceId';
import { DebitAmount } from '../../../domain/accounting/valueobjects/DebitAmount';
import { CreditAmount } from '../../../domain/accounting/valueobjects/CreditAmount';

export class SupabaseLedgerBalanceRepository implements ILedgerBalanceRepository {
    private readonly table = 'accounting_ledger_balances';

    constructor(private readonly supabase: SupabaseClient) {}

    public async save(balance: LedgerBalance): Promise<void> {
        const data = {
            id: balance.id.value,
            organization_id: balance.organizationId.value,
            account_id: balance.accountId.value,
            period: balance.period.value,
            total_debit: balance.totalDebit.value,
            total_credit: balance.totalCredit.value,
            currency_id: balance.currencyId
        };

        const { error } = await this.supabase
            .from(this.table)
            .upsert(data, { onConflict: 'organization_id, account_id, period' });

        if (error) {
            throw new Error(`Failed to save ledger balance: ${error.message}`);
        }
    }

    public async findByAccountAndPeriod(
        organizationId: OrganizationId,
        accountId: AccountId,
        period: LedgerPeriod
    ): Promise<LedgerBalance | null> {
        const { data, error } = await this.supabase
            .from(this.table)
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('account_id', accountId.value)
            .eq('period', period.value)
            .single();

        if (error || !data) return null;

        return LedgerBalance.load(
            new LedgerBalanceId(data.id),
            new OrganizationId(data.organization_id),
            new AccountId(data.account_id),
            new LedgerPeriod(data.period),
            new DebitAmount(data.total_debit),
            new CreditAmount(data.total_credit),
            data.currency_id
        );
    }
}
""")

print("General Ledger Infrastructure logic created")
