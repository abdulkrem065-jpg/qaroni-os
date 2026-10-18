import { describe, it, expect } from 'vitest';
import { Supplier } from '../../../src/domain/supplier/aggregates/Supplier';
import { SupplierId } from '../../../src/domain/shared/valueobjects/SupplierId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { SupplierCode } from '../../../src/domain/shared/valueobjects/SupplierCode';
import { SupplierName } from '../../../src/domain/shared/valueobjects/SupplierName';
import { SupplierContact } from '../../../src/domain/shared/valueobjects/SupplierContact';
import { SupplierLegalInfo } from '../../../src/domain/shared/valueobjects/SupplierLegalInfo';
import { SupplierStatus } from '../../../src/domain/supplier/types/SupplierTypes';

describe('Supplier Aggregate', () => {
    it('should create a new active supplier', () => {
        const supplier = Supplier.create(
            new SupplierId('sup-1'),
            new OrganizationId('org-1'),
            SupplierCode.create('S001'),
            SupplierName.create('Tech Corp'),
            SupplierContact.create('123', 'a@a.com', '123 Main St'),
            SupplierLegalInfo.create('TAX123', 'CR123')
        );

        expect(supplier.status).toBe(SupplierStatus.ACTIVE);
        expect(supplier.domainEvents.length).toBe(1);
    });

    it('should update details', () => {
        const supplier = Supplier.create(
            new SupplierId('sup-1'),
            new OrganizationId('org-1'),
            SupplierCode.create('S001'),
            SupplierName.create('Tech Corp'),
            SupplierContact.create('123', 'a@a.com', '123 Main St'),
            SupplierLegalInfo.create('TAX123', 'CR123')
        );

        supplier.updateDetails(
            SupplierName.create('New Tech Corp'),
            SupplierContact.create('456', 'b@b.com', '456 Main St'),
            SupplierLegalInfo.create('TAX123', 'CR123')
        );

        expect(supplier.name.value).toBe('New Tech Corp');
        expect(supplier.contact.phone).toBe('456');
    });

    it('should suspend and activate', () => {
        const supplier = Supplier.create(
            new SupplierId('sup-1'),
            new OrganizationId('org-1'),
            SupplierCode.create('S001'),
            SupplierName.create('Tech Corp'),
            SupplierContact.create('123', 'a@a.com', '123 Main St'),
            SupplierLegalInfo.create('TAX123', 'CR123')
        );

        supplier.suspend();
        expect(supplier.status).toBe(SupplierStatus.SUSPENDED);
        expect(supplier.canParticipateInTransactions()).toBe(false);

        supplier.activate();
        expect(supplier.status).toBe(SupplierStatus.ACTIVE);
        expect(supplier.canParticipateInTransactions()).toBe(true);
    });

    it('should archive and prevent updates', () => {
        const supplier = Supplier.create(
            new SupplierId('sup-1'),
            new OrganizationId('org-1'),
            SupplierCode.create('S001'),
            SupplierName.create('Tech Corp'),
            SupplierContact.create('123', 'a@a.com', '123 Main St'),
            SupplierLegalInfo.create('TAX123', 'CR123')
        );

        supplier.archive();
        expect(supplier.status).toBe(SupplierStatus.ARCHIVED);

        expect(() => supplier.updateDetails(
            SupplierName.create('New Tech Corp'),
            SupplierContact.create('456', 'b@b.com', '456 Main St'),
            SupplierLegalInfo.create('TAX123', 'CR123')
        )).toThrow('Operation not allowed on archived supplier');

        expect(() => supplier.activate()).toThrow('Cannot activate an archived supplier');
        expect(() => supplier.suspend()).toThrow('Cannot suspend an archived supplier');
    });
});
