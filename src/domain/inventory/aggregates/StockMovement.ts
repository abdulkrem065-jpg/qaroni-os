import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { StockMovementId } from '../../shared/valueobjects/StockMovementId';
import { InventoryItemId } from '../../shared/valueobjects/InventoryItemId';
import { Quantity } from '../../shared/valueobjects/Quantity';
import { StockMovementType } from '../types/InventoryTypes';
import { UserId } from '../../iam/value-objects/UserId';

export class StockMovement extends AggregateRoot<StockMovementId> {
    private readonly _inventoryItemId: InventoryItemId;
    private readonly _type: StockMovementType;
    private readonly _quantity: Quantity;
    private readonly _notes: string;
    private readonly _performedBy: UserId;
    private readonly _createdAt: Date;

    private constructor(
        id: StockMovementId,
        inventoryItemId: InventoryItemId,
        type: StockMovementType,
        quantity: Quantity,
        notes: string,
        performedBy: UserId,
        createdAt: Date
    ) {
        super(id);
        this._inventoryItemId = inventoryItemId;
        this._type = type;
        this._quantity = quantity;
        this._notes = notes;
        this._performedBy = performedBy;
        this._createdAt = createdAt;
    }

    public static create(
        id: StockMovementId,
        inventoryItemId: InventoryItemId,
        type: StockMovementType,
        quantity: Quantity,
        notes: string,
        performedBy: UserId
    ): StockMovement {
        return new StockMovement(id, inventoryItemId, type, quantity, notes, performedBy, new Date());
    }

    public static load(
        id: StockMovementId,
        inventoryItemId: InventoryItemId,
        type: StockMovementType,
        quantity: Quantity,
        notes: string,
        performedBy: UserId,
        createdAt: Date
    ): StockMovement {
        return new StockMovement(id, inventoryItemId, type, quantity, notes, performedBy, createdAt);
    }

    public get inventoryItemId(): InventoryItemId { return this._inventoryItemId; }
    public get type(): StockMovementType { return this._type; }
    public get quantity(): Quantity { return this._quantity; }
    public get notes(): string { return this._notes; }
    public get performedBy(): UserId { return this._performedBy; }
    public get createdAt(): Date { return this._createdAt; }
}
