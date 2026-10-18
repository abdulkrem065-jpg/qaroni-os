import { EntityId } from './EntityId';
export class ReceiptId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
