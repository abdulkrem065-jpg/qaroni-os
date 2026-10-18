import { EntityId } from './EntityId';
export class StockMovementId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
