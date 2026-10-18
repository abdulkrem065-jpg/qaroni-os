import { SupabaseClient } from '@supabase/supabase-js';
import { IOrganizationRepository } from '../../../domain/organization/repositories/IOrganizationRepository';
import { Organization } from '../../../domain/organization/aggregates/Organization';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { TaxId } from '../../../domain/shared/valueobjects/TaxId';
import { Timezone } from '../../../domain/shared/valueobjects/Timezone';
import { Currency } from '../../../domain/shared/valueobjects/Currency';
import { RepositoryError } from '../../errors/RepositoryError';

export class SupabaseOrganizationRepository implements IOrganizationRepository {
    private readonly tableName = 'organizations';

    constructor(private readonly supabase: SupabaseClient) {}

    async findById(id: OrganizationId): Promise<Organization | null> {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id.value)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw error;
            }
            if (!data) return null;

            return this.toDomain(data);
        } catch (error) {
            throw new RepositoryError(`Failed to find Organization by ID: ${error}`, error);
        }
    }

    async exists(id: OrganizationId): Promise<boolean> {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('id')
                .eq('id', id.value)
                .maybeSingle();
                
            if (error) throw error;
            return !!data;
        } catch (error) {
            throw new RepositoryError(`Failed to check if Organization exists: ${error}`, error);
        }
    }

    async save(organization: Organization): Promise<void> {
        try {
            const persistenceModel = this.toPersistence(organization);
            const { error } = await this.supabase
                .from(this.tableName)
                .upsert(persistenceModel);
                
            if (error) throw error;
        } catch (error) {
            throw new RepositoryError(`Failed to save Organization: ${error}`, error);
        }
    }

    async delete(id: OrganizationId): Promise<void> {
        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id.value);
                
            if (error) throw error;
        } catch (error) {
            throw new RepositoryError(`Failed to delete Organization: ${error}`, error);
        }
    }

    async findAll(): Promise<Organization[]> {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*');
                
            if (error) throw error;
            return (data || []).map(this.toDomain);
        } catch (error) {
            throw new RepositoryError(`Failed to find all Organizations: ${error}`, error);
        }
    }

    private toDomain(data: any): Organization {
        try {
            return Organization.reconstitute(
                new OrganizationId(data.id),
                data.name,
                data.is_active,
                data.tax_id ? TaxId.create(data.tax_id) : undefined,
                data.timezone ? Timezone.create(data.timezone) : undefined,
                data.currency ? new Currency(data.currency) : undefined
            );
        } catch (error) {
            throw new RepositoryError(`Failed to map Organization from persistence: ${error}`, error);
        }
    }

    private toPersistence(organization: Organization): any {
        return {
            id: organization.id.value,
            name: organization.name,
            is_active: organization.isActive,
            tax_id: organization.taxId?.value || null,
            timezone: organization.timezone?.value || null,
            currency: organization.currency?.code || null,
        };
    }
}
