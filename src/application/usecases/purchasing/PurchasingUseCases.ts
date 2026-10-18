import { IPurchaseOrderRepository } from '../../../domain/purchasing/repositories/IPurchaseOrderRepository';
import { IPurchaseInvoiceRepository } from '../../../domain/purchasing/repositories/IPurchaseInvoiceRepository';
import { IGoodsReceiptRepository } from '../../../domain/purchasing/repositories/IGoodsReceiptRepository';
import { IEventBus } from '../../ports/IEventBus';
import { InventoryUseCases } from '../inventory/InventoryUseCases';
import { PurchaseOrder } from '../../../domain/purchasing/aggregates/PurchaseOrder';
import { PurchaseInvoice } from '../../../domain/purchasing/aggregates/PurchaseInvoice';
import { GoodsReceipt, GoodsReceiptItem } from '../../../domain/purchasing/aggregates/GoodsReceipt';
import { PurchaseOrderId } from '../../../domain/shared/valueobjects/PurchaseOrderId';
import { PurchaseInvoiceId } from '../../../domain/shared/valueobjects/PurchaseInvoiceId';
import { GoodsReceiptId } from '../../../domain/shared/valueobjects/GoodsReceiptId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../domain/shared/valueobjects/BranchId';
import { UserId } from '../../../domain/iam/value-objects/UserId';
import { ProductId } from '../../../domain/shared/valueobjects/ProductId';
import { Quantity } from '../../../domain/shared/valueobjects/Quantity';
import { MoneyAmount } from '../../../domain/shared/valueobjects/MoneyAmount';
import { SupplierId } from '../../../domain/shared/valueobjects/SupplierId';
import { ISupplierRepository } from '../../../domain/supplier/repositories/ISupplierRepository';
import { SupplierStatus } from '../../../domain/supplier/types/SupplierTypes';
import { PurchaseInvoiceNumber } from '../../../domain/shared/valueobjects/PurchaseInvoiceNumber';
import { GoodsReceiptNumber } from '../../../domain/shared/valueobjects/GoodsReceiptNumber';
import { PurchaseTotal } from '../../../domain/shared/valueobjects/PurchaseTotal';
import { PurchaseStatus } from '../../../domain/purchasing/types/PurchasingTypes';
import { ValidationError } from '../../../domain/shared/errors/ValidationError';
import { randomUUID } from 'crypto';

export class PurchasingUseCases {
    constructor(
        private readonly purchaseOrderRepo: IPurchaseOrderRepository,
        private readonly purchaseInvoiceRepo: IPurchaseInvoiceRepository,
        private readonly goodsReceiptRepo: IGoodsReceiptRepository,
        private readonly inventoryUseCases: InventoryUseCases,
        private readonly eventBus: IEventBus,
        private readonly supplierRepo: ISupplierRepository
    ) {}

    public async createPurchaseOrder(organizationId: string, branchId: string, supplierIdStr: string, userId: string): Promise<string> {
        const supplierId = new SupplierId(supplierIdStr);
        const supplier = await this.supplierRepo.findByIdAndOrganizationId(supplierId, new OrganizationId(organizationId));
        if (!supplier) throw new ValidationError('Supplier not found');
        if (supplier.status === SupplierStatus.ARCHIVED) throw new ValidationError('Cannot create purchase order for archived supplier');
        if (supplier.status === SupplierStatus.SUSPENDED) throw new ValidationError('Cannot create purchase order for suspended supplier');
        const orderId = new PurchaseOrderId(randomUUID());
        const order = PurchaseOrder.create(
            orderId,
            new OrganizationId(organizationId),
            new BranchId(branchId),
            supplierId,
            new UserId(userId)
        );
        
        await this.purchaseOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
        
        return orderId.value;
    }

    public async addPurchaseItem(organizationId: string, orderId: string, productId: string, quantity: number, unitPrice: number): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        order.addItem(new ProductId(productId), Quantity.create(quantity), MoneyAmount.create(unitPrice));
        
