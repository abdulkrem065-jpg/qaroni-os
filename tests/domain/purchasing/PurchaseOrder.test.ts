import { describe, it, expect } from 'vitest';
import { PurchaseOrder } from '../../../src/domain/purchasing/aggregates/PurchaseOrder';
import { PurchaseOrderId } from '../../../src/domain/shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../src/domain/shared/valueobjects/BranchId';
import { UserId } from '../../../src/domain/iam/value-objects/UserId';
import { SupplierId } from '../../../src/domain/shared/valueobjects/SupplierId';
import { ProductId } from '../../../src/domain/shared/valueobjects/ProductId';
import { Quantity } from '../../../src/domain/shared/valueobjects/Quantity';
import { MoneyAmount } from '../../../src/domain/shared/valueobjects/MoneyAmount';
import { PurchaseStatus } from '../../../src/domain/purchasing/types/PurchasingTypes';

describe('PurchaseOrder Aggregate', () => {
    it('should create a draft purchase order', () => {
        const order = PurchaseOrder.create(
            new PurchaseOrderId('po-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new SupplierId('sup-1'),
            new UserId('user-1')
        );

        expect(order.status).toBe(PurchaseStatus.DRAFT);
        expect(order.items.length).toBe(0);
        expect(order.domainEvents.length).toBe(1);
    });

    it('should calculate total amount correctly', () => {
        const order = PurchaseOrder.create(
            new PurchaseOrderId('po-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new SupplierId('sup-1'),
            new UserId('user-1')
        );

        order.addItem(new ProductId('prod-1'), Quantity.create(5), MoneyAmount.create(100)); // Total = 500
        order.addItem(new ProductId('prod-2'), Quantity.create(2), MoneyAmount.create(50));  // Total = 100

        expect(order.totalAmount.value).toBe(600);
    });

    it('should prevent approval if no items', () => {
        const order = PurchaseOrder.create(
            new PurchaseOrderId('po-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new SupplierId('sup-1'),
            new UserId('user-1')
        );

        expect(() => order.approve()).toThrow('Cannot approve an empty purchase order');
    });

    it('should transition to completed when all items are received', () => {
        const order = PurchaseOrder.create(
            new PurchaseOrderId('po-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new SupplierId('sup-1'),
            new UserId('user-1')
        );

        order.addItem(new ProductId('prod-1'), Quantity.create(10), MoneyAmount.create(100));
        order.approve();

        order.receiveItemQuantity(new ProductId('prod-1'), Quantity.create(10));
        order.markAsReceived();

        expect(order.status).toBe(PurchaseStatus.COMPLETED);
    });
});
