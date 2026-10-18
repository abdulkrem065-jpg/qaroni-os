import { SupabaseClient } from '@supabase/supabase-js';
import { IJournalLineRepository } from '../../../domain/accounting/repositories/IJournalLineRepository';
import { JournalLine } from '../../../domain/accounting/entities/JournalLine';
import { JournalId } from '../../../domain/accounting/valueobjects/JournalId';
import { JournalLineId } from '../../../domain/accounting/valueobjects/JournalLineId';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { JournalDescription } from '../../../domain/accounting/valueobjects/JournalDescription';
import { DebitAmount } from '../../../domain/accounting/valueobjects/DebitAmount';
import { CreditAmount } from '../../../domain/accounting/valueobjects/CreditAmount';

export class SupabaseJournalLineRepository implements IJournalLineRepository {
    private readonly tableName = 'accounting_journal_lines';

    constructor(private readonly supabase: SupabaseClient) {}

    public async saveMany(journalId: JournalId, lines: JournalLine[]): Promise<void> {
        if (lines.length === 0) return;
        
        const data = lines.map(line => ({
            id: line.id.value,
            journal_id: journalId.value,
            account_id: line.accountId.value,
            description: line.description.value,
            debit: line.debit.value,
            credit: line.credit.value,
            currency_id: line.currencyId,
            cost_center_id: line.costCenterId || null,
            branch_id: line.branchId || null,
            customer_id: line.customerId || null,
            supplier_id: line.supplierId || null,
            updated_at: new Date().toISOString()
        }));

        const { error } = await this.supabase
            .from(this.tableName)
            .upsert(data, { onConflict: 'id' });

        if (error) {
            throw new Error(`Failed to save journal lines: ${error.message}`);
        }
    }

    public async findByJournalId(journalId: JournalId): Promise<JournalLine[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('journal_id', journalId.value);

        if (error || !data) return [];
        
        return data.map(row => JournalLine.create(
            new JournalLineId(row.id),
            new AccountId(row.account_id),
            new JournalDescription(row.description),
            new DebitAmount(row.debit),
            new CreditAmount(row.credit),
            row.currency_id,
            row.cost_center_id,
            row.branch_id,
            row.customer_id,
            row.supplier_id
        ));
    }

    public async deleteMany(journalId: JournalId): Promise<void> {
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('journal_id', journalId.value);
            
        if (error) {
            throw new Error(`Failed to delete journal lines: ${error.message}`);
        }
    }
}
