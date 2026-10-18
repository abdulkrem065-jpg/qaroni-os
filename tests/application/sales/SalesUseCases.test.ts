import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SalesUseCases } from '../../../src/application/usecases/sales/SalesUseCases';
import { ISalesOrderRepository } from '../../../src/domain/sales/repositories/ISalesOrderRepository';
import { ISalesInvoiceRepository } from '../../../src/domain/sales/repositories/ISalesInvoiceRepository';
import { IPaymentRepository } from '../../../src/domain/sales/repositories/IPaymentRepository';
import { IReceiptRepository } from '../../../src/domain/sales/repositories/IReceiptRepository';
import { IEventBus } from '../../../src/application/ports/IEventBus';
import { InventoryUseCases } from '../../../src/application/usecases/inventory/InventoryUseCases';
import { SalesOrder } from '../../../src/domain/sales/aggregates/SalesOrder';
import { SalesOrderId } from '../../../src/domain/shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../../src/domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../src/domain/shared/valueobjects/BranchId';
import { UserId } from '../../../src/domain/iam/value-objects/UserId';

describe('SalesUseCases', () => {
    let mockSalesOrderRepo: ISalesOrderRepository;
    let mockInvoiceRepo: ISalesInvoiceRepository;
    let mockPaymentRepo: IPaymentRepository;
    let mockReceiptRepo: IReceiptRepository;
    let mockInventoryUseCases: InventoryUseCases;
    let mockEventBus: IEventBus;
    let salesUseCases: SalesUseCases;

    const orgId = 'org-1';
    const branchId = 'branch-1';
    const staffId = 'user-1';
    const orderId = 'order-1';

    beforeEach(() => {
        mockSalesOrderRepo = {
            save: vi.fn().mockResolvedValue(undefined),
            findByIdAndOrganizationId: vi.fn(),
            findAllByOrganizationId: vi.fn()
        } as any;
        
        mockInvoiceRepo = { save: vi.fn(), findByIdAndOrganizationId: vi.fn(), findBySalesOrderId: vi.fn(), findByInvoiceNumber: vi.fn() } as any;
        mockPaymentRepo = { save: vi.fn(), findByIdAndOrganizationId: vi.fn(), findByInvoiceId: vi.fn() } as any;
        mockReceiptRepo = { save: vi.fn(), findByIdAndOrganizationId: vi.fn(), findBySalesOrderId: vi.fn(), findByReceiptNumber: vi.fn() } as any;

        mockInventoryUseCases = {
            reserveStock: vi.fn().mockResolvedValue(undefined),
            releaseReservation: vi.fn().mockResolvedValue(undefined),
            issueStock: vi.fn().mockResolvedValue(undefined)
        } as any;

        mockEventBus = { publishAll: vi.fn().mockResolvedValue(undefined) } as any;

        salesUseCases = new SalesUseCases(
            mockSalesOrderRepo, mockInvoiceRepo, mockPaymentRepo, mockReceiptRepo, mockInventoryUseCases, mockEventBus
        );
    });

    it('should reserve stock when adding an item', async () => {
        const order = SalesOrder.create(new SalesOrderId(orderId), new OrganizationId(orgId), new BranchId(branchId), new UserId(staffId));
        vi.spyOn(mockSalesOrderRepo, 'findByIdAndOrganizationId').mockResolvedValue(order);

        await salesUseCases.addSalesItem(orgId, orderId, 'prod-1', 5, 100);

        expect(mockInventoryUseCases.reserveStock).toHaveBeenCalledWith(orgId, branchId, 'prod-1', 5);
        expect(order.items.length).toBe(1);
        expect(mockSalesOrderRepo.save).toHaveBeenCalledWith(order);
    });

    it('should issue stock and release reservation on complete', async () => {
        const order = SalesOrder.create(new SalesOrderId(orderId), new OrganizationId(orgId), new BranchId(branchId), new UserId(staffId));
        vi.spyOn(mockSalesOrderRepo, 'findByIdAndOrganizationId').mockResolvedValue(order);

        await salesUseCases.addSalesItem(orgId, orderId, 'prod-1', 5, 100);
        
        await salesUseCases.completeSalesOrder(orgId, orderId, staffId);

        expect(mockInventoryUseCases.releaseReservation).toHaveBeenCalledWith(orgId, branchId, 'prod-1', 5);
        expect(mockInventoryUseCases.issueStock).toHaveBeenCalledWith(orgId, branchId, 'prod-1', 5, staffId, expect.any(String));
        expect(order.status).toBe('COMPLETED');
    });
});
