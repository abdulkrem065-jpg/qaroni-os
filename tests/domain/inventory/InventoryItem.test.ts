import { describe, it, expect } from 'vitest';
import { InventoryItem } from '../../../src/domain/inventory/aggregates/InventoryItem';
import { InventoryItemId } from '../../../src/domain/shared/valueobjects/InventoryItemId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../src/domain/shared/valueobjects/BranchId';
import { ProductId } from '../../../src/domain/shared/valueobjects/ProductId';
import { ReorderLevel } from '../../../src/domain/shared/valueobjects/ReorderLevel';
import { Quantity } from '../../../src/domain/shared/valueobjects/Quantity';

describe('InventoryItem Aggregate', () => {
    it('should receive stock and increase quantity', () => {
        const item = InventoryItem.create(
            new InventoryItemId('inv-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new ProductId('prod-1'),
            ReorderLevel.create(10)
        );

        item.receiveStock(Quantity.create(50), false);
        expect(item.quantity.value).toBe(50);
        expect(item.domainEvents.length).toBe(1);
    });

    it('should prevent receiving stock for archived product', () => {
        const item = InventoryItem.create(
            new InventoryItemId('inv-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new ProductId('prod-1'),
            ReorderLevel.create(10)
        );

        expect(() => item.receiveStock(Quantity.create(50), true)).toThrow('Archived products cannot receive stock');
    });

    it('should prevent negative stock when issuing', () => {
        const item = InventoryItem.create(
            new InventoryItemId('inv-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new ProductId('prod-1'),
            ReorderLevel.create(10)
        );

        item.receiveStock(Quantity.create(20), false);
        
        expect(() => item.issueStock(Quantity.create(30))).toThrow('Insufficient available stock to issue');
    });

    it('should emit low stock event', () => {
        const item = InventoryItem.create(
            new InventoryItemId('inv-1'),
            new OrganizationId('org-1'),
            new BranchId('branch-1'),
            new ProductId('prod-1'),
            ReorderLevel.create(10)
        );

        item.receiveStock(Quantity.create(20), false);
        item.issueStock(Quantity.create(15)); // Remaining: 5 (<= 10)
        
        const lowStockEvent = item.domainEvents.find(e => e.eventName === 'InventoryLowEvent');
        expect(lowStockEvent).toBeDefined();
    });
});
