import { SupabaseClient } from '@supabase/supabase-js';
import { ICustomerRepository } from '../../../domain/customer/repositories/ICustomerRepository';
import { Customer } from '../../../domain/customer/aggregates/Customer';
import { CustomerId } from '../../../domain/customer/valueobjects/CustomerId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { CustomerCode } from '../../../domain/customer/valueobjects/CustomerCode';
import { CustomerName } from '../../../domain/customer/valueobjects/CustomerName';
import { CustomerPhone } from '../../../domain/customer/valueobjects/CustomerPhone';
import { CustomerEmail } from '../../../domain/customer/valueobjects/CustomerEmail';
import { CustomerAddress } from '../../../domain/customer/valueobjects/CustomerAddress';
import { CustomerStatus, CustomerStatusValue } from '../../../domain/customer/valueobjects/CustomerStatus';
import { CustomerCategory } from '../../../domain/customer/valueobjects/CustomerCategory';
import { CreditLimit } from '../../../domain/customer/valueobjects/CreditLimit';

export class SupabaseCustomerRepository implements ICustomerRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    private toDomain(row: any): Customer {
        const address = (row.address_street && row.address_city && row.address_state && row.address_postal_code && row.address_country)
            ? new CustomerAddress(
                row.address_street,
                row.address_city,
                row.address_state,
                row.address_postal_code,
                row.address_country
            ) : undefined;

        return Customer.load(
            new CustomerId(row.id),
            new OrganizationId(row.organization_id),
            new CustomerCode(row.code),
            new CustomerName(row.name),
            row.phone ? new CustomerPhone(row.phone) : undefined,
            row.email ? new CustomerEmail(row.email) : undefined,
            address,
            new CustomerStatus(row.status as CustomerStatusValue),
            new CustomerCategory(row.category),
            new CreditLimit(row.credit_limit ? Number(row.credit_limit) : 0),
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }

    private toPersistence(customer: Customer): any {
        return {
            id: customer.id.value,
            organization_id: customer.organizationId.value,
            code: customer.code.value,
            name: customer.name.value,
            phone: customer.phone?.value || null,
            email: customer.email?.value || null,
            address_street: customer.address?.street || null,
            address_city: customer.address?.city || null,
            address_state: customer.address?.state || null,
            address_postal_code: customer.address?.postalCode || null,
            address_country: customer.address?.country || null,
            status: customer.status.value,
            category: customer.category.value,
            credit_limit: customer.creditLimit.value,
            created_at: customer.createdAt.toISOString(),
            updated_at: customer.updatedAt.toISOString()
        };
    }

    public async save(customer: Customer): Promise<void> {
        const data = this.toPersistence(customer);
        const { error } = await this.supabase
            .from('customers')
            .upsert(data)
            .eq('id', customer.id.value)
            .eq('organization_id', customer.organizationId.value);
            
        if (error) throw error;
    }

    public async findById(id: CustomerId, organizationId: OrganizationId): Promise<Customer | null> {
        const { data, error } = await this.supabase
            .from('customers')
            .select('*')
            .eq('id', id.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // PostgREST code for "not found"
            throw error;
        }
        
        if (!data) return null;
        return this.toDomain(data);
    }

    public async findByCode(code: CustomerCode, organizationId: OrganizationId): Promise<Customer | null> {
        const { data, error } = await this.supabase
            .from('customers')
            .select('*')
            .eq('code', code.value)
            .eq('organization_id', organizationId.value)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        if (!data) return null;
        return this.toDomain(data);
    }

    public async findByOrganization(organizationId: OrganizationId): Promise<Customer[]> {
        const { data, error } = await this.supabase
            .from('customers')
            .select('*')
            .eq('organization_id', organizationId.value);

        if (error) throw error;
        if (!data) return [];
        return data.map(row => this.toDomain(row));
    }
}
