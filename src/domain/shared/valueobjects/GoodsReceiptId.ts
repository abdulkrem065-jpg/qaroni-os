import { EntityId } from './EntityId';
export class GoodsReceiptId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
