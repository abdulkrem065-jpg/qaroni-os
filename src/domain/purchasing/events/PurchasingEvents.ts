import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { PurchaseOrderId } from '../../shared/valueobjects/PurchaseOrderId';
import { GoodsReceiptId } from '../../shared/valueobjects/GoodsReceiptId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchId } from '../../shared/valueobjects/BranchId';

export class PurchaseOrderCreatedEvent implements IDomainEvent {
    public readonly eventName = 'PurchaseOrderCreatedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly purchaseOrderId: PurchaseOrderId,
        public readonly organizationId: OrganizationId,
        public readonly branchId: BranchId
    ) {}
}

export class PurchaseOrderApprovedEvent implements IDomainEvent {
    public readonly eventName = 'PurchaseOrderApprovedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly purchaseOrderId: PurchaseOrderId,
        public readonly organizationId: OrganizationId,
        public readonly branchId: BranchId
    ) {}
}

export class GoodsReceivedEvent implements IDomainEvent {
    public readonly eventName = 'GoodsReceivedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly goodsReceiptId: GoodsReceiptId,
        public readonly purchaseOrderId: PurchaseOrderId,
        public readonly organizationId: OrganizationId,
        public readonly branchId: BranchId
    ) {}
}

export class PurchaseCompletedEvent implements IDomainEvent {
    public readonly eventName = 'PurchaseCompletedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly purchaseOrderId: PurchaseOrderId,
        public readonly organizationId: OrganizationId,
        public readonly branchId: BranchId
    ) {}
}

export class PurchaseCancelledEvent implements IDomainEvent {
    public readonly eventName = 'PurchaseCancelledEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly purchaseOrderId: PurchaseOrderId,
        public readonly organizationId: OrganizationId,
        public readonly branchId: BranchId
    ) {}
}
