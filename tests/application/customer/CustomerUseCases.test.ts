import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerUseCases } from '../../../src/application/customer/usecases/CustomerUseCases';
import { ICustomerRepository } from '../../../src/domain/customer/repositories/ICustomerRepository';
import { IEventBus } from '../../../src/application/ports/IEventBus';
import { Customer } from '../../../src/domain/customer/aggregates/Customer';
import { CustomerId } from '../../../src/domain/customer/valueobjects/CustomerId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { CustomerCode } from '../../../src/domain/customer/valueobjects/CustomerCode';
import { CustomerName } from '../../../src/domain/customer/valueobjects/CustomerName';

describe('Customer Use Cases', () => {
    let mockRepo: ICustomerRepository;
    let mockEventBus: IEventBus;
    let useCases: CustomerUseCases;

    beforeEach(() => {
        mockRepo = {
            save: vi.fn(),
            findById: vi.fn(),
            findByCode: vi.fn(),
            findByOrganization: vi.fn()
        };
        mockEventBus = {
            publish: vi.fn(),
            publishAll: vi.fn(),
        };
        useCases = new CustomerUseCases(mockRepo, mockEventBus);
    });

    it('should create customer', async () => {
        const dto = {
            organizationId: 'org-1',
            code: 'C001',
            name: 'Test Customer'
        };
        const result = await useCases.createCustomer(dto);
        expect(result.code).toBe('C001');
        expect(mockRepo.save).toHaveBeenCalled();
        expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should fail creation if code is not unique', async () => {
        mockRepo.findByCode = vi.fn().mockResolvedValue(true);
        const dto = {
            organizationId: 'org-1',
            code: 'C001',
            name: 'Test Customer'
        };
        await expect(useCases.createCustomer(dto)).rejects.toThrow('CustomerCode must be unique inside Organization');
    });
});
