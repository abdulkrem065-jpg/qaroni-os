import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

create_file('src/infrastructure/accounting/repositories/SupabaseAccountRepository.ts', """import { SupabaseClient } from '@supabase/supabase-js';
import { IAccountRepository } from '../../../domain/accounting/repositories/IAccountRepository';
import { Account } from '../../../domain/accounting/aggregates/Account';
import { AccountId } from '../../../domain/accounting/valueobjects/AccountId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { AccountCode } from '../../../domain/accounting/valueobjects/AccountCode';
import { AccountName } from '../../../domain/accounting/valueobjects/AccountName';
import { AccountType } from '../../../domain/accounting/valueobjects/AccountType';
import { AccountCategory } from '../../../domain/accounting/valueobjects/AccountCategory';
import { NormalBalance } from '../../../domain/accounting/valueobjects/NormalBalance';
import { PostingStatus } from '../../../domain/accounting/valueobjects/PostingStatus';
import { AccountLevel } from '../../../domain/accounting/valueobjects/AccountLevel';

export class SupabaseAccountRepository implements IAccountRepository {
    private readonly tableName = 'accounting_accounts';

    constructor(private readonly supabase: SupabaseClient) {}

    public async save(account: Account): Promise<void> {
        const data = this.toPersistence(account);
        const { error } = await this.supabase
            .from(this.tableName)
            .upsert(data, { onConflict: 'id, organization_id' });

        if (error) {
            throw new Error(`Failed to save account: ${error.message}`);
        }
    }

    public async findById(id: AccountId, organizationId: OrganizationId): Promise<Account | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.toDomain(data);
    }

    public async findByCode(code: AccountCode, organizationId: OrganizationId): Promise<Account | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('code', code.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error || !data) return null;
        return this.toDomain(data);
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<Account[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('organization_id', organizationId.value)
            .order('code', { ascending: true });

        if (error || !data) return [];
        return data.map(row => this.toDomain(row));
    }

    public async findChildren(parentId: AccountId, organizationId: OrganizationId): Promise<Account[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('parent_id', parentId.value)
            .eq('organization_id', organizationId.value);

        if (error || !data) return [];
        return data.map(row => this.toDomain(row));
    }

    private toPersistence(account: Account): any {
        return {
            id: account.id.value,
            organization_id: account.organizationId.value,
            code: account.code.value,
            name: account.name.value,
            type: account.type.value,
            category: account.category.value,
            normal_balance: account.normalBalance.value,
            status: account.status.value,
            is_header: account.isHeader,
            level: account.level.value,
            parent_id: account.parentId?.value || null,
            updated_at: new Date().toISOString()
        };
    }

    private toDomain(row: any): Account {
        return Account.load(
            new AccountId(row.id),
            new OrganizationId(row.organization_id),
            new AccountCode(row.code),
            new AccountName(row.name),
            new AccountType(row.type),
            new AccountCategory(row.category),
            new NormalBalance(row.normal_balance),
            new PostingStatus(row.status),
            row.is_header,
            new AccountLevel(row.level),
            row.parent_id ? new AccountId(row.parent_id) : undefined
        );
    }
}
""")

print("Accounting Infra layer generated")
