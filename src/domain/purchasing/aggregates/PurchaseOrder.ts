import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { PurchaseOrderId } from '../../shared/valueobjects/PurchaseOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { UserId } from '../../iam/value-objects/UserId';
import { ProductId } from '../../shared/valueobjects/ProductId';
import { Quantity } from '../../shared/valueobjects/Quantity';
import { PurchaseTotal } from '../../shared/valueobjects/PurchaseTotal';
import { MoneyAmount } from '../../shared/valueobjects/MoneyAmount';
import { SupplierId } from '../../shared/valueobjects/SupplierId';
import { PurchaseStatus } from '../types/PurchasingTypes';
import { ValidationError } from '../../shared/errors/ValidationError';
import { PurchaseOrderCreatedEvent, PurchaseOrderApprovedEvent, PurchaseCompletedEvent, PurchaseCancelledEvent } from '../events/PurchasingEvents';
import { randomUUID } from 'crypto';

export class PurchaseOrderItem {
    constructor(
        public readonly id: string,
        public readonly productId: ProductId,
        public quantity: Quantity,
        public unitPrice: MoneyAmount,
        public receivedQuantity: Quantity = Quantity.create(0)
    ) {}

    public get total(): PurchaseTotal {
        return PurchaseTotal.create(this.unitPrice.value * this.quantity.value);
    }
}

export class PurchaseOrder extends AggregateRoot<PurchaseOrderId> {
    private readonly _organizationId: OrganizationId;
    private readonly _branchId: BranchId;
    private readonly _supplierId: SupplierId;
    private readonly _createdBy: UserId;
    private _items: PurchaseOrderItem[];
    private _status: PurchaseStatus;
    private readonly _createdAt: Date;

    private constructor(
        id: PurchaseOrderId,
        organizationId: OrganizationId,
        branchId: BranchId,
        supplierId: SupplierId,
        createdBy: UserId,
        items: PurchaseOrderItem[],
        status: PurchaseStatus,
        createdAt: Date
    ) {
        super(id);
        this._organizationId = organizationId;
        this._branchId = branchId;
        this._supplierId = supplierId;
        this._createdBy = createdBy;
        this._items = items;
        this._status = status;
        this._createdAt = createdAt;
    }

    public static create(
        id: PurchaseOrderId,
        organizationId: OrganizationId,
        branchId: BranchId,
        supplierId: SupplierId,
        createdBy: UserId
    ): PurchaseOrder {
        const order = new PurchaseOrder(id, organizationId, branchId, supplierId, createdBy, [], PurchaseStatus.DRAFT, new Date());
        order.addDomainEvent(new PurchaseOrderCreatedEvent(id, organizationId, branchId));
        return order;
    }

    public static load(
        id: PurchaseOrderId,
        organizationId: OrganizationId,
        branchId: BranchId,
        supplierId: SupplierId,
        createdBy: UserId,
        items: PurchaseOrderItem[],
        status: PurchaseStatus,
        createdAt: Date
    ): PurchaseOrder {
        return new PurchaseOrder(id, organizationId, branchId, supplierId, createdBy, items, status, createdAt);
    }

    public addItem(productId: ProductId, quantity: Quantity, unitPrice: MoneyAmount): void {
        this.verifyDraft();
        const existingItem = this._items.find(i => i.productId.equals(productId));
        if (existingItem) {
            existingItem.quantity = existingItem.quantity.add(quantity);
            existingItem.unitPrice = unitPrice;
        } else {
            this._items.push(new PurchaseOrderItem(randomUUID(), productId, quantity, unitPrice));
        }
    }

    public updateItem(itemId: string, quantity: Quantity, unitPrice: MoneyAmount): void {
        this.verifyDraft();
        const item = this._items.find(i => i.id === itemId);
        if (!item) throw new ValidationError('Item not found');
        item.quantity = quantity;
        item.unitPrice = unitPrice;
    }

    public removeItem(itemId: string): void {
        this.verifyDraft();
        const index = this._items.findIndex(i => i.id === itemId);
        if (index === -1) throw new ValidationError('Item not found');
        this._items.splice(index, 1);
    }

    public approve(): void {
        this.verifyDraft();
        if (this._items.length === 0) throw new ValidationError('Cannot approve an empty purchase order');
        this._status = PurchaseStatus.APPROVED;
        this.addDomainEvent(new PurchaseOrderApprovedEvent(this.id, this._organizationId, this._branchId));
    }

    public markAsReceived(): void {
        if (this._status !== PurchaseStatus.APPROVED && this._status !== PurchaseStatus.RECEIVED) {
            throw new ValidationError('Can only receive approved or partially received purchase orders');
        }
        
        // Ensure all items are fully received before marking complete
        const allReceived = this._items.every(i => i.receivedQuantity.value >= i.quantity.value);
        if (allReceived) {
            this._status = PurchaseStatus.COMPLETED;
            this.addDomainEvent(new PurchaseCompletedEvent(this.id, this._organizationId, this._branchId));
        } else {
            this._status = PurchaseStatus.RECEIVED; // Partial receipt
        }
    }

    public receiveItemQuantity(productId: ProductId, receivedQty: Quantity): void {
        if (this._status !== PurchaseStatus.APPROVED && this._status !== PurchaseStatus.RECEIVED) {
            throw new ValidationError('Can only receive items for approved orders');
        }
        const item = this._items.find(i => i.productId.equals(productId));
        if (!item) throw new ValidationError('Item not found in purchase order');
        
        item.receivedQuantity = item.receivedQuantity.add(receivedQty);
        
        // Ensure we don't receive more than ordered? The system can allow over-receipt if needed, 
        // but let's keep it simple or strictly enforce limits depending on business rules.
        // For now, allow it to just accumulate.
    }

    public cancel(): void {
        if (this._status === PurchaseStatus.CANCELLED) throw new ValidationError('Order is already cancelled');
        if (this._status === PurchaseStatus.COMPLETED) throw new ValidationError('Cannot cancel completed order');
        if (this._status === PurchaseStatus.RECEIVED) throw new ValidationError('Cannot cancel partially received order');
        
        this._status = PurchaseStatus.CANCELLED;
        this.addDomainEvent(new PurchaseCancelledEvent(this.id, this._organizationId, this._branchId));
    }

    private verifyDraft(): void {
        if (this._status !== PurchaseStatus.DRAFT) {
            throw new ValidationError('Operation only allowed on DRAFT purchase orders');
        }
    }

    public get totalAmount(): PurchaseTotal {
        const total = this._items.reduce((sum, item) => sum + item.total.value, 0);
        return PurchaseTotal.create(total);
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get branchId(): BranchId { return this._branchId; }
    public get supplierId(): SupplierId { return this._supplierId; }
    public get createdBy(): UserId { return this._createdBy; }
    public get items(): ReadonlyArray<PurchaseOrderItem> { return this._items; }
    public get status(): PurchaseStatus { return this._status; }
    public get createdAt(): Date { return this._createdAt; }
}