        await this.purchaseOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
    }

    public async updatePurchaseItem(organizationId: string, orderId: string, itemId: string, quantity: number, unitPrice: number): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        order.updateItem(itemId, Quantity.create(quantity), MoneyAmount.create(unitPrice));
        
        await this.purchaseOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
    }

    public async removePurchaseItem(organizationId: string, orderId: string, itemId: string): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        order.removeItem(itemId);
        
        await this.purchaseOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
    }

    public async approvePurchaseOrder(organizationId: string, orderId: string): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        order.approve();
        
        await this.purchaseOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
    }

    public async cancelPurchaseOrder(organizationId: string, orderId: string): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        order.cancel();
        
        await this.purchaseOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
    }

    public async receiveGoods(organizationId: string, orderId: string, userId: string, itemsToReceive: { productId: string, quantity: number }[]): Promise<string> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        if (order.status !== PurchaseStatus.APPROVED && order.status !== PurchaseStatus.RECEIVED) {
            throw new ValidationError('Purchase order must be approved before receiving goods');
        }

        const receiptItems: GoodsReceiptItem[] = [];
        
        for (const item of itemsToReceive) {
            const productId = new ProductId(item.productId);
            const qty = Quantity.create(item.quantity);
            
            order.receiveItemQuantity(productId, qty);
            receiptItems.push(new GoodsReceiptItem(productId, qty));
            
            // Add inventory
            await this.inventoryUseCases.receiveStock(
                organizationId,
                order.branchId.value,
                item.productId,
                item.quantity,
                userId,
                `PO Receipt: ${order.id.value}`
            );
        }
        
        order.markAsReceived(); // evaluate if COMPLETED or partially RECEIVED

        const receiptId = new GoodsReceiptId(randomUUID());
        const receipt = GoodsReceipt.create(
            receiptId,
            order.organizationId,
            order.branchId,
            order.id,
            GoodsReceiptNumber.create(`GR-${Date.now()}`),
            new UserId(userId),
            receiptItems
        );

        await this.purchaseOrderRepo.save(order);
        await this.goodsReceiptRepo.save(receipt);
        
        await this.eventBus.publishAll(order.domainEvents);
        await this.eventBus.publishAll(receipt.domainEvents);
        
        order.clearDomainEvents();
        receipt.clearDomainEvents();
        
        return receiptId.value;
    }

    public async generatePurchaseInvoice(organizationId: string, orderId: string): Promise<string> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        if (order.status !== PurchaseStatus.COMPLETED && order.status !== PurchaseStatus.RECEIVED) {
            throw new ValidationError('Cannot generate invoice before receiving goods');
        }

        const existingInvoice = await this.purchaseInvoiceRepo.findByPurchaseOrderId(order.id);
        if (existingInvoice) {
            throw new ValidationError('Invoice already exists for this purchase order');
        }

        const invoiceId = new PurchaseInvoiceId(randomUUID());
        const invoice = PurchaseInvoice.create(
            invoiceId,
            order.organizationId,
            order.id,
            PurchaseInvoiceNumber.create(`PI-${Date.now()}`),
            order.totalAmount
        );

        await this.purchaseInvoiceRepo.save(invoice);
        await this.eventBus.publishAll(invoice.domainEvents);
        invoice.clearDomainEvents();
        
        return invoiceId.value;
    }

    public async registerPurchasePayment(organizationId: string, orderId: string, amount: number): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        const invoice = await this.purchaseInvoiceRepo.findByPurchaseOrderId(order.id);
        if (!invoice) throw new ValidationError('Invoice not found for this purchase order');

        invoice.applyPayment(PurchaseTotal.create(amount));

        await this.purchaseInvoiceRepo.save(invoice);
        await this.eventBus.publishAll(invoice.domainEvents);
        invoice.clearDomainEvents();
    }

    public async getPurchaseOrder(organizationId: string, orderId: string): Promise<PurchaseOrder> {
        return this.getOrderOrThrow(organizationId, orderId);
    }

    public async listPurchaseOrders(organizationId: string): Promise<PurchaseOrder[]> {
        return this.purchaseOrderRepo.findAllByOrganizationId(new OrganizationId(organizationId));
    }

    private async getOrderOrThrow(organizationId: string, orderId: string): Promise<PurchaseOrder> {
        const order = await this.purchaseOrderRepo.findByIdAndOrganizationId(new PurchaseOrderId(orderId), new OrganizationId(organizationId));
        if (!order) throw new ValidationError('Purchase order not found');
        return order;
    }
}
