import { EntityId } from './EntityId';
export class InventoryItemId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
