import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { InventoryItemId } from '../../shared/valueobjects/InventoryItemId';
import { ProductId } from '../../shared/valueobjects/ProductId';
import { OrganizationId } from '../../shared/valueobjects/OrganizationId';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { Quantity } from '../../shared/valueobjects/Quantity';
import { ReorderLevel } from '../../shared/valueobjects/ReorderLevel';
import { WarehouseLocationId } from '../../shared/valueobjects/WarehouseLocationId';
import { ValidationError } from '../../shared/errors/ValidationError';
import { 
    StockReceivedEvent, 
    StockIssuedEvent, 
    StockTransferredEvent, 
    StockAdjustedEvent,
    InventoryLowEvent,
    InventoryOutOfStockEvent
} from '../events/InventoryEvents';

export class InventoryItem extends AggregateRoot<InventoryItemId> {
    private readonly _organizationId: OrganizationId;
    private readonly _branchId: BranchId;
    private readonly _productId: ProductId;
    private _quantity: Quantity;
    private _reservedQuantity: Quantity;
    private _reorderLevel: ReorderLevel;
    private _locationId: WarehouseLocationId | null;

    private constructor(
        id: InventoryItemId,
        organizationId: OrganizationId,
        branchId: BranchId,
        productId: ProductId,
        quantity: Quantity,
        reservedQuantity: Quantity,
        reorderLevel: ReorderLevel,
        locationId: WarehouseLocationId | null
    ) {
        super(id);
        this._organizationId = organizationId;
        this._branchId = branchId;
        this._productId = productId;
        this._quantity = quantity;
        this._reservedQuantity = reservedQuantity;
        this._reorderLevel = reorderLevel;
        this._locationId = locationId;
    }

    public static create(
        id: InventoryItemId,
        organizationId: OrganizationId,
        branchId: BranchId,
        productId: ProductId,
        reorderLevel: ReorderLevel,
        locationId: WarehouseLocationId | null = null
    ): InventoryItem {
        return new InventoryItem(
            id, 
            organizationId, 
            branchId, 
            productId, 
            Quantity.create(0), 
            Quantity.create(0), 
            reorderLevel, 
            locationId
        );
    }

    public static load(
        id: InventoryItemId,
        organizationId: OrganizationId,
        branchId: BranchId,
        productId: ProductId,
        quantity: Quantity,
        reservedQuantity: Quantity,
        reorderLevel: ReorderLevel,
        locationId: WarehouseLocationId | null
    ): InventoryItem {
        return new InventoryItem(id, organizationId, branchId, productId, quantity, reservedQuantity, reorderLevel, locationId);
    }

    public receiveStock(amount: Quantity, isProductArchived: boolean): void {
        if (isProductArchived) {
            throw new ValidationError('Archived products cannot receive stock');
        }
        this._quantity = this._quantity.add(amount);
        this.addDomainEvent(new StockReceivedEvent(this.id, this._branchId, this._productId, amount));
    }

    public issueStock(amount: Quantity): void {
        const available = this.getAvailableQuantity();
        if (available.value < amount.value) {
            throw new ValidationError('Insufficient available stock to issue');
        }
        this._quantity = this._quantity.subtract(amount);
        this.addDomainEvent(new StockIssuedEvent(this.id, this._branchId, this._productId, amount));
        this.checkLowStock();
    }

    public transferStock(amount: Quantity, targetBranchId: BranchId): void {
        const available = this.getAvailableQuantity();
        if (available.value < amount.value) {
            throw new ValidationError('Insufficient available stock to transfer');
        }
        this._quantity = this._quantity.subtract(amount);
        this.addDomainEvent(new StockTransferredEvent(this.id, this._branchId, targetBranchId, this._productId, amount));
        this.checkLowStock();
    }

    public adjustStock(newQuantity: Quantity): void {
        const oldQuantity = this._quantity;
        if (newQuantity.value < this._reservedQuantity.value) {
            throw new ValidationError('Cannot adjust quantity below currently reserved amount');
        }
        this._quantity = newQuantity;
        this.addDomainEvent(new StockAdjustedEvent(this.id, this._branchId, this._productId, newQuantity, oldQuantity));
        this.checkLowStock();
    }

    public reserveStock(amount: Quantity): void {
        const available = this.getAvailableQuantity();
        if (available.value < amount.value) {
            throw new ValidationError('Insufficient available stock to reserve');
        }
        this._reservedQuantity = this._reservedQuantity.add(amount);
    }

    public releaseReservation(amount: Quantity): void {
        if (this._reservedQuantity.value < amount.value) {
            throw new ValidationError('Cannot release more than reserved');
        }
        this._reservedQuantity = this._reservedQuantity.subtract(amount);
    }

    private checkLowStock(): void {
        if (this._quantity.value === 0) {
            this.addDomainEvent(new InventoryOutOfStockEvent(this.id, this._branchId, this._productId));
        } else if (this._quantity.value <= this._reorderLevel.value) {
            this.addDomainEvent(new InventoryLowEvent(this.id, this._branchId, this._productId, this._quantity));
        }
    }

    public getAvailableQuantity(): Quantity {
        return Quantity.create(this._quantity.value - this._reservedQuantity.value);
    }

    public setLocation(locationId: WarehouseLocationId | null): void {
        this._locationId = locationId;
    }

    public updateReorderLevel(level: ReorderLevel): void {
        this._reorderLevel = level;
        this.checkLowStock();
    }

    public get organizationId(): OrganizationId { return this._organizationId; }
    public get branchId(): BranchId { return this._branchId; }
    public get productId(): ProductId { return this._productId; }
    public get quantity(): Quantity { return this._quantity; }
    public get reservedQuantity(): Quantity { return this._reservedQuantity; }
    public get reorderLevel(): ReorderLevel { return this._reorderLevel; }
    public get locationId(): WarehouseLocationId | null { return this._locationId; }
}
