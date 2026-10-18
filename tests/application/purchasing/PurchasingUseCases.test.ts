import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PurchasingUseCases } from '../../../src/application/usecases/purchasing/PurchasingUseCases';
import { IPurchaseOrderRepository } from '../../../src/domain/purchasing/repositories/IPurchaseOrderRepository';
import { IPurchaseInvoiceRepository } from '../../../src/domain/purchasing/repositories/IPurchaseInvoiceRepository';
import { IGoodsReceiptRepository } from '../../../src/domain/purchasing/repositories/IGoodsReceiptRepository';
import { IEventBus } from '../../../src/application/ports/IEventBus';
import { InventoryUseCases } from '../../../src/application/usecases/inventory/InventoryUseCases';
import { PurchaseOrder } from '../../../src/domain/purchasing/aggregates/PurchaseOrder';
import { PurchaseOrderId } from '../../../src/domain/shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../src/domain/shared/valueobjects/BranchId';
import { UserId } from '../../../src/domain/iam/value-objects/UserId';
import { SupplierId } from '../../../src/domain/shared/valueobjects/SupplierId';
import { ISupplierRepository } from '../../../src/domain/supplier/repositories/ISupplierRepository';
import { ProductId } from '../../../src/domain/shared/valueobjects/ProductId';
import { Quantity } from '../../../src/domain/shared/valueobjects/Quantity';
import { MoneyAmount } from '../../../src/domain/shared/valueobjects/MoneyAmount';

describe('PurchasingUseCases', () => {
    let mockOrderRepo: IPurchaseOrderRepository;
    let mockInvoiceRepo: IPurchaseInvoiceRepository;
    let mockReceiptRepo: IGoodsReceiptRepository;
    let mockInventoryUseCases: InventoryUseCases;
    let mockEventBus: IEventBus;
    let mockSupplierRepo: ISupplierRepository;
    let purchasingUseCases: PurchasingUseCases;

    const orgId = 'org-1';
    const branchId = 'branch-1';
    const userId = 'user-1';
    const orderId = 'po-1';

    beforeEach(() => {
        mockOrderRepo = {
            save: vi.fn().mockResolvedValue(undefined),
            findByIdAndOrganizationId: vi.fn(),
            findAllByOrganizationId: vi.fn()
        } as any;
        
        mockInvoiceRepo = { save: vi.fn(), findByIdAndOrganizationId: vi.fn(), findByPurchaseOrderId: vi.fn() } as any;
        mockReceiptRepo = { save: vi.fn(), findByIdAndOrganizationId: vi.fn(), findByPurchaseOrderId: vi.fn() } as any;

        mockInventoryUseCases = {
            receiveStock: vi.fn().mockResolvedValue(undefined)
        } as any;

        mockEventBus = { publishAll: vi.fn().mockResolvedValue(undefined) } as any;
        mockSupplierRepo = { findByIdAndOrganizationId: vi.fn().mockResolvedValue({ status: 'ACTIVE' }) } as any;

        purchasingUseCases = new PurchasingUseCases(
            mockOrderRepo, mockInvoiceRepo, mockReceiptRepo, mockInventoryUseCases, mockEventBus, mockSupplierRepo
        );
    });

    it('should receive goods and update inventory', async () => {
        const order = PurchaseOrder.create(
            new PurchaseOrderId(orderId), 
            new OrganizationId(orgId), 
            new BranchId(branchId), 
            new SupplierId('sup-1'), 
            new UserId(userId)
        );
        order.addItem(new ProductId('prod-1'), Quantity.create(10), MoneyAmount.create(100));
        order.approve();

        vi.spyOn(mockOrderRepo, 'findByIdAndOrganizationId').mockResolvedValue(order);

        await purchasingUseCases.receiveGoods(orgId, orderId, userId, [
            { productId: 'prod-1', quantity: 5 }
        ]);

        expect(mockInventoryUseCases.receiveStock).toHaveBeenCalledWith(
            orgId, branchId, 'prod-1', 5, userId, expect.any(String)
        );
        expect(order.status).toBe('RECEIVED'); // Partial receive
        expect(mockOrderRepo.save).toHaveBeenCalled();
        expect(mockReceiptRepo.save).toHaveBeenCalled();
    });

    it('should complete order when fully received', async () => {
        const order = PurchaseOrder.create(
            new PurchaseOrderId(orderId), 
            new OrganizationId(orgId), 
            new BranchId(branchId), 
            new SupplierId('sup-1'), 
            new UserId(userId)
        );
        order.addItem(new ProductId('prod-1'), Quantity.create(10), MoneyAmount.create(100));
        order.approve();

        vi.spyOn(mockOrderRepo, 'findByIdAndOrganizationId').mockResolvedValue(order);

        await purchasingUseCases.receiveGoods(orgId, orderId, userId, [
            { productId: 'prod-1', quantity: 10 }
        ]);

        expect(order.status).toBe('COMPLETED');
    });

    it('should throw when receiving unapproved order', async () => {
        const order = PurchaseOrder.create(
            new PurchaseOrderId(orderId), 
            new OrganizationId(orgId), 
            new BranchId(branchId), 
            new SupplierId('sup-1'), 
            new UserId(userId)
        );
        
        vi.spyOn(mockOrderRepo, 'findByIdAndOrganizationId').mockResolvedValue(order);

        await expect(purchasingUseCases.receiveGoods(orgId, orderId, userId, [
            { productId: 'prod-1', quantity: 10 }
        ])).rejects.toThrow('Purchase order must be approved before receiving goods');
    });
});
