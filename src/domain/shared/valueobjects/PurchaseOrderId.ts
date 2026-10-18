import { EntityId } from './EntityId';
export class PurchaseOrderId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
