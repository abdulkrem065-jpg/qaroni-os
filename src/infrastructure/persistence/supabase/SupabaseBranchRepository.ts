import { SupabaseClient } from '@supabase/supabase-js';
import { IBranchRepository } from '../../../domain/organization/repositories/IBranchRepository';
import { Branch } from '../../../domain/organization/aggregates/Branch';
import { BranchId } from '../../../domain/shared/valueobjects/BranchId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { BranchCode } from '../../../domain/shared/valueobjects/BranchCode';
import { BranchName } from '../../../domain/shared/valueobjects/BranchName';
import { BranchAddress } from '../../../domain/shared/valueobjects/BranchAddress';
import { BranchPhone } from '../../../domain/shared/valueobjects/BranchPhone';
import { BranchEmail } from '../../../domain/shared/valueobjects/BranchEmail';
import { BranchStatus, BranchType } from '../../../domain/organization/types/BranchTypes';

export class SupabaseBranchRepository implements IBranchRepository {
    private readonly tableName = 'branches';

    constructor(private readonly supabase: SupabaseClient) {}

    async findById(id: BranchId): Promise<Branch | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id.value)
            .single();

        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    async findByOrganizationIdAndId(orgId: OrganizationId, branchId: BranchId): Promise<Branch | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('id', branchId.value)
            .eq('organization_id', orgId.value)
            .single();

        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    async findByOrganizationIdAndCode(orgId: OrganizationId, code: BranchCode): Promise<Branch | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('organization_id', orgId.value)
            .eq('code', code.value)
            .single();

        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    async findAllByOrganizationId(orgId: OrganizationId): Promise<Branch[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('organization_id', orgId.value);

        if (error || !data) return [];
        return data.map(d => this.mapToDomain(d));
    }

    async exists(id: BranchId): Promise<boolean> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('id')
            .eq('id', id.value)
            .single();

        return !error && !!data;
    }

    async save(branch: Branch): Promise<void> {
        const record = {
            id: branch.id.value,
            organization_id: branch.organizationId.value,
            code: branch.code.value,
            name: branch.profile.name.value,
            address_street: branch.profile.address.street,
            address_city: branch.profile.address.city,
            address_state: branch.profile.address.state,
            address_country: branch.profile.address.country,
            address_postal_code: branch.profile.address.postalCode,
            phone: branch.profile.phone?.value || null,
            email: branch.profile.email?.value || null,
            type: branch.settings.type,
            operating_hours: branch.settings.operatingHours || null,
            timezone: branch.settings.timezone || null,
            status: branch.status,
            updated_at: new Date().toISOString()
        };

        const { error } = await this.supabase
            .from(this.tableName)
            .upsert(record);

        if (error) throw new Error(`Supabase error saving branch: ${error.message}`);
    }

    async delete(id: BranchId): Promise<void> {
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('id', id.value);

        if (error) throw new Error(`Supabase error deleting branch: ${error.message}`);
    }

    private mapToDomain(data: any): Branch {
        const profile = {
            name: BranchName.create(data.name),
            address: BranchAddress.create(
                data.address_street,
                data.address_city,
                data.address_state,
                data.address_country,
                data.address_postal_code
            ),
            phone: data.phone ? BranchPhone.create(data.phone) : undefined,
            email: data.email ? BranchEmail.create(data.email) : undefined
        };

        const settings = {
            type: data.type as BranchType,
            operatingHours: data.operating_hours,
            timezone: data.timezone
        };

        return Branch.load(
            new BranchId(data.id),
            new OrganizationId(data.organization_id),
            BranchCode.create(data.code),
            profile,
            settings,
            data.status as BranchStatus
        );
    }
}
