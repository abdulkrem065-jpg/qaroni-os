import { ICustomerRepository } from '../../../domain/customer/repositories/ICustomerRepository';
import { Customer } from '../../../domain/customer/aggregates/Customer';
import { CustomerId } from '../../../domain/customer/valueobjects/CustomerId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { CustomerCode } from '../../../domain/customer/valueobjects/CustomerCode';
import { CustomerName } from '../../../domain/customer/valueobjects/CustomerName';
import { CustomerPhone } from '../../../domain/customer/valueobjects/CustomerPhone';
import { CustomerEmail } from '../../../domain/customer/valueobjects/CustomerEmail';
import { CustomerAddress } from '../../../domain/customer/valueobjects/CustomerAddress';
import { CustomerCategory } from '../../../domain/customer/valueobjects/CustomerCategory';
import { CreditLimit } from '../../../domain/customer/valueobjects/CreditLimit';
import { CreateCustomerDTO, UpdateCustomerDTO, ChangeCreditLimitDTO, CustomerResponseDTO } from '../dtos/CustomerDTOs';
import { IEventBus } from '../../ports/IEventBus';
import { BusinessRuleError } from '../../../domain/shared/errors/BusinessRuleError';
import * as crypto from 'crypto';

export class CustomerUseCases {
    constructor(
        private readonly customerRepository: ICustomerRepository,
        private readonly eventBus: IEventBus
    ) {}

    private toDTO(customer: Customer): CustomerResponseDTO {
        return {
            id: customer.id.value,
            organizationId: customer.organizationId.value,
            code: customer.code.value,
            name: customer.name.value,
            phone: customer.phone?.value,
            email: customer.email?.value,
            address: customer.address ? {
                street: customer.address.street,
                city: customer.address.city,
                state: customer.address.state,
                postalCode: customer.address.postalCode,
                country: customer.address.country
            } : undefined,
            status: customer.status.value,
            category: customer.category.value,
            creditLimit: customer.creditLimit.value,
            createdAt: customer.createdAt.toISOString(),
            updatedAt: customer.updatedAt.toISOString()
        };
    }

    public async createCustomer(dto: CreateCustomerDTO): Promise<CustomerResponseDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const code = new CustomerCode(dto.code);

        const existing = await this.customerRepository.findByCode(code, orgId);
        if (existing) {
            throw new BusinessRuleError('CustomerCode must be unique inside Organization');
        }

        const address = dto.address ? new CustomerAddress(
            dto.address.street,
            dto.address.city,
            dto.address.state,
            dto.address.postalCode,
            dto.address.country
        ) : undefined;

        const customer = Customer.create(
            new CustomerId(crypto.randomUUID()),
            orgId,
            code,
            new CustomerName(dto.name),
            dto.phone ? new CustomerPhone(dto.phone) : undefined,
            dto.email ? new CustomerEmail(dto.email) : undefined,
            address,
            dto.category ? new CustomerCategory(dto.category) : undefined,
            dto.creditLimit !== undefined ? new CreditLimit(dto.creditLimit) : undefined
        );

        await this.customerRepository.save(customer);

        for (const event of customer.domainEvents) {
            await this.eventBus.publish(event);
        }
        customer.clearDomainEvents();

        return this.toDTO(customer);
    }

    public async updateCustomer(dto: UpdateCustomerDTO): Promise<CustomerResponseDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const customerId = new CustomerId(dto.customerId);

        const customer = await this.customerRepository.findById(customerId, orgId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        const address = dto.address ? new CustomerAddress(
            dto.address.street,
            dto.address.city,
            dto.address.state,
            dto.address.postalCode,
            dto.address.country
        ) : undefined;

        customer.update(
            new CustomerName(dto.name),
            dto.phone ? new CustomerPhone(dto.phone) : undefined,
            dto.email ? new CustomerEmail(dto.email) : undefined,
            address,
            dto.category ? new CustomerCategory(dto.category) : undefined
        );

        await this.customerRepository.save(customer);

        for (const event of customer.domainEvents) {
            await this.eventBus.publish(event);
        }
        customer.clearDomainEvents();

        return this.toDTO(customer);
    }

    public async changeCreditLimit(dto: ChangeCreditLimitDTO): Promise<CustomerResponseDTO> {
        const orgId = new OrganizationId(dto.organizationId);
        const customerId = new CustomerId(dto.customerId);

        const customer = await this.customerRepository.findById(customerId, orgId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        customer.changeCreditLimit(new CreditLimit(dto.creditLimit));

        await this.customerRepository.save(customer);

        for (const event of customer.domainEvents) {
            await this.eventBus.publish(event);
        }
        customer.clearDomainEvents();

        return this.toDTO(customer);
    }

    public async archiveCustomer(organizationId: string, customerId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const id = new CustomerId(customerId);

        const customer = await this.customerRepository.findById(id, orgId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        customer.archive();

        await this.customerRepository.save(customer);

        for (const event of customer.domainEvents) {
            await this.eventBus.publish(event);
        }
        customer.clearDomainEvents();
    }

    public async restoreCustomer(organizationId: string, customerId: string): Promise<void> {
        const orgId = new OrganizationId(organizationId);
        const id = new CustomerId(customerId);

        const customer = await this.customerRepository.findById(id, orgId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        customer.restore();

        await this.customerRepository.save(customer);

        for (const event of customer.domainEvents) {
            await this.eventBus.publish(event);
        }
        customer.clearDomainEvents();
    }

    public async getCustomer(organizationId: string, customerId: string): Promise<CustomerResponseDTO> {
        const orgId = new OrganizationId(organizationId);
        const id = new CustomerId(customerId);

        const customer = await this.customerRepository.findById(id, orgId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        return this.toDTO(customer);
    }

    public async listCustomers(organizationId: string): Promise<CustomerResponseDTO[]> {
        const orgId = new OrganizationId(organizationId);
        const customers = await this.customerRepository.findByOrganization(orgId);
        return customers.map(c => this.toDTO(c));
    }
}
