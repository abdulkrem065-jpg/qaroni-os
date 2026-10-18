import { EntityId } from './EntityId';
export class WarehouseLocationId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
