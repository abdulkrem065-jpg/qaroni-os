import { Customer } from '../aggregates/Customer';
import { CustomerId } from '../valueobjects/CustomerId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { CustomerCode } from '../valueobjects/CustomerCode';

export interface ICustomerRepository {
    save(customer: Customer): Promise<void>;
    findById(id: CustomerId, organizationId: OrganizationId): Promise<Customer | null>;
    findByCode(code: CustomerCode, organizationId: OrganizationId): Promise<Customer | null>;
    findByOrganization(organizationId: OrganizationId): Promise<Customer[]>;
}
