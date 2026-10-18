import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { SalesOrderId } from '../../shared/valueobjects/SalesOrderId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { UserId } from '../../iam/value-objects/UserId';
import { ProductId } from '../../shared/valueobjects/ProductId';
import { Quantity } from '../../shared/valueobjects/Quantity';
import { MoneyAmount } from '../../shared/valueobjects/MoneyAmount';
import { SalesOrderStatus } from '../types/SalesTypes';
import { ValidationError } from '../../shared/errors/ValidationError';
import { SalesOrderCreatedEvent, SalesCompletedEvent, SalesCancelledEvent } from '../events/SalesEvents';
import { randomUUID } from 'crypto';

export class SalesOrderItem {
    constructor(
        public readonly id: string,
        public readonly productId: ProductId,
        public quantity: Quantity,
        public unitPrice: MoneyAmount,
        public discount: MoneyAmount,
        public tax: MoneyAmount
    ) {}

    public get total(): MoneyAmount {
        const subtotal = this.unitPrice.value * this.quantity.value;
        const total = subtotal - this.discount.value + this.tax.value;
        return MoneyAmount.create(total > 0 ? total : 0);
    }
}

export class SalesOrder extends AggregateRoot<SalesOrderId> {
    private readonly _organizationId: OrganizationId;
    private readonly _branchId: BranchId;
    private readonly _staffId: UserId;
    private _items: SalesOrderItem[];
    private _status: SalesOrderStatus;
    private readonly _createdAt: Date;

    private constructor(
        id: SalesOrderId,
        organizationId: OrganizationId,
        branchId: BranchId,
        staffId: UserId,
        items: SalesOrderItem[],
        status: SalesOrderStatus,
        createdAt: Date
    ) {
        super(id);
        this._organizationId = organizationId;
        this._branchId = branchId;
        this._staffId = staffId;
        this._items = items;
        this._status = status;
        this._createdAt = createdAt;
    }

    public static create(
        id: SalesOrderId,
        organizationId: OrganizationId,
        branchId: BranchId,
        staffId: UserId
    ): SalesOrder {
        const order = new SalesOrder(id, organizationId, branchId, staffId, [], SalesOrderStatus.DRAFT, new Date());
        order.addDomainEvent(new SalesOrderCreatedEvent(id, organizationId, branchId));
        return order;
    }

    public static load(
        id: SalesOrderId,
        organizationId: OrganizationId,
        branchId: BranchId,
        staffId: UserId,
        items: SalesOrderItem[],
        status: SalesOrderStatus,
        createdAt: Date
    ): SalesOrder {
        return new SalesOrder(id, organizationId, branchId, staffId, items, status, createdAt);
    }

    public addItem(productId: ProductId, quantity: Quantity, unitPrice: MoneyAmount, discount: MoneyAmount, tax: MoneyAmount): void {
        this.verifyDraft();
        const existingItem = this._items.find(i => i.productId.equals(productId));
        if (existingItem) {
            existingItem.quantity = existingItem.quantity.add(quantity);
            existingItem.unitPrice = unitPrice; // Optional: update prices
            existingItem.discount = existingItem.discount.add(discount);
            existingItem.tax = existingItem.tax.add(tax);
        } else {
            this._items.push(new SalesOrderItem(randomUUID(), productId, quantity, unitPrice, discount, tax));
        }
    }

    public removeItem(itemId: string): void {
        this.verifyDraft();
        const index = this._items.findIndex(i => i.id === itemId);
        if (index === -1) throw new ValidationError('Item not found');
        this._items.splice(index, 1);
    }

    public updateItem(itemId: string, quantity: Quantity, unitPrice: MoneyAmount, discount: MoneyAmount, tax: MoneyAmount): void {
        this.verifyDraft();
        const item = this._items.find(i => i.id === itemId);
        if (!item) throw new ValidationError('Item not found');
        item.quantity = quantity;
        item.unitPrice = unitPrice;
        item.discount = discount;
        item.tax = tax;
    }

    public complete(): void {
        if (this._status === SalesOrderStatus.COMPLETED) throw new ValidationError('Order is already completed');
        if (this._status === SalesOrderStatus.CANCELLED) throw new ValidationError('Cannot complete cancelled order');
        if (this._items.length === 0) throw new ValidationError('Cannot complete an empty order');
        
        this._status = SalesOrderStatus.COMPLETED;
        this.addDomainEvent(new SalesCompletedEvent(this.id, this._organizationId, this._branchId));
    }

    public cancel(): void {
        if (this._status === SalesOrderStatus.CANCELLED) throw new ValidationError('Order is already cancelled');
        if (this._status === SalesOrderStatus.COMPLETED) throw new ValidationError('Cannot cancel completed order');
        
        this._status = SalesOrderStatus.CANCELLED;
        this.addDomainEvent(new SalesCancelledEvent(this.id, this._organizationId, this._branchId));
    }

    public confirm(): void {
        this.verifyDraft();
        if (this._items.length === 0) throw new ValidationError('Cannot confirm an empty order');
        this._status = SalesOrderStatus.CONFIRMED;
    }

    private verifyDraft(): void {
        if (this._status !== SalesOrderStatus.DRAFT) {
            throw new ValidationError('Operation only allowed on DRAFT orders');
        }
    }

    public get totalAmount(): MoneyAmount {
        const total = this._items.reduce((sum, item) => sum + item.total.value, 0);
        return MoneyAmount.create(total);
    }

    public get items(): ReadonlyArray<SalesOrderItem> { return this._items; }
    public get organizationId(): OrganizationId { return this._organizationId; }
    public get branchId(): BranchId { return this._branchId; }
    public get staffId(): UserId { return this._staffId; }
    public get status(): SalesOrderStatus { return this._status; }
    public get createdAt(): Date { return this._createdAt; }
}
