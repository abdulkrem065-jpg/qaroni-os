import { IDomainEvent } from '../../shared/core/IDomainEvent';
import { InventoryItemId } from '../../shared/valueobjects/InventoryItemId';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { ProductId } from '../../shared/valueobjects/ProductId';
import { Quantity } from '../../shared/valueobjects/Quantity';

export class StockReceivedEvent implements IDomainEvent {
    public readonly eventName = 'StockReceivedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly inventoryItemId: InventoryItemId,
        public readonly branchId: BranchId,
        public readonly productId: ProductId,
        public readonly quantity: Quantity
    ) {}
}

export class StockIssuedEvent implements IDomainEvent {
    public readonly eventName = 'StockIssuedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly inventoryItemId: InventoryItemId,
        public readonly branchId: BranchId,
        public readonly productId: ProductId,
        public readonly quantity: Quantity
    ) {}
}

export class StockTransferredEvent implements IDomainEvent {
    public readonly eventName = 'StockTransferredEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly inventoryItemId: InventoryItemId,
        public readonly fromBranchId: BranchId,
        public readonly toBranchId: BranchId,
        public readonly productId: ProductId,
        public readonly quantity: Quantity
    ) {}
}

export class StockAdjustedEvent implements IDomainEvent {
    public readonly eventName = 'StockAdjustedEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly inventoryItemId: InventoryItemId,
        public readonly branchId: BranchId,
        public readonly productId: ProductId,
        public readonly newQuantity: Quantity,
        public readonly oldQuantity: Quantity
    ) {}
}

export class InventoryLowEvent implements IDomainEvent {
    public readonly eventName = 'InventoryLowEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly inventoryItemId: InventoryItemId,
        public readonly branchId: BranchId,
        public readonly productId: ProductId,
        public readonly currentQuantity: Quantity
    ) {}
}

export class InventoryOutOfStockEvent implements IDomainEvent {
    public readonly eventName = 'InventoryOutOfStockEvent';
    public readonly occurredOn: Date = new Date();
    constructor(
        public readonly inventoryItemId: InventoryItemId,
        public readonly branchId: BranchId,
        public readonly productId: ProductId
    ) {}
}
