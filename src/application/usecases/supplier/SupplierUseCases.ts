import { ISupplierRepository } from '../../../domain/supplier/repositories/ISupplierRepository';
import { IEventBus } from '../../ports/IEventBus';
import { Supplier } from '../../../domain/supplier/aggregates/Supplier';
import { SupplierId } from '../../../domain/shared/valueobjects/SupplierId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { SupplierCode } from '../../../domain/shared/valueobjects/SupplierCode';
import { SupplierName } from '../../../domain/shared/valueobjects/SupplierName';
import { SupplierContact } from '../../../domain/shared/valueobjects/SupplierContact';
import { SupplierLegalInfo } from '../../../domain/shared/valueobjects/SupplierLegalInfo';
import { ValidationError } from '../../../domain/shared/errors/ValidationError';
import { randomUUID } from 'crypto';

export class SupplierUseCases {
    constructor(
        private readonly supplierRepo: ISupplierRepository,
        private readonly eventBus: IEventBus
    ) {}

    public async createSupplier(
        organizationId: string,
        code: string,
        name: string,
        phone: string,
        email: string,
        address: string,
        taxNumber: string,
        commercialRegistration: string
    ): Promise<string> {
        const orgId = new OrganizationId(organizationId);
        
        // Ensure code uniqueness
        const existingCode = await this.supplierRepo.findByCodeAndOrganizationId(code, orgId);
        if (existingCode) throw new ValidationError('Supplier code must be unique within the organization');
        
        // Ensure tax number uniqueness if provided
        if (taxNumber && taxNumber.trim().length > 0) {
            const existingTax = await this.supplierRepo.findByTaxNumber(taxNumber);
            if (existingTax) throw new ValidationError('Tax number must be unique');
        }

        const supplierId = new SupplierId(randomUUID());
        const supplier = Supplier.create(
            supplierId,
            orgId,
            SupplierCode.create(code),
            SupplierName.create(name),
            SupplierContact.create(phone, email, address),
            SupplierLegalInfo.create(taxNumber, commercialRegistration)
        );

        await this.supplierRepo.save(supplier);
        await this.eventBus.publishAll(supplier.domainEvents);
        supplier.clearDomainEvents();

        return supplierId.value;
    }

    public async updateSupplier(
        organizationId: string,
        id: string,
        name: string,
        phone: string,
        email: string,
        address: string,
        taxNumber: string,
        commercialRegistration: string
    ): Promise<void> {
        const supplier = await this.getSupplierOrThrow(organizationId, id);

        if (taxNumber && taxNumber.trim().length > 0 && taxNumber !== supplier.legalInfo.taxNumber) {
            const existingTax = await this.supplierRepo.findByTaxNumber(taxNumber);
            if (existingTax) throw new ValidationError('Tax number must be unique');
        }

        supplier.updateDetails(
            SupplierName.create(name),
            SupplierContact.create(phone, email, address),
            SupplierLegalInfo.create(taxNumber, commercialRegistration)
        );

        await this.supplierRepo.save(supplier);
        await this.eventBus.publishAll(supplier.domainEvents);
        supplier.clearDomainEvents();
    }

    public async activateSupplier(organizationId: string, id: string): Promise<void> {
        const supplier = await this.getSupplierOrThrow(organizationId, id);
        supplier.activate();
        await this.supplierRepo.save(supplier);
        await this.eventBus.publishAll(supplier.domainEvents);
        supplier.clearDomainEvents();
    }

    public async suspendSupplier(organizationId: string, id: string): Promise<void> {
        const supplier = await this.getSupplierOrThrow(organizationId, id);
        supplier.suspend();
        await this.supplierRepo.save(supplier);
        await this.eventBus.publishAll(supplier.domainEvents);
        supplier.clearDomainEvents();
    }

    public async archiveSupplier(organizationId: string, id: string): Promise<void> {
        const supplier = await this.getSupplierOrThrow(organizationId, id);
        supplier.archive();
        await this.supplierRepo.save(supplier);
        await this.eventBus.publishAll(supplier.domainEvents);
        supplier.clearDomainEvents();
    }

    public async restoreSupplier(organizationId: string, id: string): Promise<void> {
        const supplier = await this.getSupplierOrThrow(organizationId, id);
        supplier.restore();
        await this.supplierRepo.save(supplier);
        await this.eventBus.publishAll(supplier.domainEvents);
        supplier.clearDomainEvents();
    }

    public async getSupplier(organizationId: string, id: string): Promise<Supplier> {
        return this.getSupplierOrThrow(organizationId, id);
    }

    public async listSuppliers(organizationId: string): Promise<Supplier[]> {
        return this.supplierRepo.findAllByOrganizationId(new OrganizationId(organizationId));
    }

    private async getSupplierOrThrow(organizationId: string, id: string): Promise<Supplier> {
        const supplier = await this.supplierRepo.findByIdAndOrganizationId(new SupplierId(id), new OrganizationId(organizationId));
        if (!supplier) throw new ValidationError('Supplier not found');
        return supplier;
    }
}
