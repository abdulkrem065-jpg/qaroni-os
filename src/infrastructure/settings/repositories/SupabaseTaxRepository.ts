import { SupabaseClient } from '@supabase/supabase-js';
import { ITaxRepository } from '../../../domain/settings/repositories/ITaxRepository';
import { TaxProfile } from '../../../domain/settings/aggregates/TaxProfile';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { TaxProfileId } from '../../../domain/settings/valueobjects/TaxProfileId';
import { TaxRate } from '../../../domain/settings/valueobjects/TaxRate';

export class SupabaseTaxRepository implements ITaxRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): TaxProfile {
        return TaxProfile.load(
            new TaxProfileId(row.id),
            new OrganizationId(row.organization_id),
            row.name,
            new TaxRate(Number(row.rate)),
            row.is_active,
            new Date(row.created_at)
        );
    }

    private toPersistence(tax: TaxProfile): any {
        return {
            id: tax.id.value,
            organization_id: tax.organizationId.value,
            name: tax.name,
            rate: tax.rate.value,
            is_active: tax.isActive,
            created_at: tax.createdAt.toISOString()
        };
    }

    public async save(tax: TaxProfile): Promise<void> {
        const { error } = await this.supabase
            .from('tax_profiles')
            .upsert(this.toPersistence(tax))
            .eq('id', tax.id.value)
            .eq('organization_id', tax.organizationId.value);
        if (error) throw error;
    }

    public async findById(id: TaxProfileId, organizationId: OrganizationId): Promise<TaxProfile | null> {
        const { data, error } = await this.supabase
            .from('tax_profiles')
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

    public async findByOrganization(organizationId: OrganizationId): Promise<TaxProfile[]> {
        const { data, error } = await this.supabase
            .from('tax_profiles')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error) throw error;
        return (data || []).map(row => this.toDomain(row));
    }
}
