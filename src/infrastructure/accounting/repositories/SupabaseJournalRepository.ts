import { SupabaseClient } from '@supabase/supabase-js';
import { IJournalRepository } from '../../../domain/accounting/repositories/IJournalRepository';
import { Journal } from '../../../domain/accounting/aggregates/Journal';
import { JournalId } from '../../../domain/accounting/valueobjects/JournalId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { JournalNumber } from '../../../domain/accounting/valueobjects/JournalNumber';
import { JournalDescription } from '../../../domain/accounting/valueobjects/JournalDescription';
import { JournalStatus } from '../../../domain/accounting/valueobjects/JournalStatus';
import { PostingDate } from '../../../domain/accounting/valueobjects/PostingDate';
import { AccountingDate } from '../../../domain/accounting/valueobjects/AccountingDate';
import { ReferenceNumber } from '../../../domain/accounting/valueobjects/ReferenceNumber';

export class SupabaseJournalRepository implements IJournalRepository {
    private readonly tableName = 'accounting_journals';

    constructor(private readonly supabase: SupabaseClient) {}

    public async save(journal: Journal): Promise<void> {
        const data = this.toPersistence(journal);
        const { error } = await this.supabase
            .from(this.tableName)
            .upsert(data, { onConflict: 'id, organization_id' });

        if (error) {
            throw new Error(`Failed to save journal: ${error.message}`);
        }
    }

    public async findById(id: JournalId, organizationId: OrganizationId): Promise<Journal | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.toDomain(data);
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<Journal[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('organization_id', organizationId.value)
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return data.map(row => this.toDomain(row));
    }

    private toPersistence(journal: Journal): any {
        return {
            id: journal.id.value,
            organization_id: journal.organizationId.value,
            number: journal.number.value,
            description: journal.description.value,
            status: journal.status.value,
            posting_date: journal.postingDate.value.toISOString(),
            accounting_date: journal.accountingDate.value.toISOString(),
            reference_number: journal.referenceNumber.value,
            updated_at: new Date().toISOString()
        };
    }

    private toDomain(row: any): Journal {
        return Journal.load(
            new JournalId(row.id),
            new OrganizationId(row.organization_id),
            new JournalNumber(row.number),
            new JournalDescription(row.description),
            new JournalStatus(row.status),
            new PostingDate(row.posting_date),
            new AccountingDate(row.accounting_date),
            new ReferenceNumber(row.reference_number),
            [] // lines are loaded by the app service using IJournalLineRepository
        );
    }
}
