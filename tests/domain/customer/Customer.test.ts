import { describe, it, expect } from 'vitest';
import { Customer } from '../../../src/domain/customer/aggregates/Customer';
import { CustomerId } from '../../../src/domain/customer/valueobjects/CustomerId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { CustomerCode } from '../../../src/domain/customer/valueobjects/CustomerCode';
import { CustomerName } from '../../../src/domain/customer/valueobjects/CustomerName';
import { CustomerStatus } from '../../../src/domain/customer/valueobjects/CustomerStatus';
import { CreditLimit } from '../../../src/domain/customer/valueobjects/CreditLimit';

describe('Customer Aggregate', () => {
    const orgId = new OrganizationId('org-1');
    const customerId = new CustomerId('cust-1');
    const code = new CustomerCode('CUST-001');
    const name = new CustomerName('Acme Corp');

    it('should create a new customer', () => {
        const customer = Customer.create(customerId, orgId, code, name);
        expect(customer.id.value).toBe('cust-1');
        expect(customer.status.value).toBe('ACTIVE');
        expect(customer.domainEvents.length).toBe(1);
    });

    it('should archive customer', () => {
        const customer = Customer.create(customerId, orgId, code, name);
        customer.clearDomainEvents();
        customer.archive();
        expect(customer.status.value).toBe('ARCHIVED');
        expect(customer.domainEvents.length).toBe(1);
    });

    it('should prevent modifying archived customer', () => {
        const customer = Customer.create(customerId, orgId, code, name);
        customer.archive();
        expect(() => {
            customer.changeCreditLimit(new CreditLimit(1000));
        }).toThrow('Cannot modify an archived customer');
    });
});
