import { EntityId } from './EntityId';
export class PaymentId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
