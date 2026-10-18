import { ISalesOrderRepository } from '../../../domain/sales/repositories/ISalesOrderRepository';
import { ISalesInvoiceRepository } from '../../../domain/sales/repositories/ISalesInvoiceRepository';
import { IPaymentRepository } from '../../../domain/sales/repositories/IPaymentRepository';
import { IReceiptRepository } from '../../../domain/sales/repositories/IReceiptRepository';
import { IEventBus } from '../../ports/IEventBus';
import { InventoryUseCases } from '../inventory/InventoryUseCases';
import { SalesOrder } from '../../../domain/sales/aggregates/SalesOrder';
import { SalesInvoice } from '../../../domain/sales/aggregates/SalesInvoice';
import { Payment } from '../../../domain/sales/aggregates/Payment';
import { Receipt } from '../../../domain/sales/aggregates/Receipt';
import { SalesOrderId } from '../../../domain/shared/valueobjects/SalesOrderId';
import { InvoiceId } from '../../../domain/shared/valueobjects/InvoiceId';
import { PaymentId } from '../../../domain/shared/valueobjects/PaymentId';
import { ReceiptId } from '../../../domain/shared/valueobjects/ReceiptId';
import { OrganizationId } from '../../../domain/shared/valueobjects/OrganizationId';
import { BranchId } from '../../../domain/shared/valueobjects/BranchId';
import { UserId } from '../../../domain/iam/value-objects/UserId';
import { ProductId } from '../../../domain/shared/valueobjects/ProductId';
import { Quantity } from '../../../domain/shared/valueobjects/Quantity';
import { MoneyAmount } from '../../../domain/shared/valueobjects/MoneyAmount';
import { InvoiceNumber } from '../../../domain/shared/valueobjects/InvoiceNumber';
import { ReceiptNumber } from '../../../domain/shared/valueobjects/ReceiptNumber';
import { PaymentMethod, SalesOrderStatus, InvoiceStatus, PaymentStatus } from '../../../domain/sales/types/SalesTypes';
import { ValidationError } from '../../../domain/shared/errors/ValidationError';
import { randomUUID } from 'crypto';

export class SalesUseCases {
    constructor(
        private readonly salesOrderRepo: ISalesOrderRepository,
        private readonly invoiceRepo: ISalesInvoiceRepository,
        private readonly paymentRepo: IPaymentRepository,
        private readonly receiptRepo: IReceiptRepository,
        private readonly inventoryUseCases: InventoryUseCases,
        private readonly eventBus: IEventBus
    ) {}

    public async createSalesOrder(organizationId: string, branchId: string, staffId: string): Promise<string> {
        const orderId = new SalesOrderId(randomUUID());
        const order = SalesOrder.create(orderId, new OrganizationId(organizationId), new BranchId(branchId), new UserId(staffId));
        await this.salesOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
        return orderId.value;
    }

    public async addSalesItem(organizationId: string, orderId: string, productId: string, quantity: number, unitPrice: number, discount: number = 0, tax: number = 0): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        // Reserve stock
        await this.inventoryUseCases.reserveStock(organizationId, order.branchId.value, productId, quantity);

        order.addItem(
            new ProductId(productId),
            Quantity.create(quantity),
            MoneyAmount.create(unitPrice),
            MoneyAmount.create(discount),
            MoneyAmount.create(tax)
        );

