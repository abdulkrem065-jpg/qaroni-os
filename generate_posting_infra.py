import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

create_file('src/infrastructure/accounting/repositories/SupabasePostingRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
import { IPostingRepository } from '../../../domain/accounting/repositories/IPostingRepository';
import { PostingBatch } from '../../../domain/accounting/aggregates/PostingBatch';
import { PostingBatchId } from '../../../domain/accounting/valueobjects/PostingBatchId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { JournalId } from '../../../domain/accounting/valueobjects/JournalId';
import { PostingNumber } from '../../../domain/accounting/valueobjects/PostingNumber';
import { PostingStatus } from '../../../domain/accounting/valueobjects/PostingStatus';
import { PostingTimestamp } from '../../../domain/accounting/valueobjects/PostingTimestamp';
import { PostingTransaction } from '../../../domain/accounting/entities/PostingTransaction';
import { PostingId } from '../../../domain/accounting/valueobjects/PostingId';
import { PostingResult } from '../../../domain/accounting/valueobjects/PostingResult';

export class SupabasePostingRepository implements IPostingRepository {
    private readonly batchTable = 'accounting_posting_batches';
    private readonly txTable = 'accounting_posting_transactions';

    constructor(private readonly supabase: SupabaseClient) {}

    public async save(batch: PostingBatch): Promise<void> {
        // Save Batch
        const batchData = this.toPersistenceBatch(batch);
        const { error: batchError } = await this.supabase
            .from(this.batchTable)
            .upsert(batchData, { onConflict: 'id, organization_id' });

        if (batchError) {
            throw new Error(`Failed to save posting batch: ${batchError.message}`);
        }

        // Save Transactions
        if (batch.transactions.length > 0) {
            const txData = batch.transactions.map(tx => this.toPersistenceTx(tx, batch.id));
            const { error: txError } = await this.supabase
                .from(this.txTable)
                .upsert(txData, { onConflict: 'id' });
                
            if (txError) {
                throw new Error(`Failed to save posting transactions: ${txError.message}`);
            }
        }
    }

    public async findById(id: PostingBatchId, organizationId: OrganizationId): Promise<PostingBatch | null> {
        const { data: batchData, error: batchError } = await this.supabase
            .from(this.batchTable)
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (batchError || !batchData) return null;

        const { data: txData, error: txError } = await this.supabase
            .from(this.txTable)
            .select('*')
            .eq('batch_id', id.value);

        if (txError) throw new Error(`Failed to load transactions: ${txError.message}`);

        return this.toDomain(batchData, txData || []);
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<PostingBatch[]> {
        const { data: batchData, error: batchError } = await this.supabase
            .from(this.batchTable)
            .select('*')
            .eq('organization_id', organizationId.value)
            .order('timestamp', { ascending: false });

        if (batchError || !batchData) return [];

        const batchIds = batchData.map(b => b.id);
        if (batchIds.length === 0) return [];

        const { data: txData, error: txError } = await this.supabase
            .from(this.txTable)
            .select('*')
            .in('batch_id', batchIds);

        if (txError) throw new Error(`Failed to load transactions: ${txError.message}`);

        return batchData.map(b => this.toDomain(b, (txData || []).filter(tx => tx.batch_id === b.id)));
    }

    public async findByJournalId(journalId: JournalId, organizationId: OrganizationId): Promise<PostingBatch[]> {
        // Find transactions for this journal
        const { data: txData, error: txError } = await this.supabase
            .from(this.txTable)
            .select('batch_id')
            .eq('journal_id', journalId.value);

        if (txError || !txData || txData.length === 0) return [];

        const batchIds = txData.map(tx => tx.batch_id);

        const { data: batchData, error: batchError } = await this.supabase
            .from(this.batchTable)
            .select('*')
            .eq('organization_id', organizationId.value)
            .in('id', batchIds);

        if (batchError || !batchData) return [];
        
        // We need full transactions to construct batches properly
        const { data: allTxData, error: allTxError } = await this.supabase
            .from(this.txTable)
            .select('*')
            .in('batch_id', batchData.map(b => b.id));

        return batchData.map(b => this.toDomain(b, (allTxData || []).filter(tx => tx.batch_id === b.id)));
    }

    private toPersistenceBatch(batch: PostingBatch): any {
        return {
            id: batch.id.value,
            organization_id: batch.organizationId.value,
            number: batch.number.value,
            status: batch.status.value,
            timestamp: batch.timestamp.value.toISOString()
        };
    }

    private toPersistenceTx(tx: PostingTransaction, batchId: PostingBatchId): any {
        return {
            id: tx.id.value,
            batch_id: batchId.value,
            journal_id: tx.journalId.value,
            timestamp: tx.timestamp.value.toISOString(),
            is_success: tx.result ? tx.result.isSuccess : null,
            error_details: tx.result ? tx.result.errorDetails : null
        };
    }

    private toDomain(batchRow: any, txRows: any[]): PostingBatch {
        const transactions = txRows.map(row => {
            const result = row.is_success !== null ? new PostingResult(row.is_success, row.error_details) : null;
            return PostingTransaction.load(
                new PostingId(row.id),
                new JournalId(row.journal_id),
                new PostingTimestamp(row.timestamp),
                result
            );
        });

        return PostingBatch.load(
            new PostingBatchId(batchRow.id),
            new OrganizationId(batchRow.organization_id),
            new PostingNumber(batchRow.number),
            new PostingStatus(batchRow.status),
            new PostingTimestamp(batchRow.timestamp),
            transactions
        );
    }
}
""")

create_file('src/infrastructure/accounting/repositories/SupabasePostingHistoryRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';

// This is a dedicated read-model repository for Posting History (event sourcing or complex queries)
// For now, it queries the same tables to provide history views.
export interface PostingHistoryView {
    batchId: string;
    organizationId: string;
    number: string;
    status: string;
    timestamp: string;
    journalCount: number;
    successCount: number;
    errorCount: number;
}

export class SupabasePostingHistoryRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    public async getHistory(organizationId: string): Promise<PostingHistoryView[]> {
        // Simulate a complex query for history reporting
        const { data: batches, error: batchError } = await this.supabase
            .from('accounting_posting_batches')
            .select(`
                id,
                organization_id,
                number,
                status,
                timestamp,
                accounting_posting_transactions (
                    id,
                    is_success
                )
            `)
            .eq('organization_id', organizationId)
            .order('timestamp', { ascending: false });

        if (batchError || !batches) return [];

        return batches.map(b => {
            const txs = b.accounting_posting_transactions || [];
            return {
                batchId: b.id,
                organizationId: b.organization_id,
                number: b.number,
                status: b.status,
                timestamp: b.timestamp,
                journalCount: txs.length,
                successCount: txs.filter((t: any) => t.is_success === true).length,
                errorCount: txs.filter((t: any) => t.is_success === false).length
            };
        });
    }
}
""")

print("Posting Infrastructure generated")
