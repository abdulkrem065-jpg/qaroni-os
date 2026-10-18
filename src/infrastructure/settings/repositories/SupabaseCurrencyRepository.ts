import { SupabaseClient } from '@supabase/supabase-js';
import { ICurrencyRepository } from '../../../domain/settings/repositories/ICurrencyRepository';
import { Currency } from '../../../domain/settings/aggregates/Currency';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { CurrencyId } from '../../../domain/settings/valueobjects/CurrencyId';
import { CurrencyCode } from '../../../domain/settings/valueobjects/CurrencyCode';
import { CurrencySymbol } from '../../../domain/settings/valueobjects/CurrencySymbol';

export class SupabaseCurrencyRepository implements ICurrencyRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): Currency {
        return Currency.load(
            new CurrencyId(row.id),
            new OrganizationId(row.organization_id),
            new CurrencyCode(row.code),
            new CurrencySymbol(row.symbol),
            row.is_base,
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }

    private toPersistence(currency: Currency): any {
        return {
            id: currency.id.value,
            organization_id: currency.organizationId.value,
            code: currency.code.value,
            symbol: currency.symbol.value,
            is_base: currency.isBase,
            created_at: currency.createdAt.toISOString(),
            updated_at: currency.updatedAt.toISOString()
        };
    }

    public async save(currency: Currency): Promise<void> {
        const { error } = await this.supabase
            .from('currencies')
            .upsert(this.toPersistence(currency))
            .eq('id', currency.id.value)
            .eq('organization_id', currency.organizationId.value);
        if (error) throw error;
    }

    public async findById(id: CurrencyId, organizationId: OrganizationId): Promise<Currency | null> {
        const { data, error } = await this.supabase
            .from('currencies')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toDomain(data) : null;
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<Currency[]> {
        const { data, error } = await this.supabase
            .from('currencies')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error) throw error;
        return (data || []).map(row => this.toDomain(row));
    }

    public async getBaseCurrency(organizationId: OrganizationId): Promise<Currency | null> {
        const { data, error } = await this.supabase
            .from('currencies')
            .select('*')
            .eq('organization_id', organizationId.value)
            .eq('is_base', true)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toDomain(data) : null;
    }
}
