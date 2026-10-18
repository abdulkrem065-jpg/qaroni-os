import { EntityId } from './EntityId';
export class ProductId extends EntityId {
    constructor(value: string) {
        super(value);
        Object.freeze(this);
    }
}
