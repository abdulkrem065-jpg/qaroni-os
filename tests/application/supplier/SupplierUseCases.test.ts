import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupplierUseCases } from '../../../src/application/usecases/supplier/SupplierUseCases';
import { ISupplierRepository } from '../../../src/domain/supplier/repositories/ISupplierRepository';
import { IEventBus } from '../../../src/application/ports/IEventBus';
import { Supplier } from '../../../src/domain/supplier/aggregates/Supplier';
import { SupplierId } from '../../../src/domain/shared/valueobjects/SupplierId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { SupplierCode } from '../../../src/domain/shared/valueobjects/SupplierCode';
import { SupplierName } from '../../../src/domain/shared/valueobjects/SupplierName';
import { SupplierContact } from '../../../src/domain/shared/valueobjects/SupplierContact';
import { SupplierLegalInfo } from '../../../src/domain/shared/valueobjects/SupplierLegalInfo';

describe('SupplierUseCases', () => {
    let mockSupplierRepo: ISupplierRepository;
    let mockEventBus: IEventBus;
    let supplierUseCases: SupplierUseCases;

    const orgId = 'org-1';

    beforeEach(() => {
        mockSupplierRepo = {
            save: vi.fn().mockResolvedValue(undefined),
            findByIdAndOrganizationId: vi.fn(),
            findAllByOrganizationId: vi.fn(),
            findByCodeAndOrganizationId: vi.fn().mockResolvedValue(null),
            findByTaxNumber: vi.fn().mockResolvedValue(null)
        };
        
        mockEventBus = { publishAll: vi.fn().mockResolvedValue(undefined) } as any;

        supplierUseCases = new SupplierUseCases(mockSupplierRepo, mockEventBus);
    });

    it('should create supplier', async () => {
        const id = await supplierUseCases.createSupplier(
            orgId, 'S001', 'Tech Corp', '123', 'a@a.com', '123 Main St', 'TAX1', 'CR1'
        );

        expect(id).toBeDefined();
        expect(mockSupplierRepo.save).toHaveBeenCalled();
        expect(mockEventBus.publishAll).toHaveBeenCalled();
    });

    it('should prevent duplicate code', async () => {
        vi.spyOn(mockSupplierRepo, 'findByCodeAndOrganizationId').mockResolvedValue({} as any);

        await expect(supplierUseCases.createSupplier(
            orgId, 'S001', 'Tech Corp', '123', 'a@a.com', '123 Main St', 'TAX1', 'CR1'
        )).rejects.toThrow('Supplier code must be unique within the organization');
    });

    it('should update supplier', async () => {
        const supplier = Supplier.create(
            new SupplierId('sup-1'),
            new OrganizationId(orgId),
            SupplierCode.create('S001'),
            SupplierName.create('Tech Corp'),
            SupplierContact.create('123', 'a@a.com', '123 Main St'),
            SupplierLegalInfo.create('TAX1', 'CR1')
        );

        vi.spyOn(mockSupplierRepo, 'findByIdAndOrganizationId').mockResolvedValue(supplier);

        await supplierUseCases.updateSupplier(
            orgId, 'sup-1', 'New Tech Corp', '123', 'a@a.com', '123 Main St', 'TAX1', 'CR1'
        );

        expect(supplier.name.value).toBe('New Tech Corp');
        expect(mockSupplierRepo.save).toHaveBeenCalled();
    });
});