        await this.salesOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
    }

    public async removeSalesItem(organizationId: string, orderId: string, itemId: string): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        const item = order.items.find(i => i.id === itemId);
        if (!item) throw new ValidationError('Item not found');

        // Release reserved stock
        await this.inventoryUseCases.releaseReservation(organizationId, order.branchId.value, item.productId.value, item.quantity.value);

        order.removeItem(itemId);

        await this.salesOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
    }

    public async updateSalesItem(organizationId: string, orderId: string, itemId: string, newQuantity: number, unitPrice: number, discount: number = 0, tax: number = 0): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        const item = order.items.find(i => i.id === itemId);
        if (!item) throw new ValidationError('Item not found');

        const qtyDiff = newQuantity - item.quantity.value;
        if (qtyDiff > 0) {
            await this.inventoryUseCases.reserveStock(organizationId, order.branchId.value, item.productId.value, qtyDiff);
        } else if (qtyDiff < 0) {
            await this.inventoryUseCases.releaseReservation(organizationId, order.branchId.value, item.productId.value, Math.abs(qtyDiff));
        }

        order.updateItem(
            itemId,
            Quantity.create(newQuantity),
            MoneyAmount.create(unitPrice),
            MoneyAmount.create(discount),
            MoneyAmount.create(tax)
        );

        await this.salesOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
    }

    public async cancelSalesOrder(organizationId: string, orderId: string): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        // Release all reserved stock
        for (const item of order.items) {
            await this.inventoryUseCases.releaseReservation(organizationId, order.branchId.value, item.productId.value, item.quantity.value);
        }

        order.cancel();

        await this.salesOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
    }

    public async completeSalesOrder(organizationId: string, orderId: string, userId: string): Promise<void> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        order.complete();

        // Release reservation and issue stock permanently
        for (const item of order.items) {
            await this.inventoryUseCases.releaseReservation(organizationId, order.branchId.value, item.productId.value, item.quantity.value);
            await this.inventoryUseCases.issueStock(organizationId, order.branchId.value, item.productId.value, item.quantity.value, userId, `Sale Order ${order.id.value}`);
        }

        await this.salesOrderRepo.save(order);
        await this.eventBus.publishAll(order.domainEvents);
        order.clearDomainEvents();
    }

    public async generateInvoice(organizationId: string, orderId: string): Promise<string> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        if (order.status !== SalesOrderStatus.COMPLETED) {
            throw new ValidationError('Can only generate invoice for completed orders');
        }

        const existingInvoice = await this.invoiceRepo.findBySalesOrderId(order.id);
        if (existingInvoice) {
            throw new ValidationError('Invoice already exists for this order');
        }

        // Generate unique invoice number (simplistic logic)
        const num = `INV-${Date.now()}`;
        
        const invoiceId = new InvoiceId(randomUUID());
        const invoice = SalesInvoice.create(
            invoiceId,
            order.organizationId,
            order.id,
            InvoiceNumber.create(num),
            order.totalAmount
        );

        await this.invoiceRepo.save(invoice);
        await this.eventBus.publishAll(invoice.domainEvents);
        invoice.clearDomainEvents();
        return invoiceId.value;
    }

    public async registerPayment(organizationId: string, invoiceId: string, amount: number, method: PaymentMethod): Promise<string> {
        const invoice = await this.getInvoiceOrThrow(organizationId, invoiceId);
        
        const paymentAmount = MoneyAmount.create(amount);
        invoice.applyPayment(paymentAmount);

        const paymentId = new PaymentId(randomUUID());
        const payment = Payment.create(
            paymentId,
            new OrganizationId(organizationId),
            invoice.id,
            paymentAmount,
            method
        );

        await this.invoiceRepo.save(invoice);
        await this.paymentRepo.save(payment);
        await this.eventBus.publishAll(invoice.domainEvents);
        await this.eventBus.publishAll(payment.domainEvents);
        invoice.clearDomainEvents();
        payment.clearDomainEvents();

        return paymentId.value;
    }

    public async refundPayment(organizationId: string, paymentId: string): Promise<void> {
        const payment = await this.paymentRepo.findByIdAndOrganizationId(new PaymentId(paymentId), new OrganizationId(organizationId));
        if (!payment) throw new ValidationError('Payment not found');

        const invoice = await this.getInvoiceOrThrow(organizationId, payment.invoiceId.value);
        
        payment.refund();
        invoice.applyRefund(payment.amount);

        await this.paymentRepo.save(payment);
        await this.invoiceRepo.save(invoice);
        await this.eventBus.publishAll(payment.domainEvents);
        await this.eventBus.publishAll(invoice.domainEvents);
        payment.clearDomainEvents();
        invoice.clearDomainEvents();
    }

    public async printReceipt(organizationId: string, orderId: string): Promise<string> {
        const order = await this.getOrderOrThrow(organizationId, orderId);
        
        const num = `REC-${Date.now()}`;
        const receiptId = new ReceiptId(randomUUID());
        
        const receipt = Receipt.create(
            receiptId,
            new OrganizationId(organizationId),
            order.id,
            ReceiptNumber.create(num)
        );

        await this.receiptRepo.save(receipt);
        await this.eventBus.publishAll(receipt.domainEvents);
        receipt.clearDomainEvents();
        return receiptId.value;
    }

    public async getOrder(organizationId: string, orderId: string): Promise<SalesOrder> {
        return this.getOrderOrThrow(organizationId, orderId);
    }

    public async listOrders(organizationId: string): Promise<SalesOrder[]> {
        return this.salesOrderRepo.findAllByOrganizationId(new OrganizationId(organizationId));
    }

    public async getInvoice(organizationId: string, invoiceId: string): Promise<SalesInvoice> {
        return this.getInvoiceOrThrow(organizationId, invoiceId);
    }

    private async getOrderOrThrow(organizationId: string, orderId: string): Promise<SalesOrder> {
        const order = await this.salesOrderRepo.findByIdAndOrganizationId(new SalesOrderId(orderId), new OrganizationId(organizationId));
        if (!order) throw new ValidationError('Sales order not found');
        return order;
    }

    private async getInvoiceOrThrow(organizationId: string, invoiceId: string): Promise<SalesInvoice> {
        const invoice = await this.invoiceRepo.findByIdAndOrganizationId(new InvoiceId(invoiceId), new OrganizationId(organizationId));
        if (!invoice) throw new ValidationError('Invoice not found');
        return invoice;
    }
}
