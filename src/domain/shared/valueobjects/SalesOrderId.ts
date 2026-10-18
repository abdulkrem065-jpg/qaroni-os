import { EntityId } from './EntityId';
export class SalesOrderId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
