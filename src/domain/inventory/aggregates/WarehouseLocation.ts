import { AggregateRoot } from '../../shared/core/AggregateRoot';
import { WarehouseLocationId } from '../../shared/valueobjects/WarehouseLocationId';
import { BranchId } from '../../shared/valueobjects/BranchId';
import { ValidationError } from '../../shared/errors/ValidationError';

export class WarehouseLocation extends AggregateRoot<WarehouseLocationId> {
    private readonly _branchId: BranchId;
    private _name: string;
    private _isActive: boolean;

    private constructor(
        id: WarehouseLocationId,
        branchId: BranchId,
        name: string,
        isActive: boolean
    ) {
        super(id);
        this._branchId = branchId;
        this._name = name;
        this._isActive = isActive;
    }

    public static create(
        id: WarehouseLocationId,
        branchId: BranchId,
        name: string
    ): WarehouseLocation {
        if (!name || name.trim().length === 0) {
            throw new ValidationError('Location name cannot be empty');
        }
        return new WarehouseLocation(id, branchId, name.trim(), true);
    }

    public static load(
        id: WarehouseLocationId,
        branchId: BranchId,
        name: string,
        isActive: boolean
    ): WarehouseLocation {
        return new WarehouseLocation(id, branchId, name, isActive);
    }

    public get branchId(): BranchId { return this._branchId; }
    public get name(): string { return this._name; }
    public get isActive(): boolean { return this._isActive; }
}
