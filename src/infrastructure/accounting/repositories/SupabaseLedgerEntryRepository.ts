import { SupabaseClient } from '@supabase/supabase-js';
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
