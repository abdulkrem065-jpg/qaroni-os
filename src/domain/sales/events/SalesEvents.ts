import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { SalesOrderId } from '../../shared/valueobjects/SalesOrderId';
import { InvoiceId } from '../../shared/valueobjects/InvoiceId';
import { PaymentId } from '../../shared/valueobjects/PaymentId';
import { ReceiptId } from '../../shared/valueobjects/ReceiptId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchId } from '../../shared/valueobjects/BranchId';

export class SalesOrderCreatedEvent implements IDomainEvent {
    public readonly eventName = 'SalesOrderCreatedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly salesOrderId: SalesOrderId,
        public readonly organizationId: OrganizationId,
        public readonly branchId: BranchId
    ) {}
}

export class SalesCompletedEvent implements IDomainEvent {
    public readonly eventName = 'SalesCompletedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly salesOrderId: SalesOrderId,
        public readonly organizationId: OrganizationId,
        public readonly branchId: BranchId
    ) {}
}

export class SalesCancelledEvent implements IDomainEvent {
    public readonly eventName = 'SalesCancelledEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly salesOrderId: SalesOrderId,
        public readonly organizationId: OrganizationId,
        public readonly branchId: BranchId
    ) {}
}

export class PaymentReceivedEvent implements IDomainEvent {
    public readonly eventName = 'PaymentReceivedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly paymentId: PaymentId,
        public readonly invoiceId: InvoiceId,
        public readonly organizationId: OrganizationId
    ) {}
}

export class PaymentRefundedEvent implements IDomainEvent {
    public readonly eventName = 'PaymentRefundedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly paymentId: PaymentId,
        public readonly invoiceId: InvoiceId,
        public readonly organizationId: OrganizationId
    ) {}
}

export class ReceiptPrintedEvent implements IDomainEvent {
    public readonly eventName = 'ReceiptPrintedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly receiptId: ReceiptId,
        public readonly salesOrderId: SalesOrderId,
        public readonly organizationId: OrganizationId
    ) {}
}
