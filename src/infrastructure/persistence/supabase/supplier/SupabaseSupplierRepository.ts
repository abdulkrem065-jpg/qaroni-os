import { ISupplierRepository } from '../../../../domain/supplier/repositories/ISupplierRepository';
import { Supplier } from '../../../../domain/supplier/aggregates/Supplier';
import { SupplierId } from '../../../../domain/shared/valueobjects/SupplierId';
import { OrganizationId } from '../../../../domain/shared/valueobjects/OrganizationId';
import { SupplierCode } from '../../../../domain/shared/valueobjects/SupplierCode';
import { SupplierName } from '../../../../domain/shared/valueobjects/SupplierName';
import { SupplierContact } from '../../../../domain/shared/valueobjects/SupplierContact';
import { SupplierLegalInfo } from '../../../../domain/shared/valueobjects/SupplierLegalInfo';
import { SupplierStatus } from '../../../../domain/supplier/types/SupplierTypes';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseSupplierRepository implements ISupplierRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private mapToDomain(row: any): Supplier {
        return Supplier.load(
            new SupplierId(row.id),
            new OrganizationId(row.organization_id),
            SupplierCode.create(row.code),
            SupplierName.create(row.name),
            SupplierContact.create(row.phone, row.email, row.address),
            SupplierLegalInfo.create(row.tax_number, row.commercial_registration),
            row.status as SupplierStatus,
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }

    private mapToRow(supplier: Supplier): any {
        return {
            id: supplier.id.value,
            organization_id: supplier.organizationId.value,
            code: supplier.code.value,
            name: supplier.name.value,
            phone: supplier.contact.phone,
            email: supplier.contact.email,
            address: supplier.contact.address,
            tax_number: supplier.legalInfo.taxNumber,
            commercial_registration: supplier.legalInfo.commercialRegistration,
            status: supplier.status,
            created_at: supplier.createdAt.toISOString(),
            updated_at: supplier.updatedAt.toISOString()
        };
    }

    public async save(supplier: Supplier): Promise<void> {
        const { error } = await this.supabase
            .from('suppliers')
            .upsert(this.mapToRow(supplier));
        if (error) throw new Error(`Failed to save supplier: ${error.message}`);
    }

    public async findByIdAndOrganizationId(id: SupplierId, organizationId: OrganizationId): Promise<Supplier | null> {
        const { data, error } = await this.supabase
            .from('suppliers')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findAllByOrganizationId(organizationId: OrganizationId): Promise<Supplier[]> {
        const { data, error } = await this.supabase
            .from('suppliers')
            .select('*')
            .eq('organization_id', organizationId.value);
        if (error || !data) return [];
        return data.map(row => this.mapToDomain(row));
    }

    public async findByCodeAndOrganizationId(code: string, organizationId: OrganizationId): Promise<Supplier | null> {
        const { data, error } = await this.supabase
            .from('suppliers')
            .select('*')
            .eq('code', code)
            .eq('organization_id', organizationId.value)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }

    public async findByTaxNumber(taxNumber: string): Promise<Supplier | null> {
        const { data, error } = await this.supabase
            .from('suppliers')
            .select('*')
            .eq('tax_number', taxNumber)
            .single();
        if (error || !data) return null;
        return this.mapToDomain(data);
    }
}
