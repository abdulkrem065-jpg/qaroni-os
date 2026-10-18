import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

create_file('src/infrastructure/accounting/repositories/SupabaseJournalRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
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
""")

create_file('src/infrastructure/accounting/repositories/SupabaseJournalLineRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
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
""")

print("Journal Infrastructure layer generated")
