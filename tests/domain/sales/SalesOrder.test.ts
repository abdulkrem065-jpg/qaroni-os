import { describe, it, expect } from 'vitest';
import { SalesOrder } from '../../../src/domain/sales/aggregates/SalesOrder';
import { SalesOrderId } from '../../../src/domain/shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../src/domain/shared/valueobjects/BranchId';
import { UserId } from '../../../src/domain/iam/value-objects/UserId';
import { ProductId } from '../../../src/domain/shared/valueobjects/ProductId';
import { Quantity } from '../../../src/domain/shared/valueobjects/Quantity';
import { MoneyAmount } from '../../../src/domain/shared/valueobjects/MoneyAmount';
import { SalesOrderStatus } from '../../../src/domain/sales/types/SalesTypes';

describe('SalesOrder Aggregate', () => {
    it('should create a draft sales order', () => {
        const order = SalesOrder.create(
            new SalesOrderId('order-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new UserId('user-1')
        );

        expect(order.status).toBe(SalesOrderStatus.DRAFT);
        expect(order.items.length).toBe(0);
        expect(order.domainEvents.length).toBe(1);
    });

    it('should calculate total amount correctly', () => {
        const order = SalesOrder.create(
            new SalesOrderId('order-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new UserId('user-1')
        );

        order.addItem(
            new ProductId('prod-1'),
            Quantity.create(2),
            MoneyAmount.create(100),
            MoneyAmount.create(10),
            MoneyAmount.create(5)
        ); // Total = 2 * 100 - 10 + 5 = 195

        expect(order.totalAmount.value).toBe(195);
    });

    it('should prevent completion if no items', () => {
        const order = SalesOrder.create(
            new SalesOrderId('order-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new UserId('user-1')
        );

        expect(() => order.complete()).toThrow('Cannot complete an empty order');
    });

    it('should prevent modification after completion', () => {
        const order = SalesOrder.create(
            new SalesOrderId('order-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new UserId('user-1')
        );

        order.addItem(
            new ProductId('prod-1'),
            Quantity.create(2),
            MoneyAmount.create(100),
            MoneyAmount.create(0),
            MoneyAmount.create(0)
        );

        order.complete();
        expect(order.status).toBe(SalesOrderStatus.COMPLETED);

        expect(() => order.addItem(
            new ProductId('prod-2'),
            Quantity.create(1),
            MoneyAmount.create(50),
            MoneyAmount.create(0),
            MoneyAmount.create(0)
        )).toThrow('Operation only allowed on DRAFT orders');
    });
});
