import { SupabaseClient } from '@supabase/supabase-js';

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
