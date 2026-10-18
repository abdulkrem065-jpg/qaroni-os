import { EntityId } from './EntityId';
export class PurchaseInvoiceId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
