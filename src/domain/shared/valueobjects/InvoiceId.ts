import { EntityId } from './EntityId';
export class InvoiceId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
